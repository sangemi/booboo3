import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-access";
import { prisma } from "@/lib/db";
import { siteVisitKey } from "@/lib/post-view-policy";

const headers = { "Cache-Control": "private, no-store" };
const COOKIE = "booboo_anon_id";

export async function POST(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403, headers });
  }

  const session = await auth();
  const existingAnonKey = request.cookies.get(COOKIE)?.value;

  if (isAdminEmail(session?.user?.email)) {
    const keys = [
      existingAnonKey ? siteVisitKey(`anon:${existingAnonKey}`) : null,
      session?.user?.id ? siteVisitKey(`user:${session.user.id}`) : null,
    ].filter((key): key is string => Boolean(key));
    if (keys.length) await prisma.siteVisit.deleteMany({ where: { id: { in: keys } } });
    return NextResponse.json({ recorded: false, excluded: "admin" }, { headers });
  }

  const anonKey = existingAnonKey ?? crypto.randomUUID();
  const visitor = existingAnonKey
    ? `anon:${existingAnonKey}`
    : session?.user?.id
      ? `user:${session.user.id}`
      : `anon:${anonKey}`;
  await prisma.siteVisit.createMany({
    data: [{ id: siteVisitKey(visitor), createdAt: new Date() }],
    skipDuplicates: true,
  });

  const response = NextResponse.json({ recorded: true }, { headers });
  if (!existingAnonKey && !session?.user?.id) response.cookies.set(COOKIE, anonKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
