import { NextResponse } from "next/server";
import { z } from "zod";

import { aiOperationLogs } from "@/lib/ai-operations-data";
import {
  createAiOperationProposal,
  listAiOperationLogs,
} from "@/lib/ai-operations-service";

const proposalSchema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(10).max(3000),
});

export async function GET() {
  try {
    const logs = await listAiOperationLogs();
    return NextResponse.json({
      logs: logs.length > 0 ? logs : aiOperationLogs,
      source: logs.length > 0 ? "database" : "seed",
    });
  } catch (error) {
    console.error("Failed to list AI operation logs", error);
    return NextResponse.json({ logs: aiOperationLogs, source: "seed" });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = proposalSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_PROPOSAL", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const log = await createAiOperationProposal(parsed.data);
    return NextResponse.json({ log, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create AI operation proposal", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
