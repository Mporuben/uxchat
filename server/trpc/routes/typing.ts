import { observable } from '@trpc/server/observable';
import { router, publicProcedure } from '../trpc';

export const typing = router({
  // Mutation: Signal that user is typing
  set: publicProcedure.mutation(({ input }) => {
    // TODO PG notify and get user ID
    return { success: true };
  }),
  // Subscription: Listen for typing indicators
  on: publicProcedure.subscription(() => {
    return observable<{ author: string; isTyping: boolean }>((emit) => {
      const onTyping = (data: { author: string; isTyping: boolean }) => {
        emit.next(data);
      };

      // TODO PG notify

      return;
    });
  }),
});
