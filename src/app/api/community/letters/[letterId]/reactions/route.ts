import { NextRequest, NextResponse } from "next/server";

import { createLetterReactionSchema } from "@/lib/community-schema";
import { reactToAnonymousLetter } from "@/lib/community-service";

const ANON_COOKIE = "booboo_anon_id";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ letterId: string }> },
) {
  const { letterId } = await context.params;
  const parsed = createLetterReactionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_LETTER_REACTION", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existingAnonKey = request.cookies.get(ANON_COOKIE)?.value;
  const anonKey = existingAnonKey ?? crypto.randomUUID();

  try {
    const reaction = await reactToAnonymousLetter({
      letterId,
      anonKey,
      type: parsed.data.type,
    });
    if (!reaction) {
      return NextResponse.json({ error: "LETTER_NOT_FOUND" }, { status: 404 });
    }

    const response = NextResponse.json({ reaction, source: "database" });
    if (!existingAnonKey) {
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
    console.error("Failed to react to anonymous letter", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
