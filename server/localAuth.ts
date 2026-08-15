import { createHash, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import nodemailer from "nodemailer";
import type { User } from "../drizzle/schema";
import * as db from "./db";

const SESSION_ISSUER = "morroblog.local";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_CODES_PER_HOUR = 5;
const MAX_CODE_ATTEMPTS = 5;

export class LocalAuthError extends Error {
  constructor(public readonly code: "BAD_REQUEST" | "CONFLICT" | "TOO_MANY_REQUESTS" | "UNAUTHORIZED" | "INTERNAL_SERVER_ERROR", message: string) {
    super(message);
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isConfiguredInitialAdmin(email: string) {
  const configuredEmail = process.env.INITIAL_ADMIN_EMAIL;
  if (!configuredEmail) return false;
  return normalizeEmail(email) === normalizeEmail(configuredEmail);
}

function sessionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new LocalAuthError("INTERNAL_SERVER_ERROR", "会话密钥未配置");
  return new TextEncoder().encode(secret);
}

function verificationHash(email: string, code: string) {
  return createHash("sha256").update(`${normalizeEmail(email)}:${code}:${process.env.JWT_SECRET ?? ""}`).digest("hex");
}

function parseCookie(header: string | undefined, name: string) {
  if (!header) return undefined;
  return header.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

export async function issueLocalSession(user: User) {
  return new SignJWT({ uid: user.id, kind: "email-password" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(SESSION_ISSUER)
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionKey());
}

export async function authenticateLocalRequest(req: Request): Promise<User | null> {
  const token = parseCookie(req.headers.cookie, "app_session_id");
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"], issuer: SESSION_ISSUER });
    const id = Number(payload.uid);
    if (!Number.isSafeInteger(id) || id <= 0 || payload.kind !== "email-password") return null;
    return (await db.getUserById(id)) ?? null;
  } catch {
    return null;
  }
}

function transporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) throw new LocalAuthError("INTERNAL_SERVER_ERROR", "邮件服务未配置");
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendVerificationEmail(email: string, code: string) {
  await transporter().sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: email,
    subject: "MorroBlog 注册验证码",
    text: `你的 MorroBlog 注册验证码是：${code}\n\n验证码 10 分钟内有效。若不是你本人操作，请忽略此邮件。`,
  });
}

export async function requestRegistrationCode(rawEmail: string) {
  const email = normalizeEmail(rawEmail);
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new LocalAuthError("BAD_REQUEST", "请输入有效的邮箱地址");
  if (await db.getUserByEmail(email)) throw new LocalAuthError("CONFLICT", "该邮箱已注册，请直接登录");

  const now = new Date();
  const latest = await db.getLatestEmailVerification(email);
  if (latest && now.getTime() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new LocalAuthError("TOO_MANY_REQUESTS", "验证码已发送，请 60 秒后再试");
  }
  if (await db.countRecentEmailVerifications(email, new Date(now.getTime() - 60 * 60 * 1000)) >= MAX_CODES_PER_HOUR) {
    throw new LocalAuthError("TOO_MANY_REQUESTS", "该邮箱请求过于频繁，请稍后再试");
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await sendVerificationEmail(email, code);
  await db.createEmailVerification({ email, codeHash: verificationHash(email, code), expiresAt: new Date(now.getTime() + CODE_TTL_MS) });
  return { sent: true, cooldownSeconds: RESEND_COOLDOWN_MS / 1000 } as const;
}

export async function registerWithEmail(input: { email: string; code: string; password: string; name?: string }) {
  const email = normalizeEmail(input.email);
  if (!/^\d{6}$/.test(input.code)) throw new LocalAuthError("BAD_REQUEST", "验证码应为 6 位数字");
  if (input.password.length < 10 || input.password.length > 72) throw new LocalAuthError("BAD_REQUEST", "密码长度应为 10 至 72 个字符");
  if (await db.getUserByEmail(email)) throw new LocalAuthError("CONFLICT", "该邮箱已注册，请直接登录");

  const verification = await db.getLatestEmailVerification(email);
  if (!verification || verification.expiresAt.getTime() < Date.now()) throw new LocalAuthError("BAD_REQUEST", "验证码无效或已过期");
  if (verification.attempts >= MAX_CODE_ATTEMPTS) throw new LocalAuthError("TOO_MANY_REQUESTS", "验证码尝试次数过多，请重新获取");

  const expected = Buffer.from(verification.codeHash, "hex");
  const received = Buffer.from(verificationHash(email, input.code), "hex");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    await db.incrementEmailVerificationAttempts(verification.id);
    throw new LocalAuthError("BAD_REQUEST", "验证码错误");
  }

  await db.markEmailVerificationUsed(verification.id);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await db.createLocalUser({
    openId: `local_${randomUUID()}`,
    email,
    passwordHash,
    name: input.name?.trim() || null,
    role: isConfiguredInitialAdmin(email) ? "admin" : "user",
  });
  if (!user) throw new LocalAuthError("INTERNAL_SERVER_ERROR", "注册失败，请稍后再试");

  return { user, token: await issueLocalSession(user) };
}

export async function loginWithEmail(rawEmail: string, password: string) {
  const email = normalizeEmail(rawEmail);
  const user = await db.getUserByEmail(email);
  if (!user?.passwordHash || !user.emailVerifiedAt) throw new LocalAuthError("UNAUTHORIZED", "邮箱或密码错误");
  if (!(await bcrypt.compare(password, user.passwordHash))) throw new LocalAuthError("UNAUTHORIZED", "邮箱或密码错误");
  await db.touchUserLastSignedIn(user.id);
  return { user, token: await issueLocalSession(user) };
}
