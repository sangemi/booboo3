import type { Prisma } from "@/generated/prisma/client";
import { Search } from "lucide-react";
import Link from "next/link";

import { AdminUserTable } from "@/components/admin/admin-user-table";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 30;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const where: Prisma.UserWhereInput = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { nickname: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        nickname: true,
        name: true,
        role: true,
        cashBalance: true,
        pointBalance: true,
        createdAt: true,
        accounts: {
          select: { provider: true },
          take: 1,
        },
        _count: {
          select: { posts: true, comments: true, personas: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-7 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#302c2e]">회원 관리</h1>
          <p className="mt-1 text-sm text-[#746e6a]">
            전체 {total.toLocaleString()}명의 활동과 재화 잔액
          </p>
        </div>
        <form className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#918a85]" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="이름 또는 이메일 검색"
            className="h-10 w-full rounded-[6px] border border-[#d8d2cc] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#7a4c67] focus:ring-4 focus:ring-[#7a4c67]/10"
          />
        </form>
      </div>

      <AdminUserTable
        users={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          provider: user.accounts[0]?.provider ?? "email",
          accounts: undefined,
        }))}
      />

      {totalPages > 1 ? (
        <nav className="mt-5 flex items-center justify-center gap-1" aria-label="회원 목록 페이지">
          <PageLink page={page - 1} current={page} total={totalPages} query={query}>이전</PageLink>
          {pageNumbers(page, totalPages).map((number) => (
            <PageLink key={number} page={number} current={page} total={totalPages} query={query} compact>
              {number}
            </PageLink>
          ))}
          <PageLink page={page + 1} current={page} total={totalPages} query={query}>다음</PageLink>
        </nav>
      ) : null}
    </div>
  );
}

function PageLink({ page, current, total, query, compact, children }: { page: number; current: number; total: number; query: string; compact?: boolean; children: React.ReactNode }) {
  const disabled = page < 1 || page > total;
  const selected = page === current;
  const href = disabled ? "#" : `/admin/users?page=${page}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <Link
      href={href}
      aria-disabled={disabled}
      aria-current={selected ? "page" : undefined}
      className={`${compact ? "w-9" : "px-3"} grid h-9 place-items-center rounded-[6px] border text-sm ${selected ? "border-[#6f3d5b] bg-[#6f3d5b] text-white" : "border-[#d8d2cc] bg-white text-[#5f5956] hover:bg-[#f1eeeb]"} ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      {children}
    </Link>
  );
}

function pageNumbers(page: number, totalPages: number) {
  const start = Math.max(1, Math.min(totalPages - 4, page - 2));
  return Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);
}
