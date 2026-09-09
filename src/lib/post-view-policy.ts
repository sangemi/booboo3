import { createHash } from "node:crypto";
import { isAdminEmail } from "@/lib/admin-access";

export function canReadPostViews(email?: string | null) {
  return isAdminEmail(email);
}

export function postViewKey(postId: string, visitor: string, now = new Date()) {
  const day = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return createHash("sha256").update(JSON.stringify([postId, visitor, day])).digest("hex");
}

export function siteVisitKey(visitor: string, now = new Date()) {
  const day = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return createHash("sha256").update(JSON.stringify(["site", visitor, day])).digest("hex");
}
