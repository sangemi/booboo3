import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createMissionReflectionSchema } from "@/lib/community-schema";
import { createCommunityMissionReflection } from "@/lib/community-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ missionId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const parsed = createMissionReflectionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_MISSION_REFLECTION", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { missionId } = await context.params;
  try {
    const mission = await createCommunityMissionReflection({
      missionId,
      userId: session.user.id,
      body: parsed.data.body,
    });
    if (!mission) {
      return NextResponse.json({ error: "NOT_TODAY_MISSION" }, { status: 409 });
    }
    return NextResponse.json({ mission, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create mission reflection", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
