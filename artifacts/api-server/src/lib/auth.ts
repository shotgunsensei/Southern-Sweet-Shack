import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

export interface AdminUser {
  userId: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminUser;
}

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

export function signToken(payload: AdminUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AdminUser {
  return jwt.verify(token, JWT_SECRET) as AdminUser;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    (req as AuthenticatedRequest).adminUser = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
}
