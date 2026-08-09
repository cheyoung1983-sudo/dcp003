import { getDbPool } from '../db';

export const createUser = async (data: { email: string; name: string }) => {
  const pool = getDbPool();
  await pool.query(
    "INSERT INTO users (email, name) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name",
    [data.email, data.name]
  );
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [data.email]);
  return res.rows[0];
};

export const deleteUser = async (email: string) => {
  const pool = getDbPool();
  await pool.query("DELETE FROM users WHERE email = $1", [email]);
};
