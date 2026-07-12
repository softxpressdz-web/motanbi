import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema';

export const createPool = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalSocket = process.env.SQL_HOST && process.env.SQL_HOST.startsWith('/');

  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    ssl: (isProduction && !isLocalSocket) ? { rejectUnauthorized: false } : undefined,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
