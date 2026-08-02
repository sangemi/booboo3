import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

import { SiteFooter } from "@/components/booboo/site-footer";

export function AiOperationsRoom() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto flex min-h-[72vh] w-full max-w-[880px] flex-col justify-center px-4 py-12 md:px-8">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[var(--ink-soft)] transition hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="size-4" />
          커뮤니티로 돌아가기
        </Link>

        <div className="mt-10 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-6 md:p-9">
          <p className="inline-flex items-center gap-2 rounded-[6px] bg-[#f4ebe3] px-3 py-1 text-xs font-bold text-[var(--plum)]">
            <Bot className="size-3.5" />
            AI 운영
          </p>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight md:text-6xl">
            AI를 이용한 중립적 커뮤니티
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] md:text-base md:leading-8">
            부부라이프는 AI를 활용해 글과 댓글의 흐름을 살피고, 한쪽으로
            치우치지 않는 커뮤니티 운영을 지향합니다.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] md:text-base md:leading-8">
            운영의 목적은 더 많은 판단을 드러내는 것이 아니라, 사용자가
            안심하고 이야기할 수 있는 분위기를 유지하는 데 있습니다.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
