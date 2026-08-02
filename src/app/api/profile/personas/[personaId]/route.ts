import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const updatePersonaSchema = z.object({
  isPublic: z.boolean(),
});

type RouteContext = {
  params: Promise<{ personaId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return unauthorized();

  const parsed = updatePersonaSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "공개 설정을 확인해 주세요." },
      { status: 400 },
    );
  }

  const { personaId } = await context.params;
  const result = await prisma.userPersona.updateMany({
    where: { id: personaId, userId },
    data: { isPublic: parsed.data.isPublic },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "페르소나를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return unauthorized();

  const { personaId } = await context.params;
  const persona = await prisma.userPersona.findFirst({
    where: { id: personaId, userId },
    select: { status: true },
  });

  if (!persona) {
    return NextResponse.json(
      { error: "페르소나를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (persona.status === "VERIFIED") {
    return NextResponse.json(
      { error: "인증된 페르소나는 삭제 대신 비공개로 바꿀 수 있어요." },
      { status: 409 },
    );
  }

  await prisma.userPersona.delete({ where: { id: personaId } });
  return NextResponse.json({ ok: true });
}

function unauthorized() {
  return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
}
