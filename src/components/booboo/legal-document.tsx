import Link from "next/link";

import {
  legalDocuments,
  type LegalDocumentKey,
} from "@/lib/legal";
import { cn } from "@/lib/utils";

type LegalDocumentProps = {
  active: LegalDocumentKey;
  title: string;
  description: string;
  effectiveDate: string;
  version?: string;
  children: React.ReactNode;
};

export function LegalDocument({
  active,
  title,
  description,
  effectiveDate,
  version,
  children,
}: LegalDocumentProps) {
  return (
    <main className="flex-1 bg-[var(--paper)]">
      <div className="mx-auto grid w-full min-w-0 max-w-[1120px] grid-cols-[minmax(0,1fr)] gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[210px_minmax(0,760px)] lg:px-8">
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-xs font-bold text-[var(--ink-soft)]">
            정책과 약속
          </p>
          <nav
            aria-label="정책 문서"
            className="flex max-w-full flex-wrap gap-x-2 gap-y-1 border-b border-[var(--line)] pb-3 lg:grid lg:border-b-0 lg:border-l lg:pb-0"
          >
            {legalDocuments.map((document) => (
              <Link
                key={document.key}
                href={document.href}
                aria-current={active === document.key ? "page" : undefined}
                className={cn(
                  "border-b-2 px-2 py-2 text-sm transition lg:border-b-0 lg:border-l-2 lg:px-4",
                  active === document.key
                    ? "border-[var(--plum)] font-bold text-[var(--plum)]"
                    : "border-transparent text-[var(--ink-soft)] hover:text-[var(--foreground)]",
                )}
              >
                {document.label}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="min-w-0">
          <header className="border-b border-[var(--line)] pb-8">
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
              {description}
            </p>
            <p className="mt-5 text-xs text-[var(--ink-soft)]">
              시행일: {effectiveDate}
              {version ? ` · 버전 ${version}` : ""}
            </p>
          </header>

          <div className="legal-content pt-9 text-[15px] leading-7 text-[#514b46]">
            {children}
          </div>
        </article>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 scroll-mt-8">
      <h2 className="mb-4 text-lg font-bold text-[var(--foreground)] sm:text-xl">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10 border-l-4 border-[var(--coral)] bg-[#fff7f3] px-5 py-4 text-sm leading-7 text-[var(--foreground)]">
      {children}
    </div>
  );
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-5">{children}</ol>;
}

export function LegalBullets({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}

export function LegalTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="w-full max-w-full overflow-x-auto border-y border-[var(--line)]">
      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
        <thead className="bg-[#f8f2ed] text-[var(--foreground)]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-[var(--line)] px-3 py-3 font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="align-top even:bg-[#fffaf7]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-[var(--line)] px-3 py-3 last:border-r-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
