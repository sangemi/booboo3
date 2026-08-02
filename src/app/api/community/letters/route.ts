import { NextRequest, NextResponse } from "next/server";

import { letters as seedLetters } from "@/lib/community-data";
import { createLetterSchema } from "@/lib/community-schema";
import {
  createAnonymousLetter,
  listAnonymousLetters,
} from "@/lib/community-service";

export async function GET(request: NextRequest) {
  try {
    const letters = await listAnonymousLetters(
      request.cookies.get("booboo_anon_id")?.value,
    );
    return NextResponse.json({
      letters,
      source: "database",
    });
  } catch (error) {
    console.error("Failed to list anonymous letters", error);
    return NextResponse.json({ letters: seedLetters, source: "seed" });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createLetterSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_LETTER", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const letter = await createAnonymousLetter(parsed.data);
    return NextResponse.json({ letter, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create anonymous letter", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
