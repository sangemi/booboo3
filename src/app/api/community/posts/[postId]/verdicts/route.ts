import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createVerdictVoteSchema } from "@/lib/community-schema";
import { createCommunityVerdictVote } from "@/lib/community-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

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
    const result = await createCommunityVerdictVote({
      postId,
      userId: session.user.id,
      choice: parsed.data.choice,
    });
    if (!result) {
      return NextResponse.json(
        { error: "VERDICT_POST_REQUIRED" },
        { status: 409 },
      );
    }
    return NextResponse.json({ ...result, source: "database" });
  } catch (error) {
    console.error("Failed to create community verdict vote", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
