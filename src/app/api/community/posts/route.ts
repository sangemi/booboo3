import { NextResponse } from "next/server";

import { seedPosts } from "@/lib/community-data";
import { createPostSchema } from "@/lib/community-schema";
import { createCommunityPost, listCommunityPosts } from "@/lib/community-service";

export async function GET() {
  try {
    const posts = await listCommunityPosts();
    return NextResponse.json({
      posts: posts.length > 0 ? posts : seedPosts,
      source: posts.length > 0 ? "database" : "seed",
    });
  } catch (error) {
    console.error("Failed to list community posts", error);
    return NextResponse.json({ posts: seedPosts, source: "seed" });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createPostSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_POST", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const post = await createCommunityPost(parsed.data);
    return NextResponse.json({ post, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create community post", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
