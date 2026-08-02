export const ADMIN_EMAILS = [
  "sangemi@daum.net",
  "ksaksk2112@gmail.com",
] as const;

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(
    email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number],
  );
}
