import "dotenv/config";

import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { CommentTone, PostCategory } from "../src/generated/prisma/enums";

type LegacyPost = {
  id: number;
  title: string;
  content: string;
  comment_count?: number;
  view_count?: number;
  voteup?: number;
  votedown?: number;
  author?: string | null;
  created_at: string;
};

type LegacyComment = {
  id: number;
  content: string;
  author?: string | null;
  created_at: string;
};

type LegacyPayload = {
  post: LegacyPost;
  comments: LegacyComment[];
};

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    process.env.DATABASE_URL ??
      "postgresql://booboo3_user:placeholder@localhost:5432/booboo3",
  ),
});

async function main() {
  const sourcePath = process.argv[2] ?? "legacy-13739.json";
  const source = (await readFile(sourcePath, "utf8")).replace(/^\uFEFF/, "");
  const payload = JSON.parse(source) as LegacyPayload;

  if (!payload.post || payload.post.id !== 13739) {
    throw new Error("Expected legacy post 13739 payload.");
  }

  const post = await prisma.post.upsert({
    where: { legacyId: payload.post.id },
    update: {
      title: payload.post.title.trim(),
      body: htmlToText(payload.post.content),
      authorName: normalizeAuthor(payload.post.author, "익명의 부부"),
      legacyPath: "/talk/post/13739",
      legacySource: "booboo2:mysql:ado_posts",
      legacyViewCount: payload.post.view_count ?? null,
      legacyLikeCount: payload.post.voteup ?? null,
      legacyDislikeCount: payload.post.votedown ?? null,
      legacyCreatedAt: parseDate(payload.post.created_at),
      updatedAt: new Date(),
    },
    create: {
      category: PostCategory.WORRY,
      title: payload.post.title.trim(),
      body: htmlToText(payload.post.content),
      authorName: normalizeAuthor(payload.post.author, "익명의 부부"),
      coupleStage: "booboo2 이관",
      mood: "need-talk",
      temperature: 43,
      readMinutes: Math.max(1, Math.ceil(htmlToText(payload.post.content).length / 420)),
      isAnonymous: true,
      tags: ["booboo2", "이관글", "부부갈등"],
      legacyId: payload.post.id,
      legacyPath: "/talk/post/13739",
      legacySource: "booboo2:mysql:ado_posts",
      legacyViewCount: payload.post.view_count ?? null,
      legacyLikeCount: payload.post.voteup ?? null,
      legacyDislikeCount: payload.post.votedown ?? null,
      legacyCreatedAt: parseDate(payload.post.created_at),
      createdAt: parseDate(payload.post.created_at),
    },
  });

  for (const comment of payload.comments) {
    await prisma.comment.upsert({
      where: { legacyId: comment.id },
      update: {
        body: htmlToText(comment.content),
        authorName: normalizeAuthor(comment.author, "방문자"),
        legacySource: "booboo2:mysql:ado_post_comments",
        legacyCreatedAt: parseDate(comment.created_at),
      },
      create: {
        postId: post.id,
        body: htmlToText(comment.content),
        authorName: normalizeAuthor(comment.author, "방문자"),
        tone: CommentTone.SUPPORT,
        legacyId: comment.id,
        legacySource: "booboo2:mysql:ado_post_comments",
        legacyCreatedAt: parseDate(comment.created_at),
        createdAt: parseDate(comment.created_at),
      },
    });
  }

  const commentCount = await prisma.comment.count({ where: { postId: post.id } });
  console.log(`Imported legacy post ${payload.post.id} with ${commentCount} comments.`);
}

function normalizeAuthor(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "\"\"" ? trimmed : fallback;
}

function parseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
}

function htmlToText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
