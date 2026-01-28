import { prisma } from "./db";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/diagnostic/start": { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  "/api/leads": { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  default: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  identifier: string,
  endpoint: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const windowStart = new Date(Date.now() - config.windowMs);

  // Try to find existing rate limit entry
  const existing = await prisma.rateLimitEntry.findUnique({
    where: {
      identifier_endpoint: {
        identifier,
        endpoint,
      },
    },
  });

  // If entry exists and is within the window
  if (existing && existing.windowStart > windowStart) {
    if (existing.requestCount >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.windowStart.getTime() + config.windowMs),
      };
    }

    // Increment counter
    await prisma.rateLimitEntry.update({
      where: { id: existing.id },
      data: { requestCount: { increment: 1 } },
    });

    return {
      allowed: true,
      remaining: config.maxRequests - existing.requestCount - 1,
      resetAt: new Date(existing.windowStart.getTime() + config.windowMs),
    };
  }

  // Create or reset entry
  await prisma.rateLimitEntry.upsert({
    where: {
      identifier_endpoint: {
        identifier,
        endpoint,
      },
    },
    create: {
      identifier,
      endpoint,
      requestCount: 1,
      windowStart: new Date(),
    },
    update: {
      requestCount: 1,
      windowStart: new Date(),
    },
  });

  return {
    allowed: true,
    remaining: config.maxRequests - 1,
    resetAt: new Date(Date.now() + config.windowMs),
  };
}

export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback (won't work in serverless but provides a default)
  return "unknown";
}

export async function cleanupExpiredRateLimits(): Promise<number> {
  // Delete entries older than the longest window (1 hour)
  const cutoff = new Date(Date.now() - 60 * 60 * 1000);

  const result = await prisma.rateLimitEntry.deleteMany({
    where: {
      windowStart: { lt: cutoff },
    },
  });

  return result.count;
}
