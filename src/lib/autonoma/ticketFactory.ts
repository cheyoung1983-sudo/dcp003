import { getDbPool } from '../db';

export const createTicket = async (data: {
  userId: string;
  customerName: string;
  device: string;
  issueType: string;
  quotedPrice: number;
  tax: number;
  discount: number;
  total: number;
}) => {
  const pool = getDbPool();
  const id = `DSC-${Math.floor(1000 + Math.random() * 9000)}`;
  await pool.query(
    'INSERT INTO tickets (id, "customerName", device, "issueType", status, "quotedPrice", tax, discount, total, "userId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
    [id, data.customerName, data.device, data.issueType, "open", data.quotedPrice, data.tax, data.discount, data.total, data.userId]
  );
  const res = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
  return res.rows[0];
};

export const deleteTicket = async (id: string) => {
  const pool = getDbPool();
  await pool.query('DELETE FROM tickets WHERE id = $1', [id]);
};
