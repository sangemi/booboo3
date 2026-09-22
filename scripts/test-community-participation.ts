import assert from "node:assert/strict";
import { participationSource, summarizeParticipation } from "../src/lib/community-participation";

const member = { id: "post-1", authorName: "익명의 부부", author: { id: "member-1", email: "member@example.com", role: "MEMBER" } };
assert.equal(participationSource(member), "member");
assert.equal(participationSource({ ...member, author: null }), "unidentified");
for (const name of ["운영자A", "운영자I", "부부라이프 AI 운영자"]) {
  assert.equal(participationSource({ ...member, authorName: name }), "excluded");
}
assert.equal(participationSource({ ...member, id: "booboolife-ai-20260922" }), "excluded");
for (const email of ["sangemi@daum.net", "KSAKSK2112@gmail.com", "HELP@LAWFIRMY.COM"]) {
  assert.equal(participationSource({ ...member, author: { ...member.author, email } }), "excluded");
}
for (const role of ["ADMIN", "SUSPENDED"]) {
  assert.equal(participationSource({ ...member, author: { ...member.author, role } }), "excluded");
}
assert.deepEqual(summarizeParticipation([member], [member, { ...member, author: null }]), { posts: 1, comments: 1, members: 1, unidentified: 1 });
assert.deepEqual(summarizeParticipation([], []), { posts: 0, comments: 0, members: 0, unidentified: 0 });
console.log("Participation exclusions and member deduplication passed.");
