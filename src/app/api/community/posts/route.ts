import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  categories,
  COMMUNITY_POST_PAGE_SIZE,
  seedPosts,
  type CategoryKey,
} from "@/lib/community-data";
import { createPostSchema } from "@/lib/community-schema";
import {
  countCommunityPosts,
  createCommunityPost,
  listCommunityPosts,
} from "@/lib/community-service";
import { isAdminEmail } from "@/lib/admin-access";
import { PostCooldownError, postIpHash } from "@/lib/post-rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const page = normalizePage(request.nextUrl.searchParams.get("page"));
    const category = normalizeCategory(request.nextUrl.searchParams.get("category"));
    const [posts, total] = await Promise.all([
      listCommunityPosts(
        session?.user?.id,
        request.cookies.get("booboo_anon_id")?.value,
        isAdminEmail(session?.user?.email),
        page,
        category,
      ),
      countCommunityPosts(category),
    ]);
    return NextResponse.json({
      posts,
      page,
      pageSize: COMMUNITY_POST_PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / COMMUNITY_POST_PAGE_SIZE)),
      source: "database",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Failed to list community posts", error);
    return NextResponse.json({
      posts: seedPosts,
      page: 1,
      pageSize: COMMUNITY_POST_PAGE_SIZE,
      total: seedPosts.length,
      totalPages: 1,
      source: "seed",
    });
  }
}

function normalizePage(value: string | null) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function normalizeCategory(value: string | null): Extract<CategoryKey, "all" | "talk" | "verdict" | "tips"> {
  return categories.some((category) => category.key === value)
    ? value === "talk" || value === "verdict" || value === "tips"
      ? value
      : "all"
    : "all";
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
