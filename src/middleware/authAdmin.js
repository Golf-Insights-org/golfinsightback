import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, env.ADMIN_JWT_SECRET);
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

