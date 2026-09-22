import assert from "node:assert/strict";
import { postAccessError } from "../src/lib/post-access";

const member = { role: "MEMBER", emailVerified: null, accounts: [] };
assert.equal(postAccessError(null), "LOGIN_REQUIRED");
assert.equal(postAccessError(undefined), "LOGIN_REQUIRED");
assert.equal(postAccessError(member), "EMAIL_VERIFICATION_REQUIRED");
assert.equal(postAccessError({ ...member, role: "ADMIN" }), "EMAIL_VERIFICATION_REQUIRED");
assert.equal(postAccessError({ ...member, emailVerified: new Date() }), null);
for (const provider of ["google", "kakao"]) {
  assert.equal(postAccessError({ ...member, accounts: [{ provider }] }), null);
  assert.equal(postAccessError({ ...member, role: "SUSPENDED", emailVerified: new Date(), accounts: [{ provider }] }), "ACCOUNT_SUSPENDED");
}
assert.equal(postAccessError({ ...member, accounts: [{ provider: "credentials" }] }), "EMAIL_VERIFICATION_REQUIRED");
console.log("Post access checks passed (10 cases).");
