import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { AdminUser, AdminRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

interface JWTPayload {
  userId: string;
  email: string;
  role: AdminRole;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: Pick<AdminUser, "id" | "email" | "role">): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.userId },
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    return admin;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}

export async function requireRole(allowedRoles: AdminRole[]): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (!allowedRoles.includes(admin.role)) {
    throw new Error("Forbidden");
  }
  return admin;
}

export function setAuthCookie(token: string): void {
  // This will be handled by the API route
}

export function clearAuthCookie(): void {
  // This will be handled by the API route
}

// Middleware helper to check auth from request headers
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Also check cookies in the request
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => c.split("="))
    );
    return cookies["admin_token"] || null;
  }

  return null;
}

export async function validateRequest(request: Request): Promise<AdminUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.userId },
  });

  if (!admin || !admin.isActive) {
    return null;
  }

  return admin;
}
