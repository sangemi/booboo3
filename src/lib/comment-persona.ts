export const commentPersonaTypes = [
  "GENDER",
  "AGE_GROUP",
  "MARRIAGE_YEARS",
  "PARENTING",
  "PROFESSION",
] as const;

export type CommentPersonaType = (typeof commentPersonaTypes)[number];
export type CommentPersonaRequestLevel = "REQUESTED" | "REQUIRED";

export type CommentPersonaRequest = {
  type: CommentPersonaType;
  level: CommentPersonaRequestLevel;
};

export type CommentPersonaSnapshot = {
  type: CommentPersonaType;
  label: string;
  value: string;
  verified: boolean;
};

export type CommentPersonaDisclosure = {
  type: CommentPersonaType;
  personaId?: string;
  value?: string;
  skip?: boolean;
};

export const commentPersonaLabels: Record<CommentPersonaType, string> = {
  GENDER: "성별",
  AGE_GROUP: "나이대",
  MARRIAGE_YEARS: "결혼연도",
  PARENTING: "부모 경험",
  PROFESSION: "직업",
};

export const defaultCommentPersonaRequests: CommentPersonaRequest[] = [
  { type: "GENDER", level: "REQUESTED" },
  { type: "AGE_GROUP", level: "REQUESTED" },
  { type: "MARRIAGE_YEARS", level: "REQUESTED" },
];

export function isCommentPersonaType(
  value: unknown,
): value is CommentPersonaType {
  return commentPersonaTypes.includes(value as CommentPersonaType);
}

export function normalizeCommentPersonaRequests(
  value: unknown,
  legacyGenderRequest = false,
) {
  const requests = Array.isArray(value)
    ? value.flatMap((item): CommentPersonaRequest[] => {
        if (!item || typeof item !== "object") return [];
        const record = item as Record<string, unknown>;
        if (!isCommentPersonaType(record.type)) return [];
        if (record.level !== "REQUESTED" && record.level !== "REQUIRED") {
          return [];
        }
        return [{ type: record.type, level: record.level }];
      })
    : [];

  if (legacyGenderRequest && requests.length === 0) {
    requests.push(...defaultCommentPersonaRequests);
  } else if (
    legacyGenderRequest &&
    !requests.some((request) => request.type === "GENDER")
  ) {
    requests.unshift({ type: "GENDER", level: "REQUESTED" });
  }

  return uniqueByType(requests);
}

export function normalizeCommentPersonaSnapshots(value: unknown) {
  if (!Array.isArray(value)) return [];

  return uniqueByType(
    value.flatMap((item): CommentPersonaSnapshot[] => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      if (
        !isCommentPersonaType(record.type) ||
        typeof record.label !== "string" ||
        typeof record.value !== "string" ||
        typeof record.verified !== "boolean"
      ) {
        return [];
      }
      return [
        {
          type: record.type,
          label: record.label,
          value: record.value,
          verified: record.verified,
        },
      ];
    }),
  );
}

function uniqueByType<T extends { type: CommentPersonaType }>(items: T[]) {
  const seen = new Set<CommentPersonaType>();
  return items.filter((item) => {
    if (seen.has(item.type)) return false;
    seen.add(item.type);
    return true;
  });
}
