import { z } from "zod";

export const createPostSchema = z.object({
  category: z.enum(["talk", "worry", "tips", "parenting", "together", "letters"]),
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(10).max(5000),
  temperature: z.number().int().min(1).max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(20)).max(6).default([]),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(2).max(1200),
  tone: z.enum(["support", "advice", "question"]).default("support"),
});

export const createReactionSchema = z.object({
  type: z.enum(["meToo", "hug", "saved", "helpful"]),
});

export const createTemperatureCheckSchema = z.object({
  score: z.number().int().min(1).max(100),
  note: z.string().trim().max(500).optional(),
});
