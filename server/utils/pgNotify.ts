// PostgreSQL NOTIFY/LISTEN utility for real-time events
import postgres from 'postgres';
import { EventEmitter } from 'events';

const connectionString = process.env.NUXT_POSTGRES_URL || 'postgresql://pguser:pgpassword@localhost:5432/uxtweak';

// Separate connection for LISTEN (required by postgres.js - can't use same connection for queries and listen)
const listenClient = postgres(connectionString);

// Query client for NOTIFY
const notifyClient = postgres(connectionString);

// Event emitter for subscriptions
export const pgEvents = new EventEmitter();
pgEvents.setMaxListeners(1000); // Allow many subscribers

// Channel names
export const PG_CHANNELS = {
  NEW_MESSAGE: 'new_message',
  TYPING: 'typing',
} as const;

// Initialize listeners
let initialized = false;

export async function initPgListeners() {
  if (initialized) return;
  initialized = true;

  // Listen for new messages
  await listenClient.listen(PG_CHANNELS.NEW_MESSAGE, (payload) => {
    try {
      const data = JSON.parse(payload) as NewMessagePayload;
      pgEvents.emit(PG_CHANNELS.NEW_MESSAGE, data);
    } catch (err) {
      console.error('[pgNotify] Failed to parse new_message payload:', err);
    }
  });

  // Listen for typing events
  await listenClient.listen(PG_CHANNELS.TYPING, (payload) => {
    try {
      const data = JSON.parse(payload) as TypingPayload;
      pgEvents.emit(PG_CHANNELS.TYPING, data);
    } catch (err) {
      console.error('[pgNotify] Failed to parse typing payload:', err);
    }
  });

  console.log('[pgNotify] Listening for PostgreSQL notifications');
}

// Send a notification
export async function notify<T>(channel: string, payload: T): Promise<void> {
  const payloadStr = JSON.stringify(payload);
  await notifyClient`SELECT pg_notify(${channel}, ${payloadStr})`;
}

// Cleanup
export async function closePgListeners() {
  await listenClient.end();
  await notifyClient.end();
}

// Message types
export interface NewMessagePayload {
  id: number;
  author: string;
  message: string;
  createdAt: string;
}

export interface TypingPayload {
  username: string;
  isTyping: boolean;
}
