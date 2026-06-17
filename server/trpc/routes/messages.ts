import { z } from 'zod';
import { observable } from '@trpc/server/observable';
import { desc } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { messages as messagesSchema } from '../../../db/schema';

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

      const result = await ctx.db
        .select()
        .from(messagesSchema)
        .orderBy(desc(messagesSchema.createdAt))
        .limit(limit)
        .offset(offset);

      // Return in chronological order for display
      return result.reverse();
    }),

  // Mutation: Post a new message
  post: publicProcedure.input(z.object({ message: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    // TODO get user id
    const result = await ctx.db
      .insert(messagesSchema)
      .values({
        author: input.author,
        message: input.message,
      })
      .returning();

    const newMessage = result[0];
    if (!newMessage) {
      throw new Error('Failed to insert message');
    }

    // TODO PG notify

    return newMessage;
  }),

  // Subscription: Listen for new messagesSchema
  on: publicProcedure.subscription(() => {
    return observable<{ id: number; author: string; message: string; createdAt: Date }>((emit) => {
      const onNewMessage = (message: { id: number; author: string; message: string; createdAt: Date }) => {
        emit.next(message);
      };

      // TODO PG notify

      return;
    });
  }),
});
