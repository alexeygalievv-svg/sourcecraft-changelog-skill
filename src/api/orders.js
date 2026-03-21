const { Pool } = require("pg");

let pool;

function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not configured");
    }
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

async function ensureOrdersTable() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        address TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  } finally {
    client.release();
  }
}

/**
 * @param {{ customerName: string; address: string; status?: string }} payload
 */
async function createOrder(payload) {
  const { customerName, address, status = "pending" } = payload;
  const result = await getPool().query(
    `INSERT INTO orders (customer_name, address, status)
     VALUES ($1, $2, $3)
     RETURNING id, customer_name, address, status, created_at`,
    [customerName, address, status]
  );
  return result.rows[0];
}

async function listOrders() {
  const result = await getPool().query(
    `SELECT id, customer_name, address, status, created_at
     FROM orders
     ORDER BY created_at DESC`
  );
  return result.rows;
}

async function getOrderById(id) {
  const result = await getPool().query(
    `SELECT id, customer_name, address, status, created_at
     FROM orders WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

/**
 * @param {number} id
 * @param {{ status?: string; address?: string; customerName?: string }} updates
 */
async function updateOrder(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;

  if (updates.status !== undefined) {
    fields.push(`status = $${i++}`);
    values.push(updates.status);
  }
  if (updates.address !== undefined) {
    fields.push(`address = $${i++}`);
    values.push(updates.address);
  }
  if (updates.customerName !== undefined) {
    fields.push(`customer_name = $${i++}`);
    values.push(updates.customerName);
  }

  if (fields.length === 0) {
    return getOrderById(id);
  }

  values.push(id);
  const result = await getPool().query(
    `UPDATE orders SET ${fields.join(", ")}
     WHERE id = $${i}
     RETURNING id, customer_name, address, status, created_at`,
    values
  );
  return result.rows[0] ?? null;
}

async function deleteOrder(id) {
  const result = await getPool().query(
    `DELETE FROM orders WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  ensureOrdersTable,
  createOrder,
  listOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
