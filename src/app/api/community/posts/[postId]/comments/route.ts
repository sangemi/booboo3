import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { createCommentSchema } from "@/lib/community-schema";
import {
  CommentCooldownError,
  createCommunityComment,
} from "@/lib/community-service";

const ANON_COOKIE = "booboo_anon_id";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> },
) {
  const session = await auth();
  const { postId } = await context.params;
  const existingAnonKey = request.cookies.get(ANON_COOKIE)?.value;
  const anonKey = session?.user?.id
    ? undefined
    : existingAnonKey ?? crypto.randomUUID();
  const payload = await request.json().catch(() => null);
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
      isAnonymous: parsed.data.isAnonymous,
      userId: session?.user?.id,
      anonKey,
    });
    const response = NextResponse.json(
      { comment, source: "database" },
      { status: 201 },
    );
    if (!session?.user?.id && !existingAnonKey && anonKey) {
      response.cookies.set(ANON_COOKIE, anonKey, anonymousCookieOptions());
    }
    return response;
  } catch (error) {
    if (error instanceof CommentCooldownError) {
      return NextResponse.json(
        {
          error: "COMMENT_COOLDOWN",
          retryAfterSeconds: error.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(error.retryAfterSeconds) },
        },
      );
    }
    console.error("Failed to create community comment", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}

function anonymousCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };
}
