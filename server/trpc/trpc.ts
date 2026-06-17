import { H3Event } from 'h3';
import { initTRPC } from '@trpc/server';

export function createContext(event: H3Event) {
  return {
    db,
    event,
  };
}

export type Context = ReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
