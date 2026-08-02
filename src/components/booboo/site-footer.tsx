import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";

import { legalDocuments } from "@/lib/legal";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[#2d2930] text-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-7 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-white/10">
              <Bot className="size-5 text-[#f7c948]" />
            </div>
            <div>
              <p className="max-w-2xl text-sm font-extrabold leading-6">
                부부라이프는 AI 기술을 활용해 편향되지 않고 공정한 커뮤니티
                환경을 만듭니다.
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

        <div className="mt-6 flex flex-col gap-3 border-t border-white/12 pt-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="서비스 정책" className="flex flex-wrap gap-x-4 gap-y-2">
            {legalDocuments.map((document) => (
              <Link key={document.key} href={document.href} className="hover:text-white">
                {document.label}
              </Link>
            ))}
          </nav>
          <p className="shrink-0">© {new Date().getFullYear()} 부부라이프</p>
        </div>
      </div>
    </footer>
  );
}
