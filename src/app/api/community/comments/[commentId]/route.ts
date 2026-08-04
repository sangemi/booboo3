import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateCommentSchema } from "@/lib/community-schema";
import {
  CommentNotFoundError,
  CommentPermissionError,
  deleteCommunityComment,
  updateCommunityComment,
} from "@/lib/community-service";

const ANON_COOKIE = "booboo_anon_id";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ commentId: string }> },
) {
  const session = await auth();
  const { commentId } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = updateCommentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_COMMENT", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const comment = await updateCommunityComment({
      commentId,
      body: parsed.data.body,
      userId: session?.user?.id,
      anonKey: request.cookies.get(ANON_COOKIE)?.value,
    });
    return NextResponse.json({ comment, source: "database" });
  } catch (error) {
    return commentMutationError(error, "update");
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ commentId: string }> },
) {
  const session = await auth();
  const { commentId } = await context.params;

  try {
    await deleteCommunityComment({
      commentId,
      userId: session?.user?.id,
      anonKey: request.cookies.get(ANON_COOKIE)?.value,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return commentMutationError(error, "delete");
  }
}

function commentMutationError(error: unknown, action: "update" | "delete") {
  if (error instanceof CommentNotFoundError) {
    return NextResponse.json({ error: "COMMENT_NOT_FOUND" }, { status: 404 });
  }
  if (error instanceof CommentPermissionError) {
    return NextResponse.json({ error: "COMMENT_FORBIDDEN" }, { status: 403 });
  }

  console.error(`Failed to ${action} community comment`, error);
  return NextResponse.json({ error: "DATABASE_WRITE_FAILED" }, { status: 503 });
}
