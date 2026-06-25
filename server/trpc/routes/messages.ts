import { z } from 'zod';
import { observable } from '@trpc/server/observable';
import { desc } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { messages as messagesSchema } from '../../../db/schema';
import { notify, pgEvents, PG_CHANNELS, type NewMessagePayload, type TypingPayload } from '../../utils/pgNotify';

export const messages = router({
  // Query: Get all messages
  get: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      try {
        const result = await ctx.db
          .select()
          .from(messagesSchema)
          .orderBy(desc(messagesSchema.createdAt))
          .limit(limit)
          .offset(offset);

        // Return in chronological order for display
        return result.reverse();
      } catch (err) {
        console.log(err);
      }
    }),

  // Mutation: Post a new message
  post: protectedProcedure.input(z.object({ message: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const author = ctx.user.username ?? ctx.user.name ?? ctx.user.sub;

    const result = await ctx.db
      .insert(messagesSchema)
      .values({
        author,
        message: input.message,
      })
      .returning();

    const newMessage = result[0];
    if (!newMessage) {
      throw new Error('Failed to insert message');
    }

    // Notify all subscribers via PostgreSQL
    await notify<NewMessagePayload>(PG_CHANNELS.NEW_MESSAGE, {
      id: newMessage.id,
      author: newMessage.author,
      message: newMessage.message,
      createdAt: newMessage.createdAt.toISOString(),
    });

    return newMessage;
  }),

  // Subscription: Listen for new messages
  on: publicProcedure.subscription(() => {
    return observable<{ id: number; author: string; message: string; createdAt: Date }>((emit) => {
      const onNewMessage = (payload: NewMessagePayload) => {
        emit.next({
          id: payload.id,
          author: payload.author,
          message: payload.message,
          createdAt: new Date(payload.createdAt),
        });
      };

      pgEvents.on(PG_CHANNELS.NEW_MESSAGE, onNewMessage);

      return () => {
        pgEvents.off(PG_CHANNELS.NEW_MESSAGE, onNewMessage);
      };
    });
  }),
});
