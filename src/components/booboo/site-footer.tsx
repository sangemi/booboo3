import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";

import { legalDocuments, operator } from "@/lib/legal";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[#2d2930] text-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-9 md:px-8 md:py-11">
        <div className="grid gap-9 md:grid-cols-[minmax(0,1.3fr)_minmax(180px,0.7fr)_minmax(280px,1fr)] md:gap-8">
          <section aria-labelledby="footer-brand-heading">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-white/10">
                <Bot className="size-5 text-[#f7c948]" />
              </div>
              <div>
                <h2 id="footer-brand-heading" className="text-base font-extrabold">
                  부부라이프
                </h2>
                <p className="mt-2 max-w-md break-keep text-sm leading-6 text-white/65">
                  부부라이프는 AI 기술을 활용해 편향되지 않고 공정한 커뮤니티
                  환경을 만듭니다.
                </p>
              </div>
            </div>

            <Link
              href="/ai-operations"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-[#f7c948] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f7c948]"
            >
              AI운영실
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>

          <nav aria-labelledby="footer-policy-heading">
            <h2 id="footer-policy-heading" className="text-sm font-extrabold">
              정책
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              {legalDocuments.map((document) => (
                <li key={document.key}>
                  <Link href={document.href} className="hover:text-white">
                    {document.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-company-heading">
            <h2 id="footer-company-heading" className="text-sm font-extrabold">
              OPT92 사업자 정보
            </h2>
            <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs leading-5 text-white/60">
              <dt>상호명</dt>
              <dd>{operator.businessName}</dd>
              <dt>대표자명</dt>
              <dd>{operator.representative}</dd>
              <dt>사업자등록번호</dt>
              <dd>{operator.businessNumber}</dd>
              <dt>주소</dt>
              <dd className="break-keep">{operator.address}</dd>
              <dt>연락처</dt>
              <dd>{operator.phone}</dd>
              <dt>문의</dt>
              <dd>
                <a href={`mailto:${operator.email}`} className="hover:text-white">
                  {operator.email}
                </a>
              </dd>
            </dl>
          </section>
        </div>

        <div className="mt-9 border-t border-white/12 pt-5 text-xs text-white/45">
          <p>© {new Date().getFullYear()} 부부라이프. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
