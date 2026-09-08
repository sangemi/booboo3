import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { loadEnvFile } from "node:process";
import { after, before, test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { postViewKey } from "../src/lib/post-view-policy";

loadEnvFile(".env");
const schema = `booboo_comment_test_${randomUUID().replaceAll("-", "")}`;
const connectionString = process.env.DATABASE_URL!;
const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
const db = new PrismaClient({ adapter: new PrismaPg(connectionString, { schema }) });
let service: typeof import("../src/lib/community-service");
let optionalPostId: string;
let requiredPostId: string;
let requiredPublicId: number;

before(async () => {
  const ddl = execFileSync(process.execPath, [
    "node_modules/prisma/build/index.js", "migrate", "diff", "--from-empty",
    "--to-schema", "prisma/schema.prisma", "--script",
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  await client.connect();
  assert.match(schema, /^booboo_comment_test_[a-f0-9]{32}$/);
  // Only this freshly generated, isolated schema receives test writes.
  await client.query(`CREATE SCHEMA "${schema}"`);
  await client.query(`SET search_path TO "${schema}"`);
  await client.query(ddl.replaceAll('"public"', `"${schema}"`));
  (globalThis as unknown as { prisma: PrismaClient }).prisma = db;
  service = await import("../src/lib/community-service");
  const optional = await db.post.create({ data: {
    title: "선택 정보 테스트", body: "댓글 정보 공개 흐름을 검증합니다.", category: "TALK",
    commentPersonaRequests: [{ type: "GENDER", level: "REQUESTED" }],
  } });
  optionalPostId = optional.id;
  const required = await db.post.create({ data: {
    title: "필수 정보 테스트", body: "본인에게만 보이는 댓글을 검증합니다.", category: "TALK",
    showCommenterGender: false,
    commentPersonaRequests: [{ type: "AGE_GROUP", level: "REQUIRED" }, { type: "PARENTING", level: "REQUIRED" }],
  } });
  requiredPostId = required.id;
  requiredPublicId = required.publicId;
});

after(async () => {
  await db.$disconnect();
  assert.match(schema, /^booboo_comment_test_[a-f0-9]{32}$/);
  await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await client.end();
});

const create = (postId: string, anonKey: string) => service.createCommunityComment({
  postId, anonKey, body: "첫 번째 줄\n두 번째 줄", tone: "support", isAnonymous: true, personaDisclosures: [],
});

test("조회수 중복 집계 방지와 게시글 수정 시각 보존", async () => {
  const before = await db.post.findUniqueOrThrow({ where: { id: optionalPostId } });
  const id = postViewKey(optionalPostId, "view-test-visitor");
  for (let attempt = 0; attempt < 2; attempt++) {
    await db.postView.createMany({ data: [{ id, postId: optionalPostId }], skipDuplicates: true });
  }
  const after = await db.post.findUniqueOrThrow({ where: { id: optionalPostId }, include: { _count: { select: { views: true } } } });
  assert.equal(after._count.views, 1);
  assert.equal(after.updatedAt.toISOString(), before.updatedAt.toISOString());
});

test("선택 정보 없이 즉시 공개하고, 동의한 댓글에만 정보를 추가한다", async () => {
  const comment = await create(optionalPostId, "optional-owner");
  assert.equal(comment.isPublished, true);
  assert.deepEqual(comment.personas, []);
  assert.equal(comment.body, "첫 번째 줄\n두 번째 줄");
  const updated = await service.updateCommunityCommentPersonas({
    commentId: comment.id, anonKey: "optional-owner",
    personaDisclosures: [{ type: "GENDER", value: "여성" }],
  });
  assert.equal(updated.id, comment.id);
  assert.equal(updated.personas[0].value, "여성");
  await assert.rejects(service.updateCommunityCommentPersonas({
    commentId: comment.id, anonKey: "stranger", personaDisclosures: [{ type: "GENDER", value: "남성" }],
  }), service.CommentPermissionError);
  await assert.rejects(create(optionalPostId, "optional-owner"), service.CommentCooldownError);
});

test("필수 누락 댓글은 작성자만 조회하고, 일부 입력 후에도 비공개이며 모두 입력하면 같은 댓글이 공개된다", async () => {
  const comment = await create(requiredPostId, "pending-owner");
  assert.equal(comment.isPublished, false);
  assert.deepEqual(comment.pendingPersonaTypes, ["AGE_GROUP", "PARENTING"]);
  const own = await service.getCommunityPostByPublicId(requiredPublicId, undefined, "pending-owner");
  assert.equal(own?.comments.some((item) => item.id === comment.id), true);
  const publicPost = await service.getCommunityPostByPublicId(requiredPublicId);
  assert.equal(publicPost?.comments.some((item) => item.id === comment.id), false);
  const other = await service.listCommunityPosts(undefined, "stranger");
  assert.equal(JSON.stringify(other).includes(comment.id), false);
  const seoBefore = await service.getCommunityPostSeoByPublicId(requiredPublicId);
  assert.equal(seoBefore?.pageUpdatedAt.getTime(), seoBefore?.updatedAt.getTime());
  const sitemapBefore = await service.listCommunityPostSeoEntries();
  assert.equal(sitemapBefore.find((post) => post.publicId === requiredPublicId)?.pageUpdatedAt.getTime(), seoBefore?.updatedAt.getTime());
  await assert.rejects(service.reactToCommunityComment({ commentId: comment.id, anonKey: "stranger", type: "up" }), service.CommentNotFoundError);
  await assert.rejects(service.updateCommunityComment({ commentId: comment.id, body: "다른 사람의 수정", anonKey: "stranger" }), service.CommentPermissionError);
  await assert.rejects(service.deleteCommunityComment({ commentId: comment.id, anonKey: "stranger" }), service.CommentPermissionError);
  const partial = await service.updateCommunityCommentPersonas({
    commentId: comment.id, anonKey: "pending-owner", personaDisclosures: [{ type: "AGE_GROUP", value: "30대" }],
  });
  assert.equal(partial.isPublished, false);
  assert.deepEqual(partial.pendingPersonaTypes, ["PARENTING"]);
  const publicComment = await service.updateCommunityCommentPersonas({
    commentId: comment.id, anonKey: "pending-owner", personaDisclosures: [{ type: "PARENTING", value: "자녀 없음" }],
  });
  assert.equal(publicComment.id, comment.id);
  assert.equal(publicComment.isPublished, true);
  assert.equal(publicComment.personas.length, 2);
  assert.equal((await service.getCommunityPostByPublicId(requiredPublicId))?.comments.length, 1);
  assert.equal(await db.comment.count({ where: { id: comment.id } }), 1);
});

test("회원의 저장된 필수 정보는 자동 선택하지만 선택 정보와 다른 프로필 정보는 자동 공개하지 않는다", async () => {
  const user = await db.user.create({ data: { name: "테스트 회원" } });
  const gender = await db.userPersona.create({ data: {
    userId: user.id, type: "GENDER", label: "성별", value: "남성", normalizedValue: "male", isPublic: true,
  } });
  await db.userPersona.create({ data: { userId: user.id, type: "AGE_GROUP", label: "나이대", value: "40대", normalizedValue: "40", isPublic: false } });
  await db.userPersona.create({ data: { userId: user.id, type: "PARENTING", label: "자녀 유무", value: "자녀 있음", normalizedValue: "yes", isPublic: false } });
  const comment = await service.createCommunityComment({
    postId: requiredPostId, userId: user.id, isAnonymous: false, body: "회원의 필수 정보 자동 공개", tone: "support", personaDisclosures: [],
  });
  assert.equal(comment.isPublished, true);
  assert.equal(comment.personas.length, 2);
  assert.equal(comment.personas.some((persona) => persona.type === "GENDER"), false);
  assert.equal((await db.userPersona.findFirst({ where: { userId: user.id, type: "AGE_GROUP" } }))?.isPublic, false);
  const optional = await db.user.create({ data: { name: "선택 정보 회원", personas: { create: { type: "GENDER", label: "성별", value: "여성", normalizedValue: "female", isPublic: true } } } });
  const optionalComment = await service.createCommunityComment({
    postId: optionalPostId, userId: optional.id, isAnonymous: true, body: "프로필 공개와 댓글 공개는 별개", tone: "support", personaDisclosures: [],
  });
  assert.deepEqual(optionalComment.personas, []);
  await assert.rejects(service.updateCommunityCommentPersonas({
    commentId: optionalComment.id, userId: optional.id, personaDisclosures: [{ type: "GENDER", personaId: gender.id }],
  }), service.InvalidCommentPersonaError);
  const waiting = await db.user.create({ data: { name: "정보 없는 회원" } });
  const waitingComment = await service.createCommunityComment({
    postId: requiredPostId, userId: waiting.id, isAnonymous: true, body: "내 계정만 볼 수 있는 댓글", tone: "support", personaDisclosures: [],
  });
  assert.equal(waitingComment.isPublished, false);
  assert.equal((await service.getCommunityPostByPublicId(requiredPublicId, waiting.id))?.comments.some((item) => item.id === waitingComment.id), true);
  assert.equal((await service.getCommunityPostByPublicId(requiredPublicId, user.id))?.comments.some((item) => item.id === waitingComment.id), false);
  const owned = await service.updateCommunityComment({ commentId: waitingComment.id, userId: waiting.id, body: "비공개 상태에서도 수정됩니다." });
  assert.equal(owned.isPublished, false);
  await service.deleteCommunityComment({ commentId: waitingComment.id, userId: waiting.id });
  assert.equal(await db.comment.findUnique({ where: { id: waitingComment.id } }), null);
});
