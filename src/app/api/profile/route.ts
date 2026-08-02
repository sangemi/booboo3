import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const updateProfileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[가-힣a-zA-Z0-9_]+$/),
});

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      nickname: true,
      accounts: { select: { provider: true } },
      personas: {
        orderBy: [{ status: "desc" }, { createdAt: "asc" }],
        select: {
          id: true,
          type: true,
          label: true,
          value: true,
          normalizedValue: true,
          isPublic: true,
          status: true,
          source: true,
          verifiedAt: true,
        },
      },
    },
  });

  if (!user) return unauthorized();

  return NextResponse.json({
    ...user,
    providers: user.accounts.map((account) => account.provider),
    accounts: undefined,
    verifiedPersonaCount: user.personas.filter(
      (persona) => persona.status === "VERIFIED",
    ).length,
  });
}

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const parsed = updateProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "닉네임은 한글, 영문, 숫자, 밑줄로 2~20자까지 쓸 수 있어요.",
      },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { nickname: parsed.data.nickname },
      select: { nickname: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (hasPrismaCode(error, "P2002")) {
      return NextResponse.json(
        { error: "이미 사용 중인 닉네임입니다." },
        { status: 409 },
      );
    }

    throw error;
  }
}

async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
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
