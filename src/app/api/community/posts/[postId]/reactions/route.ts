import { NextResponse } from "next/server";

import { createReactionSchema } from "@/lib/community-schema";
import { createCommunityReaction } from "@/lib/community-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { postId } = await context.params;
  const payload = await request.json();
  const parsed = createReactionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REACTION", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const reactions = await createCommunityReaction({
      postId,
      type: parsed.data.type,
    });
    return NextResponse.json({ reactions, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create community reaction", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
