import { createHash } from "node:crypto";

export function canReadPostViews(email?: string | null) {
  return email?.trim().toLowerCase() === "sangemi@daum.net";
}

export function postViewKey(postId: string, visitor: string, now = new Date()) {
  const day = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return createHash("sha256").update(JSON.stringify([postId, visitor, day])).digest("hex");
}
