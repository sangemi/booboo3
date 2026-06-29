import type { AiOperationLog } from "@/lib/ai-operations-data";
import { aiOperationLogs } from "@/lib/ai-operations-data";
import { prisma } from "@/lib/db";

export async function listAiOperationLogs() {
  const entries = await prisma.aiOperationEntry.findMany({
    orderBy: { happenedAt: "desc" },
    take: 80,
  });

  return entries.map((entry) => ({
    id: entry.id,
    date: entry.happenedAt.toISOString().slice(0, 10),
    title: entry.title,
    source: normalizeSource(entry.source),
    summary: entry.summary,
    decision: entry.decision,
    publicNotes: entry.publicNotes,
  }));
}

export async function createAiOperationProposal(input: {
  title: string;
  body: string;
}) {
  const entry = await prisma.aiOperationEntry.create({
    data: {
      title: input.title,
      source: "유저 제안",
      summary: input.body,
      decision:
        "접수. AI가 운영 영향, 악용 가능성, 커뮤니티 온도에 미칠 변화를 검토해야 합니다.",
      publicNotes: [
        "제안은 공개 검토 큐에 추가되었습니다.",
        "운영자와 AI가 함께 검토한 뒤 채택, 보류, 기각 중 하나로 남깁니다.",
        "개인정보나 특정 회원을 겨냥한 내용은 공개 기록에서 정리됩니다.",
      ],
    },
  });

  return {
    id: entry.id,
    date: entry.happenedAt.toISOString().slice(0, 10),
    title: entry.title,
    source: "유저 제안" as const,
    summary: entry.summary,
    decision: entry.decision,
    publicNotes: entry.publicNotes,
  };
}

export async function ensureDefaultAiOperationLogs() {
  for (const log of aiOperationLogs) {
    await prisma.aiOperationEntry.upsert({
      where: { id: log.id },
      create: {
        id: log.id,
        title: log.title,
        source: log.source,
        summary: log.summary,
        decision: log.decision,
        publicNotes: log.publicNotes,
        happenedAt: new Date(`${log.date}T00:00:00.000Z`),
      },
      update: {
        title: log.title,
        source: log.source,
        summary: log.summary,
        decision: log.decision,
        publicNotes: log.publicNotes,
        happenedAt: new Date(`${log.date}T00:00:00.000Z`),
      },
    });
  }
}

function normalizeSource(source: string): AiOperationLog["source"] {
  if (
    source === "운영자 지시" ||
    source === "유저 제안" ||
    source === "AI 자체 점검"
  ) {
    return source;
  }

  return "AI 자체 점검";
}
