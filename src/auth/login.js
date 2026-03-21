const jwt = require("jsonwebtoken");

/** Demo credentials — replace with DB-backed auth in production. */
const DEMO_USER = {
  email: "admin@delivery.local",
  password: "delivery-demo",
};

/**
 * @param {{ email: string; password: string }} credentials
 * @returns {{ token: string; expiresIn: string }}
 */
function login(credentials) {
  const { email, password } = credentials;
  if (
    !email ||
    !password ||
    email !== DEMO_USER.email ||
    password !== DEMO_USER.password
  ) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET is not configured");
    err.statusCode = 500;
    throw err;
  }

  const token = jwt.sign({ sub: "demo-user", email }, secret, {
    expiresIn: "8h",
  });

  return { token, expiresIn: "8h" };
}

module.exports = { login };
