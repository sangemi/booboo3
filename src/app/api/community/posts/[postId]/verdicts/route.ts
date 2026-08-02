import { NextResponse } from "next/server";

import { createVerdictVoteSchema } from "@/lib/community-schema";
import { createCommunityVerdictVote } from "@/lib/community-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { postId } = await context.params;
  const payload = await request.json();
  const parsed = createVerdictVoteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_VERDICT", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const verdicts = await createCommunityVerdictVote({
      postId,
      choice: parsed.data.choice,
    });
    return NextResponse.json({ verdicts, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create community verdict vote", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
