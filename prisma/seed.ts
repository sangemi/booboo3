import "dotenv/config";

import {
  CommentTone,
  LetterTone,
  PostCategory,
  ReactionType,
} from "../src/generated/prisma/enums";
import { ensureDefaultAiOperationLogs } from "../src/lib/ai-operations-service";
import { badges, letters, missions, seedPosts } from "../src/lib/community-data";
import { prisma } from "../src/lib/db";

const categoryToDb = {
  talk: PostCategory.TALK,
  worry: PostCategory.WORRY,
  tips: PostCategory.TIPS,
  parenting: PostCategory.PARENTING,
  together: PostCategory.TOGETHER,
  letters: PostCategory.LETTERS,
} as const;

const reactionToDb = {
  meToo: ReactionType.ME_TOO,
  hug: ReactionType.HUG,
  saved: ReactionType.SAVED,
  helpful: ReactionType.HELPFUL,
} as const;

const commentToneToDb = {
  support: CommentTone.SUPPORT,
  advice: CommentTone.ADVICE,
  question: CommentTone.QUESTION,
} as const;

const letterToneToDb = {
  "고마움": LetterTone.THANKS,
  "미안함": LetterTone.SORRY,
  "서운함": LetterTone.HURT,
} as const;

async function main() {
  await ensureDefaultAiOperationLogs();

  for (const mission of missions) {
    await prisma.mission.upsert({
      where: { id: mission.id },
      create: {
        id: mission.id,
        title: mission.title,
        prompt: mission.prompt,
        difficulty: mission.difficulty,
      },
      update: {
        title: mission.title,
        prompt: mission.prompt,
        difficulty: mission.difficulty,
      },
    });
  }

  for (const badge of badges) {
    const slug = badge.label
      .replaceAll(" ", "-")
      .replace(/[^\w가-힣-]/g, "")
      .toLowerCase();

    await prisma.badge.upsert({
      where: { slug },
      create: {
        slug,
        title: badge.label,
        description: `${badge.count}쌍이 받은 부부라이프 회복 배지`,
      },
      update: {
        title: badge.label,
        description: `${badge.count}쌍이 받은 부부라이프 회복 배지`,
      },
    });
  }

  for (const letter of letters) {
    await prisma.anonymousLetter.upsert({
      where: { id: letter.id },
      create: {
        id: letter.id,
        title: letter.title,
        body: letter.body,
        tone: letterToneToDb[letter.tone],
      },
      update: {
        title: letter.title,
        body: letter.body,
        tone: letterToneToDb[letter.tone],
      },
    });
  }

  for (const post of seedPosts) {
    await prisma.post.upsert({
      where: { id: post.id },
      create: {
        id: post.id,
        category: categoryToDb[post.category],
        title: post.title,
        body: post.body,
        authorName: post.author,
        coupleStage: post.coupleStage,
        mood: post.mood,
        temperature: post.temperature,
        readMinutes: post.readMinutes,
        isPinned: post.pinned ?? false,
        isAnonymous: true,
        tags: post.tags,
        comments: {
          create: post.comments.map((comment) => ({
            id: comment.id,
            authorName: comment.author,
            body: comment.body,
            tone: commentToneToDb[comment.tone],
          })),
        },
      },
      update: {
        category: categoryToDb[post.category],
        title: post.title,
        body: post.body,
        authorName: post.author,
        coupleStage: post.coupleStage,
        mood: post.mood,
        temperature: post.temperature,
        readMinutes: post.readMinutes,
        isPinned: post.pinned ?? false,
        isAnonymous: true,
        tags: post.tags,
      },
    });

    for (const [type, count] of Object.entries(post.reactions)) {
      const reactionType = reactionToDb[type as keyof typeof reactionToDb];
      const existing = await prisma.reaction.count({
        where: { postId: post.id, type: reactionType },
      });

      if (existing >= count) continue;

      await prisma.reaction.createMany({
        data: Array.from({ length: count - existing }, (_, index) => ({
          postId: post.id,
          type: reactionType,
          anonKey: `seed-${post.id}-${type}-${existing + index}`,
        })),
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
