import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getTodayCommunityMission } from "@/lib/community-service";

export async function GET() {
  try {
    const session = await auth();
    const mission = await getTodayCommunityMission(session?.user?.id);
    return NextResponse.json({ mission, source: "database" });
  } catch (error) {
    console.error("Failed to load today's community mission", error);
    return NextResponse.json(
      { error: "DATABASE_READ_FAILED" },
      { status: 503 },
    );
  }
}
