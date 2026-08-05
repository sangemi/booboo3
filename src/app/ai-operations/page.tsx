import type { Metadata } from "next";

import { AiOperationsRoom } from "@/components/booboo/ai-operations-room";

export const metadata: Metadata = {
  title: "AI 운영방",
  description: "AI 기술을 활용해 편향되지 않은 커뮤니티 운영을 지향합니다.",
  alternates: { canonical: "/ai-operations" },
  openGraph: { url: "/ai-operations" },
};

export default function AiOperationsPage() {
  return <AiOperationsRoom />;
}
