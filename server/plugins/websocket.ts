import { WebSocketServer } from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter } from '../trpc/routes';
import { db } from '../utils/db';

let wss: WebSocketServer | null = null;

export default defineNitroPlugin((nitroApp) => {
  const port = parseInt(process.env.WS_PORT || '3001', 10);

  // Create WebSocket server on a separate port
  wss = new WebSocketServer({ port });

  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: () => ({
      db,
      event: null as any,
    }),
  });

  wss.on('connection', (ws) => {
    console.log(`[tRPC] WebSocket client connected. Total: ${wss?.clients.size}`);

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
