export const legalDocuments = [
  { href: "/company/terms", label: "이용약관", key: "terms" },
  { href: "/company/privacy", label: "개인정보처리방침", key: "privacy" },
  {
    href: "/company/privacy-collect",
    label: "개인정보 수집·이용 동의",
    key: "privacy-collect",
  },
  {
    href: "/company/community-policy",
    label: "커뮤니티 운영정책",
    key: "community-policy",
  },
  {
    href: "/company/youth-protection",
    label: "청소년 보호정책",
    key: "youth-protection",
  },
] as const;

export type LegalDocumentKey = (typeof legalDocuments)[number]["key"];

export const operator = {
  serviceName: "부부라이프",
  businessName: "오피티92",
  representative: "김상겸",
  businessNumber: "839-44-01226",
  address: "서울시 강남구 남부순환로 363길 49, 1-308",
  phone: "010-4775-0852",
  email: "help@booboolife.com",
} as const;

export const legalEffectiveDate = "2026년 8월 2일";
