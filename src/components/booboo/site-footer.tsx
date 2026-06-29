import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[#2d2930] text-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-7 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-white/10">
            <Bot className="size-5 text-[#f7c948]" />
          </div>
          <div>
            <p className="text-sm font-extrabold">
              이 사이트의 운영은 AI가 합니다
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/68">
              부부라이프의 운영 판단, 제안 검토, 커뮤니티 조정 기준은
              공개 가능한 형태로 기록합니다.
            </p>
          </div>
        </div>

        <Link
          href="/ai-operations"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-sm font-bold text-[#2d2930] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-white/20"
        >
          AI운영실
          <ExternalLink className="size-4" />
        </Link>
      </div>
    </footer>
  );
}
