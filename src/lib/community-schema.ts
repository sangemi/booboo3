import { z } from "zod";

export const createPostSchema = z.object({
  category: z.enum(["talk", "verdict", "tips"]),
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(10).max(5000),
  temperature: z.number().int().min(1).max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(20)).max(6).default([]),
  isAnonymous: z.boolean().default(true),
  showAuthorGender: z.boolean().default(false),
  showCommenterGender: z.boolean().default(true),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(2).max(1200),
  tone: z.enum(["support", "advice", "question"]).default("support"),
  isAnonymous: z.boolean().default(true),
});

export const updateCommentSchema = z.object({
  body: z.string().trim().min(2).max(1200),
});

export const createCommentReactionSchema = z.object({
  type: z.enum(["up", "down"]),
});

export const createReactionSchema = z.object({
  type: z.enum(["meToo", "hug", "helpful"]),
});

export const toggleScrapSchema = z.object({
  postId: z.string().trim().min(1),
});

export const createVerdictVoteSchema = z.object({
  choice: z.enum(["husband", "wife", "both", "notEnough"]),
});

export const createMissionCompletionSchema = z.object({
  reflection: z.string().trim().max(800).optional(),
});

export const createMissionReflectionSchema = z.object({
  body: z.string().trim().min(2).max(800),
});

export const createLetterSchema = z.object({
  body: z.string().trim().min(5).max(2000),
});

export const createLetterReactionSchema = z.object({
  type: z.enum(["up", "down"]),
});

export const createTemperatureCheckSchema = z.object({
  score: z.number().int().min(1).max(100),
  note: z.string().trim().max(500).optional(),
});
