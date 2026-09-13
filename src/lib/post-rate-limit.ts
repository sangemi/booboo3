import { createHmac } from "node:crypto";
import { isIP } from "node:net";

const COOLDOWN_MS = 3 * 60 * 1000;

export class PostCooldownError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super("POST_COOLDOWN");
  }
}

export function postIpHash(ip: string, secret: string) {
  if (!secret || !isIP(ip)) return null;
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export function postRetryAfterSeconds(lastPostedAt: Date, now = new Date()) {
  return Math.max(0, Math.ceil((lastPostedAt.getTime() + COOLDOWN_MS - now.getTime()) / 1000));
}
