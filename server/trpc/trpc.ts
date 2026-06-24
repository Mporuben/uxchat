import { initTRPC, TRPCError } from '@trpc/server';
import type { db as DbType } from '../utils/db';

interface LogtoUser {
  sub: string;
  username?: string;
  name?: string;
}

export interface Context {
  db: typeof DbType;
  user: LogtoUser | null;
}

const t = initTRPC.context<Context>().create({});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Protected procedure that requires authentication
const isAuthenticated = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
