import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canReadPostViews, postViewKey } from "@/lib/post-view-policy";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!canReadPostViews(session?.user?.email)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403, headers });
  }
  const ids = (request.nextUrl.searchParams.get("ids") ?? "").split(",").map(Number);
  if (ids.length > 100 || ids.some((id) => !Number.isSafeInteger(id) || id < 1)) {
    return NextResponse.json({ error: "INVALID_IDS" }, { status: 400, headers });
  }
  const posts = await prisma.post.findMany({
    where: { publicId: { in: ids } },
    select: { publicId: true, legacyViewCount: true, _count: { select: { views: true } } },
  });
  return NextResponse.json({ counts: Object.fromEntries(posts.map((post) => [
    post.publicId, Math.max(0, post.legacyViewCount ?? 0) + post._count.views,
  ])) }, { headers });
}

export async function POST(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403, headers });
  }
  const payload = await request.json().catch(() => null);
  if (!Number.isSafeInteger(payload?.publicId) || payload.publicId < 1) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400, headers });
  }
  const post = await prisma.post.findUnique({ where: { publicId: payload.publicId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404, headers });
  const session = await auth();
  const existing = request.cookies.get("booboo_anon_id")?.value;
  const anonKey = existing || crypto.randomUUID();
  const visitor = session?.user?.id ? `user:${session.user.id}` : `anon:${anonKey}`;
  await prisma.postView.createMany({
    data: [{ id: postViewKey(post.id, visitor), postId: post.id }],
    skipDuplicates: true,
  });
  const response = NextResponse.json({ recorded: true }, { headers });
  if (!existing && !session?.user?.id) response.cookies.set("booboo_anon_id", anonKey, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
