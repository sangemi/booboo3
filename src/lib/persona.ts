import {
  PersonaReviewStatus,
  PersonaType,
  PersonaVerificationSource,
  PersonaVerificationStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import {
  formatMarriageYear,
  marriageYearRange,
  parseMarriageYear,
} from "@/lib/marriage-persona";

export const personaLabels: Record<PersonaType, string> = {
  [PersonaType.GENDER]: "성별",
  [PersonaType.AGE_GROUP]: "나이대",
  [PersonaType.EMPLOYER]: "직장",
  [PersonaType.PROFESSION]: "직업",
  [PersonaType.MARRIAGE_YEARS]: "결혼연도",
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
    // The enum name is kept for database compatibility; its value is now a marriage year.
    const marriageYear = parseMarriageYear(value);
    if (marriageYear === null) {
      const range = marriageYearRange();
      throw new Error(
        `결혼연도는 ${range.min}년부터 ${range.max}년 사이의 네 자리 숫자로 입력해 주세요.`,
      );
    }

    return {
      value: formatMarriageYear(marriageYear),
      normalizedValue: String(marriageYear),
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
  const ageRange = readKakaoAgeRange(input.provider, input.profile);
  const claims = [
    gender
      ? {
          type: PersonaType.GENDER,
          value: gender === "male" ? "남성" : "여성",
          normalizedValue: gender,
          claim: "gender",
        }
      : null,
    ageRange
      ? {
          type: PersonaType.AGE_GROUP,
          value: formatAgeRange(ageRange),
          normalizedValue: ageRange,
          claim: "age_range",
        }
      : null,
  ].filter((claim) => claim !== null);

  if (claims.length === 0) return;

  const source =
    input.provider === "kakao"
      ? PersonaVerificationSource.KAKAO
      : PersonaVerificationSource.GOOGLE;

  await prisma.$transaction(async (tx) => {
    for (const claim of claims) {
      const sourceRef = `${input.provider}:${input.providerAccountId}:${claim.claim}`;
      const persona = await tx.userPersona.upsert({
        where: {
          userId_type_normalizedValue: {
            userId: input.userId,
            type: claim.type,
            normalizedValue: claim.normalizedValue,
          },
        },
        create: {
          userId: input.userId,
          type: claim.type,
          label: personaLabels[claim.type],
          value: claim.value,
          normalizedValue: claim.normalizedValue,
          status: PersonaVerificationStatus.VERIFIED,
          source,
          sourceRef,
          verifiedAt: new Date(),
        },
        update: {
          value: claim.value,
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
            evidence: { claim: claim.claim, provider: input.provider },
          },
        });
      }
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

function readKakaoAgeRange(provider: string, profile: unknown) {
  if (provider !== "kakao" || !profile || typeof profile !== "object") {
    return null;
  }

  const kakaoAccount = (profile as Record<string, unknown>).kakao_account;
  if (!kakaoAccount || typeof kakaoAccount !== "object") return null;

  const ageRange = (kakaoAccount as Record<string, unknown>).age_range;
  if (typeof ageRange !== "string") return null;

  return /^\d+~(?:\d+)?$/.test(ageRange) ? ageRange : null;
}

function formatAgeRange(ageRange: string) {
  const [minimum, maximum] = ageRange.split("~");

  if (!maximum) return `${minimum}세 이상`;
  if (minimum.endsWith("0") && Number(maximum) === Number(minimum) + 9) {
    return `${minimum.slice(0, -1)}0대`;
  }

  return `${minimum}~${maximum}세`;
}
