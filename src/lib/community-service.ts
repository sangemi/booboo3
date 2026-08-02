import {
  CommentTone,
  LetterReactionType,
  LetterTone,
  PostCategory,
  ReactionType,
  VerdictChoice,
} from "@/generated/prisma/enums";
import type {
  CommentModel,
  AnonymousLetterModel,
  LetterReactionModel,
  PostModel,
  ReactionModel,
  VerdictVoteModel,
} from "@/generated/prisma/models";
import type {
  CommunityPost,
  Letter,
  ReactionState,
  VerdictState,
} from "@/lib/community-data";
import { prisma } from "@/lib/db";

type AuthorSummary = {
  name: string | null;
  nickname: string | null;
  _count: { personas: number };
} | null;

type CommentWithAuthor = CommentModel & {
  author: AuthorSummary;
};

type PostWithRelations = PostModel & {
  author: AuthorSummary;
  comments: CommentWithAuthor[];
  reactions: ReactionModel[];
  verdictVotes: VerdictVoteModel[];
};

const authorSelect = {
  name: true,
  nickname: true,
  _count: {
    select: {
      personas: { where: { status: "VERIFIED" as const } },
    },
  },
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

export const verdictToDb = {
  husband: VerdictChoice.HUSBAND,
  wife: VerdictChoice.WIFE,
  both: VerdictChoice.BOTH,
  notEnough: VerdictChoice.NOT_ENOUGH,
} as const;

const verdictFromDb = {
  [VerdictChoice.HUSBAND]: "husband",
  [VerdictChoice.WIFE]: "wife",
  [VerdictChoice.BOTH]: "both",
  [VerdictChoice.NOT_ENOUGH]: "notEnough",
} as const;

const letterReactionToDb = {
  up: LetterReactionType.UP,
  down: LetterReactionType.DOWN,
} as const;

const letterReactionFromDb = {
  [LetterReactionType.UP]: "up",
  [LetterReactionType.DOWN]: "down",
} as const;

type LetterWithReactions = AnonymousLetterModel & {
  reactions: LetterReactionModel[];
};

export async function listCommunityPosts() {
  const posts = await prisma.post.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: authorSelect },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: authorSelect } },
      },
      reactions: true,
      verdictVotes: true,
    },
    take: 50,
  });

  return posts.map(toCommunityPost);
}

export async function getCommunityPostByPublicId(publicId: number) {
  if (!Number.isSafeInteger(publicId) || publicId < 1) return null;

  const post = await prisma.post.findUnique({
    where: { publicId },
    include: {
      author: { select: authorSelect },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: authorSelect } },
      },
      reactions: true,
      verdictVotes: true,
    },
  });

  return post ? toCommunityPost(post) : null;
}

export async function createCommunityPost(input: {
  category: keyof typeof categoryToDb;
  title: string;
  body: string;
  temperature?: number;
  tags: string[];
  userId?: string;
  isAnonymous: boolean;
}) {
  const isAnonymous = !input.userId || input.isAnonymous;
  const author = input.userId
    ? await prisma.user.findUnique({
        where: { id: input.userId },
        select: { name: true, nickname: true },
      })
    : null;

  const post = await prisma.post.create({
    data: {
      category: categoryToDb[input.category],
      title: input.title,
      body: input.body,
      authorId: input.userId,
      authorName: isAnonymous
        ? "익명의 부부"
        : author?.nickname ?? author?.name ?? "부부라이프 회원",
      coupleStage: "새 이야기",
      mood: moodFromTemperature(input.temperature),
      temperature: input.temperature,
      readMinutes: Math.max(1, Math.ceil(input.body.length / 180)),
      tags: input.tags.length > 0 ? input.tags : ["새글"],
      isAnonymous,
    },
    include: {
      author: { select: authorSelect },
      comments: { include: { author: { select: authorSelect } } },
      reactions: true,
      verdictVotes: true,
    },
  });

  return toCommunityPost(post);
}

export async function createCommunityComment(input: {
  postId: string;
  body: string;
  tone: keyof typeof commentToneToDb;
  userId?: string;
  isAnonymous: boolean;
}) {
  const isAnonymous = !input.userId || input.isAnonymous;
  const author = input.userId
    ? await prisma.user.findUnique({
        where: { id: input.userId },
        select: { name: true, nickname: true },
      })
    : null;
  const comment = await prisma.comment.create({
    data: {
      postId: input.postId,
      body: input.body,
      tone: commentToneToDb[input.tone],
      authorId: input.userId,
      authorName: isAnonymous
        ? "방문자"
        : author?.nickname ?? author?.name ?? "부부라이프 회원",
      isAnonymous,
    },
    include: { author: { select: authorSelect } },
  });

  return {
    id: comment.id,
    author: comment.isAnonymous
      ? comment.authorName
      : comment.author?.nickname ?? comment.author?.name ?? comment.authorName,
    authorVerifiedPersonaCount: comment.isAnonymous
      ? 0
      : comment.author?._count.personas ?? 0,
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

export async function createCommunityVerdictVote(input: {
  postId: string;
  choice: keyof typeof verdictToDb;
  anonKey?: string;
}) {
  await prisma.verdictVote.create({
    data: {
      postId: input.postId,
      choice: verdictToDb[input.choice],
      anonKey: input.anonKey,
    },
  });

  const grouped = await prisma.verdictVote.groupBy({
    by: ["choice"],
    where: { postId: input.postId },
    _count: { choice: true },
  });

  return grouped.reduce<VerdictState>(
    (state, item) => {
      state[verdictFromDb[item.choice]] = item._count.choice;
      return state;
    },
    { husband: 0, wife: 0, both: 0, notEnough: 0 },
  );
}

export async function completeCommunityMission(input: {
  missionId: string;
  reflection?: string;
  anonKey?: string;
}) {
  return prisma.missionCompletion.create({
    data: {
      missionId: input.missionId,
      reflection: input.reflection,
      anonKey: input.anonKey,
    },
  });
}

export async function listAnonymousLetters(anonKey?: string): Promise<Letter[]> {
  const records = await prisma.anonymousLetter.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reactions: true,
    },
    take: 12,
  });

  return records.map((letter) => toAnonymousLetter(letter, anonKey));
}

export async function createAnonymousLetter(input: {
  body: string;
}) {
  const letter = await prisma.anonymousLetter.create({
    data: {
      // Kept only for compatibility with the currently deployed reader.
      title: input.body.split(/\r?\n/)[0]?.slice(0, 44) || "익명 편지",
      body: input.body,
      tone: LetterTone.HURT,
    },
    include: {
      reactions: true,
    },
  });

  return toAnonymousLetter(letter);
}

export async function reactToAnonymousLetter(input: {
  letterId: string;
  anonKey: string;
  type: keyof typeof letterReactionToDb;
}) {
  const letter = await prisma.anonymousLetter.findUnique({
    where: { id: input.letterId },
    select: { id: true },
  });
  if (!letter) return null;

  const existing = await prisma.letterReaction.findUnique({
    where: {
      letterId_anonKey: {
        letterId: input.letterId,
        anonKey: input.anonKey,
      },
    },
  });
  const type = letterReactionToDb[input.type];

  if (existing?.type === type) {
    await prisma.letterReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.letterReaction.upsert({
      where: {
        letterId_anonKey: {
          letterId: input.letterId,
          anonKey: input.anonKey,
        },
      },
      create: {
        letterId: input.letterId,
        anonKey: input.anonKey,
        type,
      },
      update: { type },
    });
  }

  const reactions = await prisma.letterReaction.findMany({
    where: { letterId: input.letterId },
  });

  return summarizeLetterReactions(reactions, input.anonKey);
}

function toAnonymousLetter(
  letter: LetterWithReactions,
  anonKey?: string,
): Letter {
  const legacyTitle = letter.title.trim();
  const body = letter.body.trim();
  const combinedBody =
    legacyTitle && !body.startsWith(legacyTitle)
      ? `${legacyTitle}\n\n${body}`
      : body;

  return {
    id: letter.id,
    body: combinedBody,
    ...summarizeLetterReactions(letter.reactions, anonKey),
  };
}

function summarizeLetterReactions(
  reactions: LetterReactionModel[],
  anonKey?: string,
) {
  const ownReaction = anonKey
    ? reactions.find((reaction) => reaction.anonKey === anonKey)
    : undefined;

  return {
    upvotes: reactions.filter((reaction) => reaction.type === LetterReactionType.UP)
      .length,
    downvotes: reactions.filter(
      (reaction) => reaction.type === LetterReactionType.DOWN,
    ).length,
    myReaction: ownReaction ? letterReactionFromDb[ownReaction.type] : null,
  } satisfies Pick<Letter, "upvotes" | "downvotes" | "myReaction">;
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
    publicId: post.publicId,
    category: categoryFromDb[post.category],
    title: post.title,
    body: post.body,
    author: post.isAnonymous
      ? post.authorName
      : post.author?.nickname ?? post.author?.name ?? post.authorName,
    authorVerifiedPersonaCount: post.isAnonymous
      ? 0
      : post.author?._count.personas ?? 0,
    coupleStage: post.coupleStage ?? "부부라이프",
    mood: normalizeMood(post.mood),
    temperature: post.temperature ?? 70,
    createdAt: relativeTime(post.createdAt),
    readMinutes: post.readMinutes,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      author: comment.isAnonymous
        ? comment.authorName
        : comment.author?.nickname ?? comment.author?.name ?? comment.authorName,
      authorVerifiedPersonaCount: comment.isAnonymous
        ? 0
        : comment.author?._count.personas ?? 0,
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
    verdicts: post.verdictVotes.reduce<VerdictState>(
      (state, vote) => {
        state[verdictFromDb[vote.choice]] += 1;
        return state;
      },
      { husband: 0, wife: 0, both: 0, notEnough: 0 },
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
