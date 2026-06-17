import { router } from './trpc';
import { messages } from './routes/messages';
import { typing } from './routes/typing';

export const appRouter = router({
  messages,
  typing,
});

export type AppRouter = typeof appRouter;
