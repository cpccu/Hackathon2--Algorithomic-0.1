import {
  findUserByEmail,
  createUser,
  saveOtp,
  getOtp,
  incrementOtpAttempts,
  markOtpUsed,
  deleteOtp,
  createSession,
  UserRecord,
} from "@/lib/db";
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  checkRateLimit,
  signSessionToken,
} from "@/lib/security/crypto";
import { sendOtpEmail } from "@/lib/email/mailer";

export interface RequestOtpParams {
  email: string;
  purpose: "login" | "register";
  fullName?: string;
  studentId?: string;
  clientIp?: string;
}

export interface VerifyOtpParams {
  email: string;
  otp: string;
  purpose: "login" | "register";
  fullName?: string;
  studentId?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Request a 6-digit OTP for Login or Registration
 */
export async function requestOtp(
  params: RequestOtpParams
): Promise<{ success: boolean; error?: string; message?: string }> {
  const { email, purpose, fullName, studentId, clientIp } = params;

  // 1. Validate Email Format
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 2. IP & Email Rate Limiting (max 5 requests per 10 minutes)
  const rateLimitKey = `otp_req:${clientIp || "ip"}:${normalizedEmail}`;
  const rateLimit = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
    };
  }

  // 3. User existence validation based on purpose
  const existingUser = await findUserByEmail(normalizedEmail);

  if (purpose === "login") {
    if (!existingUser) {
      return {
        success: false,
        error: "No account found with this email. Please register first.",
      };
    }
  } else if (purpose === "register") {
    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in.",
      };
    }

    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: "Please provide your full name." };
    }

    if (!studentId || studentId.trim().length < 2) {
      return { success: false, error: "Please provide your student ID." };
    }
  }

  // 4. Cooldown verification check
  const priorOtp = await getOtp(normalizedEmail);
  if (priorOtp) {
    const elapsed = Date.now() - priorOtp.createdAt;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds}s before requesting another code.`,
      };
    }
    // Invalidate existing code
    await deleteOtp(normalizedEmail);
  }

  // 5. Generate secure 6-digit cryptographic OTP
  const rawOtp = generateOtp();
  const hashedOtp = hashOtp(normalizedEmail, rawOtp);

  // 6. Persist salted hash with expiry and zero attempt count
  await saveOtp({
    email: normalizedEmail,
    codeHash: hashedOtp,
    purpose,
    fullName: fullName?.trim(),
    studentId: studentId?.trim(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });

  // 7. Dispatch verification email
  const emailResult = await sendOtpEmail({
    to: normalizedEmail,
    otp: rawOtp,
    purpose,
  });

  if (!emailResult.success) {
    await deleteOtp(normalizedEmail);
    return {
      success: false,
      error: emailResult.error || "Failed to deliver verification email. Please try again.",
    };
  }

  return {
    success: true,
    message: "Verification code sent to your email.",
  };
}

/**
 * Verify 6-digit OTP and establish session
 */
export async function verifyOtp(
  params: VerifyOtpParams
): Promise<{
  success: boolean;
  error?: string;
  user?: UserRecord;
  sessionToken?: string;
}> {
  const { email, otp, purpose } = params;

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return { success: false, error: "Invalid email address." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = otp.trim();

  // Validate OTP structure
  if (!/^\d{6}$/.test(cleanOtp)) {
    return { success: false, error: "Please enter a valid 6-digit verification code." };
  }

  // Retrieve active OTP record
  const record = await getOtp(normalizedEmail);
  if (!record || record.used) {
    return {
      success: false,
      error: "This code has expired. Please request a new code.",
    };
  }

  // Check expiration explicitly
  if (Date.now() > record.expiresAt) {
    await deleteOtp(normalizedEmail);
    return {
      success: false,
      error: "This code has expired. Please request a new code.",
    };
  }

  // Verify purpose matches
  if (record.purpose !== purpose) {
    return {
      success: false,
      error: "Invalid authentication request context. Please try again.",
    };
  }

  // Verify maximum attempts
  if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    await deleteOtp(normalizedEmail);
    return {
      success: false,
      error: "Too many attempts. Please request a new code.",
    };
  }

  // Compare salted hash timing-safely
  const isValid = verifyOtpHash(normalizedEmail, cleanOtp, record.codeHash);

  if (!isValid) {
    const attempts = await incrementOtpAttempts(normalizedEmail);
    const remaining = MAX_VERIFICATION_ATTEMPTS - attempts;

    if (remaining <= 0) {
      await deleteOtp(normalizedEmail);
      return {
        success: false,
        error: "Too many attempts. Please request a new code.",
      };
    }

    return {
      success: false,
      error: `Invalid verification code. (${remaining} attempts remaining)`,
    };
  }

  // Code is verified: mark as used immediately (single-use guarantee)
  await markOtpUsed(normalizedEmail);

  let user: UserRecord | null = null;

  if (purpose === "register") {
    // Check again to prevent race condition duplicate creation
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      user = existing;
    } else {
      user = await createUser({
        name: record.fullName || params.fullName || "Student",
        email: normalizedEmail,
        studentId: record.studentId || params.studentId || "CU-000000",
      });
    }
  } else {
    user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return {
        success: false,
        error: "User record not found. Please register.",
      };
    }
  }

  // Create persistent session
  const session = await createSession(user.id, user.email);

  // Sign cryptographic session token
  const sessionToken = signSessionToken({
    sessionId: session.id,
    userId: user.id,
    email: user.email,
    expiresAt: session.expiresAt,
  });

  return {
    success: true,
    user,
    sessionToken,
  };
}
