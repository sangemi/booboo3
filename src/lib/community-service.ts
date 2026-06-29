import {
  CommentTone,
  PostCategory,
  ReactionType,
} from "@/generated/prisma/enums";
import type {
  CommentModel,
  PostModel,
  ReactionModel,
} from "@/generated/prisma/models";
import type { CommunityPost, ReactionState } from "@/lib/community-data";
import { prisma } from "@/lib/db";

type PostWithRelations = PostModel & {
  comments: CommentModel[];
  reactions: ReactionModel[];
};

export const categoryToDb = {
  talk: PostCategory.TALK,
  worry: PostCategory.WORRY,
  tips: PostCategory.TIPS,
  parenting: PostCategory.PARENTING,
  together: PostCategory.TOGETHER,
  letters: PostCategory.LETTERS,
} as const;

export const categoryFromDb = {
  [PostCategory.TALK]: "talk",
  [PostCategory.WORRY]: "worry",
  [PostCategory.TIPS]: "tips",
  [PostCategory.PARENTING]: "parenting",
  [PostCategory.TOGETHER]: "together",
  [PostCategory.LETTERS]: "letters",
} as const;

export const reactionToDb = {
  meToo: ReactionType.ME_TOO,
  hug: ReactionType.HUG,
  saved: ReactionType.SAVED,
  helpful: ReactionType.HELPFUL,
} as const;

export const commentToneToDb = {
  support: CommentTone.SUPPORT,
  advice: CommentTone.ADVICE,
  question: CommentTone.QUESTION,
} as const;

const commentToneFromDb = {
  [CommentTone.SUPPORT]: "support",
  [CommentTone.ADVICE]: "advice",
  [CommentTone.QUESTION]: "question",
} as const;

const reactionFromDb = {
  [ReactionType.ME_TOO]: "meToo",
  [ReactionType.HUG]: "hug",
  [ReactionType.SAVED]: "saved",
  [ReactionType.HELPFUL]: "helpful",
} as const;

export async function listCommunityPosts() {
  const posts = await prisma.post.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
      },
      reactions: true,
    },
    take: 50,
  });

  return posts.map(toCommunityPost);
}

export async function createCommunityPost(input: {
  category: keyof typeof categoryToDb;
  title: string;
  body: string;
  temperature?: number;
  tags: string[];
}) {
  const post = await prisma.post.create({
    data: {
      category: categoryToDb[input.category],
      title: input.title,
      body: input.body,
      authorName: "익명의 부부",
      coupleStage: "새 이야기",
      mood: moodFromTemperature(input.temperature),
      temperature: input.temperature,
      readMinutes: Math.max(1, Math.ceil(input.body.length / 180)),
      tags: input.tags.length > 0 ? input.tags : ["새글"],
      isAnonymous: true,
    },
    include: {
      comments: true,
      reactions: true,
    },
  });

  return toCommunityPost(post);
}

export async function createCommunityComment(input: {
  postId: string;
  body: string;
  tone: keyof typeof commentToneToDb;
}) {
  const comment = await prisma.comment.create({
    data: {
      postId: input.postId,
      body: input.body,
      tone: commentToneToDb[input.tone],
      authorName: "방문자",
    },
  });

  return {
    id: comment.id,
    author: comment.authorName,
    body: comment.body,
    tone: commentToneFromDb[comment.tone],
    createdAt: relativeTime(comment.createdAt),
  };
}

export async function createCommunityReaction(input: {
  postId: string;
  type: keyof typeof reactionToDb;
  anonKey?: string;
}) {
  await prisma.reaction.create({
    data: {
      postId: input.postId,
      type: reactionToDb[input.type],
      anonKey: input.anonKey,
    },
  });

  const grouped = await prisma.reaction.groupBy({
    by: ["type"],
    where: { postId: input.postId },
    _count: { type: true },
  });

  return grouped.reduce<ReactionState>(
    (state, item) => {
      state[reactionFromDb[item.type]] = item._count.type;
      return state;
    },
    { meToo: 0, hug: 0, saved: 0, helpful: 0 },
  );
}

export async function createTemperatureCheck(input: {
  score: number;
  note?: string;
  anonKey?: string;
}) {
  return prisma.temperatureCheck.create({
    data: {
      score: input.score,
      note: input.note,
      anonKey: input.anonKey,
    },
  });
}

function toCommunityPost(post: PostWithRelations): CommunityPost {
  return {
    id: post.id,
    category: categoryFromDb[post.category],
    title: post.title,
    body: post.body,
    author: post.authorName,
    coupleStage: post.coupleStage ?? "부부라이프",
    mood: normalizeMood(post.mood),
    temperature: post.temperature ?? 70,
    createdAt: relativeTime(post.createdAt),
    readMinutes: post.readMinutes,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      author: comment.authorName,
      body: comment.body,
      tone: commentToneFromDb[comment.tone],
      createdAt: relativeTime(comment.createdAt),
    })),
    reactions: post.reactions.reduce<ReactionState>(
      (state, reaction) => {
        state[reactionFromDb[reaction.type]] += 1;
        return state;
      },
      { meToo: 0, hug: 0, saved: 0, helpful: 0 },
    ),
    tags: post.tags,
    pinned: post.isPinned,
  };
}

function moodFromTemperature(score?: number) {
  if (score == null) return "warm";
  if (score >= 80) return "thankful";
  if (score >= 65) return "warm";
  if (score >= 45) return "need-talk";
  return "tired";
}

function normalizeMood(mood?: string | null): CommunityPost["mood"] {
  if (
    mood === "warm" ||
    mood === "tired" ||
    mood === "need-talk" ||
    mood === "thankful"
  ) {
    return mood;
  }

  return "warm";
}

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}
