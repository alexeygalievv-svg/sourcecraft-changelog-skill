require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const { login } = require("./auth/login");
const orders = require("./api/orders");

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10) || 3000;

app.use(express.json());

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "delivery-app" });
});

app.post("/auth/login", (req, res) => {
  try {
    const result = login({
      email: req.body?.email,
      password: req.body?.password,
    });
    res.json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message });
  }
});

app.get("/api/orders", authMiddleware, async (_req, res) => {
  try {
    const rows = await orders.listOrders();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", authMiddleware, async (req, res) => {
  try {
    const row = await orders.createOrder({
      customerName: req.body?.customerName,
      address: req.body?.address,
      status: req.body?.status,
    });
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/orders/:id", authMiddleware, async (req, res) => {
  try {
    const row = await orders.getOrderById(Number(req.params.id));
    if (!row) return res.status(404).json({ error: "Order not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/orders/:id", authMiddleware, async (req, res) => {
  try {
    const row = await orders.updateOrder(Number(req.params.id), {
      status: req.body?.status,
      address: req.body?.address,
      customerName: req.body?.customerName,
    });
    if (!row) return res.status(404).json({ error: "Order not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/orders/:id", authMiddleware, async (req, res) => {
  try {
    const ok = await orders.deleteOrder(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: "Order not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function main() {
  await orders.ensureOrdersTable();
  app.listen(PORT, () => {
    console.log(`delivery-app listening on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
