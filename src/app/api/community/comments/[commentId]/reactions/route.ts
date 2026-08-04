import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { createCommentReactionSchema } from "@/lib/community-schema";
import {
  CommentNotFoundError,
  CommentPermissionError,
  reactToCommunityComment,
} from "@/lib/community-service";

const ANON_COOKIE = "booboo_anon_id";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ commentId: string }> },
) {
  const session = await auth();
  const { commentId } = await context.params;
  const parsed = createCommentReactionSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_COMMENT_REACTION", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existingAnonKey = request.cookies.get(ANON_COOKIE)?.value;
  const anonKey = session?.user?.id
    ? undefined
    : existingAnonKey ?? crypto.randomUUID();

  try {
    const reaction = await reactToCommunityComment({
      commentId,
      type: parsed.data.type,
      userId: session?.user?.id,
      anonKey,
    });
    const response = NextResponse.json({ reaction, source: "database" });
    if (!session?.user?.id && !existingAnonKey && anonKey) {
      response.cookies.set(ANON_COOKIE, anonKey, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: "COMMENT_NOT_FOUND" }, { status: 404 });
    }
    if (error instanceof CommentPermissionError) {
      return NextResponse.json(
        { error: "COMMENT_REACTION_FORBIDDEN" },
        { status: 403 },
      );
    }

    console.error("Failed to react to community comment", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
