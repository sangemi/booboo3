import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { seedPosts } from "@/lib/community-data";
import { createPostSchema } from "@/lib/community-schema";
import { createCommunityPost, listCommunityPosts } from "@/lib/community-service";
import { isAdminEmail } from "@/lib/admin-access";
import { PostCooldownError, postIpHash } from "@/lib/post-rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const posts = await listCommunityPosts(
      session?.user?.id,
      request.cookies.get("booboo_anon_id")?.value,
      isAdminEmail(session?.user?.email),
    );
    return NextResponse.json({
      posts,
      source: "database",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Failed to list community posts", error);
    return NextResponse.json({ posts: seedPosts, source: "seed" });
  }
}

export async function POST(request: Request) {
  const clientIp = request.headers.get("x-real-ip") ??
    (process.env.NODE_ENV !== "production" ? "127.0.0.1" : "");
  const ipHash = postIpHash(clientIp, process.env.AUTH_SECRET ?? "");
  if (!ipHash) {
    return NextResponse.json({ error: "CLIENT_IP_UNAVAILABLE" }, { status: 503 });
  }
  const session = await auth();
  const payload = await request.json();
  const parsed = createPostSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_POST", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const post = await createCommunityPost({
      ...parsed.data,
      userId: session?.user?.id,
      ipHash,
    });
    return NextResponse.json({ post, source: "database" }, { status: 201 });
  } catch (error) {
    if (error instanceof PostCooldownError) {
      return NextResponse.json(
        { error: "POST_COOLDOWN", retryAfterSeconds: error.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } },
      );
    }
    console.error("Failed to create community post", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
