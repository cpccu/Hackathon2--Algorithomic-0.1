import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "campusos-production-default-secret-salt-2026";

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export function generateOtp(): string {
  const code = crypto.randomInt(100000, 1000000);
  return code.toString();
}

/**
 * Calculate salted SHA-256 hash for OTP
 * Plaintext OTP is NEVER stored in database.
 */
export function hashOtp(email: string, otp: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  return crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${normalizedEmail}:${otp}`)
    .digest("hex");
}

/**
 * Timing-safe comparison of OTP hash to prevent timing attacks
 */
export function verifyOtpHash(email: string, candidateOtp: string, expectedHash: string): boolean {
  const candidateHash = hashOtp(email, candidateOtp.trim());
  const candidateBuf = Buffer.from(candidateHash, "hex");
  const expectedBuf = Buffer.from(expectedHash, "hex");

  if (candidateBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuf, expectedBuf);
}

/**
 * Sign session data with HMAC SHA-256
 */
export function signSessionToken(payload: { sessionId: string; userId: string; email: string; expiresAt: number }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): { sessionId: string; userId: string; email: string; expiresAt: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [data, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const json = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (json.expiresAt && Date.now() > json.expiresAt) {
      return null;
    }

    return json;
  } catch {
    return null;
  }
}

// In-memory sliding window rate limiter
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Rate limit check: returns true if allowed, false if limit exceeded
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);
  return { allowed: true, retryAfterSeconds: 0 };
}
