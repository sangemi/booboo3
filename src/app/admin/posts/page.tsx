import type { Prisma } from "@/generated/prisma/client";
import { Filter, Search } from "lucide-react";
import Link from "next/link";

import { AdminPostTable } from "@/components/admin/admin-post-table";
import { categoryLabels } from "@/lib/community-data";
import {
  categoryFromDb,
  categoryToDb,
} from "@/lib/community-service";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 40;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const category = isPostCategory(params.category) ? params.category : "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const where: Prisma.PostWhereInput = {
    ...(category ? { category: categoryToDb[category] } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { body: { contains: query, mode: "insensitive" } },
            { authorName: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        publicId: true,
        title: true,
        category: true,
        authorName: true,
        isAnonymous: true,
        createdAt: true,
        _count: { select: { comments: true, reactions: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-7 md:py-8">
      <div>
        <h1 className="text-xl font-bold text-[#302c2e]">게시글 관리</h1>
        <p className="mt-1 text-sm text-[#746e6a]">전체 {total.toLocaleString()}개 · 선택한 글과 관련 댓글·반응을 함께 삭제합니다.</p>
      </div>

      <form className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#918a85]" />
          <input type="search" name="q" defaultValue={query} placeholder="제목, 본문, 작성자 검색" className="h-10 w-full rounded-[6px] border border-[#d8d2cc] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#7a4c67] focus:ring-4 focus:ring-[#7a4c67]/10" />
        </label>
        <label className="relative sm:w-44">
          <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#918a85]" />
          <select name="category" defaultValue={category} className="h-10 w-full appearance-none rounded-[6px] border border-[#d8d2cc] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#7a4c67]">
            <option value="">전체 게시판</option>
            {Object.keys(categoryToDb).map((value) => {
              const key = value as keyof typeof categoryToDb;
              return <option key={key} value={key}>{categoryLabels[key]}</option>;
            })}
          </select>
        </label>
        <button type="submit" className="h-10 rounded-[6px] bg-[#302c2e] px-4 text-sm font-bold text-white">조회</button>
      </form>

      <AdminPostTable posts={posts.map((post) => ({ ...post, category: categoryFromDb[post.category], createdAt: post.createdAt.toISOString() }))} />

      {totalPages > 1 ? (
        <nav className="mt-5 flex items-center justify-center gap-2 text-sm" aria-label="게시글 목록 페이지">
          <PostPageLink page={page - 1} current={page} total={totalPages} query={query} category={category}>이전</PostPageLink>
          <span className="px-3 text-xs text-[#746e6a]">{page} / {totalPages}</span>
          <PostPageLink page={page + 1} current={page} total={totalPages} query={query} category={category}>다음</PostPageLink>
        </nav>
      ) : null}
    </div>
  );
}

function PostPageLink({ page, current, total, query, category, children }: { page: number; current: number; total: number; query: string; category: string; children: React.ReactNode }) {
  const disabled = page < 1 || page > total || page === current;
  const search = new URLSearchParams({ page: String(page) });
  if (query) search.set("q", query);
  if (category) search.set("category", category);
  return <Link href={disabled ? "#" : `/admin/posts?${search}`} aria-disabled={disabled} className={`rounded-[6px] border border-[#d8d2cc] bg-white px-3 py-2 ${disabled ? "pointer-events-none opacity-40" : "hover:bg-[#f1eeeb]"}`}>{children}</Link>;
}

function isPostCategory(value?: string): value is keyof typeof categoryToDb {
  return Boolean(value && value in categoryToDb);
}
