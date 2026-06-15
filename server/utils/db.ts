import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../db/schema';

const connectionString = process.env.NUXT_POSTGRES_URL || 'postgresql://pguser:pgpassword@localhost:5432/bitship';

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
