import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { headers } from "next/headers";

export function generateInviteToken() {
  // 24 bytes => 32 chars base64url-ish after encoding; strong enough for URLs.
  return randomBytes(24).toString("base64url");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getInviteCryptoKey() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET não configurado");
  }
  // 32-byte key derived from secret
  return createHash("sha256").update(secret).digest();
}

export function encryptInviteToken(token: string) {
  const key = getInviteCryptoKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    tokenCiphertext: ciphertext.toString("base64"),
    tokenIv: iv.toString("base64"),
    tokenTag: tag.toString("base64"),
  };
}

export function decryptInviteToken(args: {
  tokenCiphertext: string;
  tokenIv: string;
  tokenTag: string;
}) {
  const key = getInviteCryptoKey();
  const iv = Buffer.from(args.tokenIv, "base64");
  const tag = Buffer.from(args.tokenTag, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(args.tokenCiphertext, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

export async function getRequestBaseUrl() {
  const h = await headers();
  const forwardedProto = h.get("x-forwarded-proto");
  const proto = forwardedProto?.split(",")[0]?.trim() || "http";
  const host = h.get("x-forwarded-host") || h.get("host");

  if (!host) {
    // Fallback for non-request contexts; callers can still use the path.
    return null;
  }

  return `${proto}://${host}`;
}
