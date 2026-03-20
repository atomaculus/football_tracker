import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "football_tracker_session";

export type ViewerSession = {
  isAdmin: boolean;
  playerId: string;
  playerName: string;
  role: "admin" | "player";
};

function getAuthConfig() {
  const secret = process.env.APP_SESSION_SECRET;
  const groupAccessCode = process.env.APP_GROUP_ACCESS_CODE;
  const adminAccessCode = process.env.APP_ADMIN_ACCESS_CODE;

  return {
    adminAccessCode,
    groupAccessCode,
    secret,
  };
}

export function hasSimpleAuthConfig() {
  const { groupAccessCode, secret } = getAuthConfig();

  return Boolean(groupAccessCode && secret);
}

export function verifyGroupAccessCode(code: string) {
  const { groupAccessCode } = getAuthConfig();

  return Boolean(groupAccessCode && code === groupAccessCode);
}

export function verifyAdminAccessCode(code: string) {
  const { adminAccessCode } = getAuthConfig();

  return Boolean(adminAccessCode && code === adminAccessCode);
}

function signPayload(payload: string) {
  const { secret } = getAuthConfig();

  if (!secret) {
    throw new Error("APP_SESSION_SECRET no esta configurado.");
  }

  return createHmac("sha256", secret).update(payload).digest("hex");
}

function encodeSession(session: ViewerSession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

function decodeSession(value: string) {
  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const providedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ViewerSession;

    if (!parsed.playerId || !parsed.playerName || !parsed.role) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function createViewerSession(session: ViewerSession) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearViewerSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}

export async function getViewerSession() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE)?.value;

  if (!rawSession || !hasSimpleAuthConfig()) {
    return null;
  }

  return decodeSession(rawSession);
}

export async function requireViewerSession(nextPath = "/confirmar") {
  const session = await getViewerSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}

export async function requireAdminSession(nextPath = "/admin") {
  const session = await requireViewerSession(nextPath);

  if (!session.isAdmin || session.role !== "admin") {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}
