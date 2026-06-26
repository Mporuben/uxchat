import { createTRPCClient, wsLink, createWSClient } from '@trpc/client';

// Fetch WebSocket auth token from API
async function fetchWsToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/ws-token');
    if (!response.ok) {
      console.log('[tRPC] Failed to fetch WS token:', response.status);
      return null;
    }
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('[tRPC] Error fetching WS token:', error);
    return null;
  }
}

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') {
    return;
  }

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 3;

  // Use a function for URL to fetch fresh token on each connection attempt
  const wsClient = createWSClient({
    url: async () => {
      const token = await fetchWsToken();
      if (!token) {
        throw new Error('Failed to get WS auth token');
      }
      const config = useRuntimeConfig();

      return `${config.public.api}?token=${encodeURIComponent(token)}`;
    },
    onOpen: () => {
      console.log('[tRPC] WebSocket connected');
      reconnectAttempts = 0;
    },
    onClose: (cause) => {
      console.log('[tRPC] WebSocket closed', cause);

      // Check if connection was rejected due to authentication
      // WebSocket close code 1008 = Policy Violation (often used for auth failures)
      if (cause?.code === 1008 || cause?.code === 4401) {
        console.log('[tRPC] Authentication failed, redirecting to login');
        window.location.href = '/login';
        return;
      }

      reconnectAttempts++;
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('[tRPC] Max reconnect attempts reached, redirecting to login');
        window.location.href = '/login';
      }
    },
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
