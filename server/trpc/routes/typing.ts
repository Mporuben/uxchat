import { observable } from '@trpc/server/observable';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const typing = router({
  // Mutation: Send typing indicator
  set: protectedProcedure.input(z.object({ isTyping: z.boolean() })).mutation(async ({ ctx, input }) => {
    const username = ctx.user.username ?? ctx.user.name ?? ctx.user.sub;

    await notify<TypingPayload>(PG_CHANNELS.TYPING, {
      username,
      isTyping: input.isTyping,
    });

    return { success: true };
  }),

  // Subscription: Listen for typing indicators
  on: publicProcedure.subscription(() => {
    return observable<{ username: string; isTyping: boolean }>((emit) => {
      const onTyping = (payload: TypingPayload) => {
        emit.next(payload);
      };

      pgEvents.on(PG_CHANNELS.TYPING, onTyping);

      return () => {
        pgEvents.off(PG_CHANNELS.TYPING, onTyping);
      };
    });
  }),
});
