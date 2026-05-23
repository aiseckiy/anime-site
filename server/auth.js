import jwt from "jsonwebtoken";
import { query } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function createToken(user) {
  return jwt.sign(
    { id: user.id, login: user.login, email: user.email },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "auth_required" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await query(
      "select id, login, email, role, avatar, banner, created_at from users where id = $1",
      [payload.id]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ error: "user_not_found" });
    }

    req.user = result.rows[0];
    return next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

export function publicUser(user) {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    role: user.role || "user",
    isAdmin: user.role === "admin",
    avatar: user.avatar || "",
    banner: user.banner || "",
    createdAt: user.created_at
  };
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "admin_required" });
  }
  return next();
}
