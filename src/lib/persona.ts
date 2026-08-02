import {
  PersonaReviewStatus,
  PersonaType,
  PersonaVerificationSource,
  PersonaVerificationStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";

export const personaLabels: Record<PersonaType, string> = {
  [PersonaType.GENDER]: "성별",
  [PersonaType.AGE_GROUP]: "나이대",
  [PersonaType.EMPLOYER]: "직장",
  [PersonaType.PROFESSION]: "직업",
  [PersonaType.MARRIAGE_YEARS]: "결혼 연차",
  [PersonaType.PARENTING]: "부모 경험",
  [PersonaType.OTHER]: "나를 설명하는 말",
};

export function normalizePersonaValue(type: PersonaType, rawValue: string) {
  const value = rawValue.trim().replace(/\s+/g, " ");

  if (type === PersonaType.GENDER) {
    const gender =
      value === "남성" || value.toLowerCase() === "male"
        ? "male"
        : value === "여성" || value.toLowerCase() === "female"
          ? "female"
          : null;

    if (!gender) {
      throw new Error("성별을 다시 선택해 주세요.");
    }

    return {
      value: gender === "male" ? "남성" : "여성",
      normalizedValue: gender,
    };
  }

  if (type === PersonaType.MARRIAGE_YEARS) {
    const years = Number(value.replace(/[^0-9]/g, ""));
    if (!Number.isInteger(years) || years < 0 || years > 80) {
      throw new Error("결혼 연차는 0년부터 80년 사이로 입력해 주세요.");
    }

    return {
      value: years === 0 ? "신혼" : `결혼 ${years}년 차`,
      normalizedValue: String(years),
    };
  }

  return {
    value,
    normalizedValue: value.toLocaleLowerCase("ko-KR"),
  };
}

type SocialPersonaInput = {
  userId: string;
  provider: string;
  providerAccountId: string;
  profile?: unknown;
};

export async function syncSocialPersonas(input: SocialPersonaInput) {
  const gender = readSocialGender(input.provider, input.profile);
  if (!gender) return;

  const source =
    input.provider === "kakao"
      ? PersonaVerificationSource.KAKAO
      : PersonaVerificationSource.GOOGLE;
  const sourceRef = `${input.provider}:${input.providerAccountId}:gender`;

  await prisma.$transaction(async (tx) => {
    const persona = await tx.userPersona.upsert({
      where: {
        userId_type_normalizedValue: {
          userId: input.userId,
          type: PersonaType.GENDER,
          normalizedValue: gender,
        },
      },
      create: {
        userId: input.userId,
        type: PersonaType.GENDER,
        label: personaLabels[PersonaType.GENDER],
        value: gender === "male" ? "남성" : "여성",
        normalizedValue: gender,
        status: PersonaVerificationStatus.VERIFIED,
        source,
        sourceRef,
        verifiedAt: new Date(),
      },
      update: {
        status: PersonaVerificationStatus.VERIFIED,
        source,
        sourceRef,
        verifiedAt: new Date(),
      },
    });

    const existingVerification = await tx.personaVerification.findFirst({
      where: {
        personaId: persona.id,
        source,
        sourceRef,
        status: PersonaReviewStatus.APPROVED,
      },
      select: { id: true },
    });

    if (!existingVerification) {
      await tx.personaVerification.create({
        data: {
          personaId: persona.id,
          source,
          sourceRef,
          status: PersonaReviewStatus.APPROVED,
          reviewedAt: new Date(),
          evidence: { claim: "gender", provider: input.provider },
        },
      });
    }
  });
}

function readSocialGender(provider: string, profile: unknown) {
  if (!profile || typeof profile !== "object") return null;

  const record = profile as Record<string, unknown>;
  const directGender = normalizeGender(record.gender);
  if (directGender) return directGender;

  if (provider !== "kakao") return null;

  const kakaoAccount = record.kakao_account;
  if (!kakaoAccount || typeof kakaoAccount !== "object") return null;

  return normalizeGender(
    (kakaoAccount as Record<string, unknown>).gender,
  );
}

function normalizeGender(value: unknown): "male" | "female" | null {
  if (value === "male" || value === "female") return value;
  return null;
}
