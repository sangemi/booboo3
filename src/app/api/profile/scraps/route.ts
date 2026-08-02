import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { toggleScrapSchema } from "@/lib/community-schema";
import { createCommunityReaction } from "@/lib/community-service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const parsed = toggleScrapSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_SCRAP", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await createCommunityReaction({
      postId: parsed.data.postId,
      userId: session.user.id,
      type: "saved",
    });
    return NextResponse.json({ ...result, source: "database" });
  } catch (error) {
    console.error("Failed to toggle community scrap", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
