import { z } from "zod";

import { commentPersonaTypes } from "@/lib/comment-persona";

const commentPersonaTypeSchema = z.enum(commentPersonaTypes);
const commentPersonaRequestSchema = z.object({
  type: commentPersonaTypeSchema,
  level: z.enum(["REQUESTED", "REQUIRED"]),
});
const commentPersonaDisclosureSchema = z
  .object({
    type: commentPersonaTypeSchema,
    personaId: z.string().trim().min(1).optional(),
    value: z.string().trim().min(1).max(60).optional(),
    skip: z.boolean().optional(),
  })
  .refine((value) => value.personaId || value.value || value.skip, {
    message: "공개할 페르소나를 선택하거나 입력해 주세요.",
  });

export const createPostSchema = z.object({
  category: z.enum(["talk", "verdict", "tips"]),
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(10).max(5000),
  temperature: z.number().int().min(1).max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(20)).max(6).default([]),
  isAnonymous: z.boolean().default(true),
  showAuthorGender: z.boolean().default(false),
  showCommenterGender: z.boolean().default(true),
  commentPersonaRequests: z
    .array(commentPersonaRequestSchema)
    .max(commentPersonaTypes.length)
    .default([])
    .refine(
      (requests) => new Set(requests.map((request) => request.type)).size === requests.length,
      "같은 페르소나는 한 번만 요청할 수 있습니다.",
    ),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(2).max(1200),
  tone: z.enum(["support", "advice", "question"]).default("support"),
  isAnonymous: z.boolean().default(true),
  personaDisclosures: z
    .array(commentPersonaDisclosureSchema)
    .max(commentPersonaTypes.length)
    .default([])
    .refine(
      (items) => new Set(items.map((item) => item.type)).size === items.length,
      "같은 페르소나는 한 번만 공개할 수 있습니다.",
    ),
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
