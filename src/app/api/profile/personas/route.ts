import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { PersonaType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { normalizePersonaValue, personaLabels } from "@/lib/persona";

const createPersonaSchema = z.object({
  type: z.nativeEnum(PersonaType).refine(
    (type) =>
      type !== PersonaType.EMPLOYER && type !== PersonaType.OTHER,
    "현재 추가할 수 없는 페르소나입니다.",
  ),
  value: z.string().trim().min(1).max(60),
  isPublic: z.boolean().default(true),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return unauthorized();

  const parsed = createPersonaSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "페르소나 종류와 내용을 확인해 주세요." },
      { status: 400 },
    );
  }

  let normalized;

  try {
    normalized = normalizePersonaValue(parsed.data.type, parsed.data.value);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "페르소나 내용을 확인해 주세요.",
      },
      { status: 400 },
    );
  }

  try {
    const persona = await prisma.userPersona.create({
      data: {
        userId,
        type: parsed.data.type,
        label: personaLabels[parsed.data.type],
        ...normalized,
        isPublic: parsed.data.isPublic,
      },
    });

    return NextResponse.json(persona, { status: 201 });
  } catch (error) {
    if (hasPrismaCode(error, "P2002")) {
      return NextResponse.json(
        { error: "이미 등록한 페르소나입니다." },
        { status: 409 },
      );
    }

    throw error;
  }
}

function unauthorized() {
  return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
}

function hasPrismaCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}
