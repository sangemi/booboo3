import { NextResponse } from "next/server";

import { createTemperatureCheckSchema } from "@/lib/community-schema";
import { temperatureTrend } from "@/lib/community-data";
import { createTemperatureCheck } from "@/lib/community-service";

export async function GET() {
  return NextResponse.json({ trend: temperatureTrend });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createTemperatureCheckSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_TEMPERATURE", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const check = await createTemperatureCheck(parsed.data);
    return NextResponse.json({ check, source: "database" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create temperature check", error);
    return NextResponse.json(
      { error: "DATABASE_WRITE_FAILED" },
      { status: 503 },
    );
  }
}
