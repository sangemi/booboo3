type PostingMember = {
  role: string;
  emailVerified: Date | null;
  accounts: { provider: string }[];
};

export function postAccessError(member: PostingMember | null | undefined) {
  if (!member) return "LOGIN_REQUIRED";
  if (member.role === "SUSPENDED") return "ACCOUNT_SUSPENDED";
  if (!member.emailVerified && !member.accounts.some(({ provider }) => provider === "google" || provider === "kakao")) {
    return "EMAIL_VERIFICATION_REQUIRED";
  }
  return null;
}

export class PostAccessError extends Error {
  constructor(readonly code: NonNullable<ReturnType<typeof postAccessError>>) {
    super(code);
  }
}
