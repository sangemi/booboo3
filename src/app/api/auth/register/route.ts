import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { PersonaType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { normalizePersonaValue, personaLabels } from "@/lib/persona";

const registerSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  nickname: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[가-힣a-zA-Z0-9_]+$/),
  gender: z.enum(["남성", "여성"]).optional(),
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json());

  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;

    return NextResponse.json(
      {
        error: "입력한 내용을 다시 확인해 주세요.",
        fieldErrors: {
          email: fields.email ? "이메일 형식을 확인해 주세요." : undefined,
          password: fields.password
            ? "비밀번호는 8자 이상 72자 이하로 입력해 주세요."
            : undefined,
          nickname: fields.nickname
            ? "닉네임은 한글, 영문, 숫자, 밑줄로 2~20자까지 쓸 수 있어요."
            : undefined,
        },
      },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const { nickname, password, gender } = parsed.data;
  const [emailUser, nicknameUser] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findUnique({ where: { nickname }, select: { id: true } }),
  ]);

  if (emailUser) {
    return NextResponse.json(
      {
        error: "이미 가입된 이메일입니다.",
        fieldErrors: { email: "기존 계정으로 로그인해 주세요." },
      },
      { status: 409 },
    );
  }

  if (nicknameUser) {
    return NextResponse.json(
      {
        error: "이미 사용 중인 닉네임입니다.",
        fieldErrors: { nickname: "다른 닉네임을 입력해 주세요." },
      },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        email,
        name: nickname,
        nickname,
        passwordHash,
        personas: gender
          ? {
              create: {
                type: PersonaType.GENDER,
                label: personaLabels[PersonaType.GENDER],
                ...normalizePersonaValue(PersonaType.GENDER, gender),
              },
            }
          : undefined,
      },
    });
  } catch (error) {
    if (hasPrismaCode(error, "P2002")) {
      return NextResponse.json(
        { error: "이미 사용 중인 계정 정보입니다." },
        { status: 409 },
      );
    }

    throw error;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

function hasPrismaCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}
