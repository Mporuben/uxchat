import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter } from '../trpc/routes';
import { db } from '../utils/db';
import { validateWsToken } from '../utils/wsToken';
import type { Context } from '../trpc/trpc';

// Store authenticated user data per WebSocket connection
const connectionUserMap = new WeakMap<WebSocket, { sub: string; username?: string; name?: string } | null>();

let wss: WebSocketServer | null = null;

export default defineNitroPlugin((nitroApp) => {
  const port = parseInt(process.env.WS_PORT || '3001', 10);

  // Create WebSocket server on a separate port with custom verifyClient
  wss = new WebSocketServer({
    port,
    verifyClient: async (info, callback) => {
      try {
        const user = await authenticateConnection(info.req);

        if (!user) {
          console.log('[tRPC] WebSocket connection rejected: not authenticated');
          callback(false, 401, 'Unauthorized');
          return;
        }

        // Store user for later retrieval in createContext
        // We'll use a custom property on the request
        (info.req as any).__logtoUser = user;
        callback(true);
      } catch (error) {
        console.error('[tRPC] WebSocket verifyClient error:', error);
        callback(false, 500, 'Internal Server Error');
      }
    },
  });

  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: ({ req }): Context => {
      const user = (req as any).__logtoUser ?? null;
      return {
        db,
        user,
      };
    },
  });

  wss.on('connection', (ws, req) => {
    const user = (req as any).__logtoUser;
    connectionUserMap.set(ws, user);

    console.log(
      `[tRPC] WebSocket client connected (user: ${user?.username ?? user?.sub ?? 'unknown'}). Total: ${wss?.clients.size}`,
    );

    ws.on('close', () => {
      console.log(`[tRPC] WebSocket client disconnected. Total: ${wss?.clients.size}`);
    });
  });

  console.log(`[tRPC] WebSocket server listening on ws://localhost:${port}`);

  // Cleanup on shutdown
  nitroApp.hooks.hook('close', () => {
    handler.broadcastReconnectNotification();
    wss?.close();
  });
});

// ==========================> Utils

// Parse query params from URL
function parseQueryParams(url: string | undefined): Record<string, string> {
  const params: Record<string, string> = {};
  if (!url) return params;

  const queryStart = url.indexOf('?');
  if (queryStart === -1) return params;

  const query = url.slice(queryStart + 1);
  query.split('&').forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value ?? '');
    }
  });

  return params;
}

// Authenticate WebSocket connection using token (fallback for cross-port connections)
function authenticateWithToken(req: IncomingMessage): { sub: string; username?: string; name?: string } | null {
  const params = parseQueryParams(req.url);
  const token = params.token;

  if (!token) return null;

  return validateWsToken(token);
}

// Main authentication function - tries token first, then cookies
async function authenticateConnection(
  req: IncomingMessage,
): Promise<{ sub: string; username?: string; name?: string } | null> {
  // Try token-based auth first (more reliable for cross-port WebSocket)
  const tokenUser = authenticateWithToken(req);
  if (tokenUser) {
    return tokenUser;
  }
  throw 'User is not authenticated';
}
