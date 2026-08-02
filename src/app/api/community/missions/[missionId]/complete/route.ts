import { NextResponse } from "next/server";

import { createMissionCompletionSchema } from "@/lib/community-schema";
import { completeCommunityMission } from "@/lib/community-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ missionId: string }> },
) {
  const { missionId } = await context.params;
  const payload = await request.json();
  const parsed = createMissionCompletionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_MISSION_COMPLETION", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    await completeCommunityMission({
      missionId,
      reflection: parsed.data.reflection,
    });
    return NextResponse.json({ ok: true, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to complete community mission", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
