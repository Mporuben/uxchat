import { createTRPCClient, wsLink, createWSClient } from '@trpc/client';

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') {
    return;
  }

  const wsClient = createWSClient({
    url: `ws://${window.location.hostname}:3001`,
  });

  const trpc = createTRPCClient({
    links: [
      wsLink({
        client: wsClient,
      }),
    ],
  });

  return {
    provide: {
      trpc,
    },
  };
});
