import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};

export const getClient = () => pool.connect();

export default pool;