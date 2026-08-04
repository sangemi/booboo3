import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { seedPosts } from "@/lib/community-data";
import { createPostSchema } from "@/lib/community-schema";
import { createCommunityPost, listCommunityPosts } from "@/lib/community-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const posts = await listCommunityPosts(
      session?.user?.id,
      request.cookies.get("booboo_anon_id")?.value,
    );
    return NextResponse.json({
      posts,
      source: "database",
    });
  } catch (error) {
    console.error("Failed to list community posts", error);
    return NextResponse.json({ posts: seedPosts, source: "seed" });
  }
}

export async function POST(request: Request) {
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
    });
    return NextResponse.json({ post, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create community post", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
