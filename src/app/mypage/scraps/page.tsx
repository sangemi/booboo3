import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AccountNavigation } from "@/components/booboo/account-navigation";
import { SiteHeader } from "@/components/booboo/site-header";
import { categoryLabels } from "@/lib/community-data";
import { listCommunityScraps } from "@/lib/community-service";

export const metadata: Metadata = {
  title: "내 스크랩 | 부부라이프",
};

export default async function MyScrapsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/mypage/scraps");
  }

  const scraps = await listCommunityScraps(session.user.id);

  return (
    <>
      <SiteHeader active="community" />
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-6 md:px-8 md:py-10">
        <section className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white md:grid md:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-[var(--line)] bg-[#fff9f3] p-5 md:border-b-0 md:border-r md:p-6">
            <h1 className="font-serif text-2xl font-bold">마이페이지</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              내 정보와 다시 보고 싶은 글을 관리하세요.
            </p>
            <AccountNavigation active="scraps" />
          </aside>

          <div className="min-w-0 p-5 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">내 스크랩</h2>
              <span className="text-xs text-[var(--ink-soft)]">
                {scraps.length}개
              </span>
            </div>

            {scraps.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-[8px] border border-[var(--line)]">
                {scraps.map((scrap) => (
                  <Link
                    key={scrap.id}
                    href={`/talk/post/${scrap.post.publicId}`}
                    className="block border-b border-[var(--line)] px-4 py-4 transition last:border-b-0 hover:bg-[#fbf6f0]"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-soft)]">
                      <span className="font-bold text-[var(--plum)]">
                        {categoryLabels[scrap.post.category]}
                      </span>
                      <span>{formatSavedAt(scrap.savedAt)}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-normal leading-6 md:text-base">
                      {scrap.post.title}
                    </h3>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 grid min-h-52 place-items-center border-y border-[var(--line)] text-center">
                <div>
                  <Bookmark className="mx-auto size-6 text-[var(--ink-soft)]" />
                  <p className="mt-3 text-sm text-[var(--ink-soft)]">
                    저장한 글이 없습니다.
                  </p>
                  <Link
                    href="/"
                    className="mt-4 inline-flex h-9 items-center rounded-[6px] border border-[var(--line)] px-3 text-sm font-bold text-[var(--plum)] hover:bg-[#faf7f4]"
                  >
                    커뮤니티에서 글 보기
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function formatSavedAt(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(value);
}
