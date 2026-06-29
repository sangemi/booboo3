import { NextResponse } from "next/server";

import { createCommentSchema } from "@/lib/community-schema";
import { createCommunityComment } from "@/lib/community-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { postId } = await context.params;
  const payload = await request.json();
  const parsed = createCommentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_COMMENT", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const comment = await createCommunityComment({
      postId,
      body: parsed.data.body,
      tone: parsed.data.tone,
    });
    return NextResponse.json({ comment, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create community comment", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
