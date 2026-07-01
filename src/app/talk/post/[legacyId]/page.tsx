import { MessageCircle, ThumbsDown, ThumbsUp, Timer, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/booboo/site-footer";
import { prisma } from "@/lib/db";

type LegacyPostPageProps = {
  params: Promise<{ legacyId: string }>;
};

export async function generateMetadata({
  params,
}: LegacyPostPageProps): Promise<Metadata> {
  const { legacyId } = await params;
  const post = await getLegacyPost(Number(legacyId));

  if (!post) {
    return {
      title: "글을 찾을 수 없습니다 | 부부라이프",
    };
  }

  return {
    title: `${post.title} | 부부라이프`,
    description: post.body.slice(0, 140),
    alternates: {
      canonical: `/talk/post/${legacyId}`,
    },
  };
}

export default async function LegacyPostPage({ params }: LegacyPostPageProps) {
  const { legacyId } = await params;
  const post = await getLegacyPost(Number(legacyId));

  if (!post) notFound();

  const createdAt = post.legacyCreatedAt ?? post.createdAt;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--line)] bg-[rgba(255,250,246,0.9)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="font-serif text-2xl font-bold">
            부부라이프
          </Link>
          <Link
            href="/"
            className="rounded-[8px] border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold text-[var(--ink-soft)]"
          >
            커뮤니티 홈
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-[6px] bg-[#f4ebe3] px-2 py-1 text-xs font-bold text-[var(--plum)]">
            booboo2 이관글
          </span>
          <span className="rounded-[6px] bg-[#eef7f1] px-2 py-1 text-xs font-bold text-[var(--leaf)]">
            legacy #{post.legacyId}
          </span>
        </div>

        <section className="rounded-[8px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_48px_rgba(75,54,38,0.08)] md:p-8">
          <h1 className="font-serif text-3xl font-bold leading-tight md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-[var(--ink-soft)]">
            <span className="inline-flex items-center gap-1">
              <Users className="size-4" />
              {post.authorName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Timer className="size-4" />
              {formatDate(createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-4" />
              댓글 {post.comments.length}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-y border-[var(--line)] py-4 text-center text-sm">
            <Metric label="조회" value={post.legacyViewCount ?? 0} />
            <Metric
              icon={ThumbsUp}
              label="공감"
              value={post.legacyLikeCount ?? 0}
            />
            <Metric
              icon={ThumbsDown}
              label="비공감"
              value={post.legacyDislikeCount ?? 0}
            />
          </div>

          <div className="mt-7 whitespace-pre-line text-base leading-8 text-[var(--foreground)]">
            {post.body}
          </div>
        </section>

        <section className="mt-5 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-5 md:p-6">
          <h2 className="text-lg font-extrabold">댓글 {post.comments.length}</h2>
          <div className="mt-4 space-y-3">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-[8px] border border-[var(--line)] bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm">{comment.authorName}</strong>
                  <span className="text-xs text-[var(--ink-soft)]">
                    {formatDate(comment.legacyCreatedAt ?? comment.createdAt)}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--ink-soft)]">
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}

async function getLegacyPost(legacyId: number) {
  if (!Number.isInteger(legacyId)) return null;

  return prisma.post.findUnique({
    where: { legacyId },
    include: {
      comments: {
        orderBy: [{ legacyCreatedAt: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-center gap-1 font-serif text-2xl font-bold">
        {Icon ? <Icon className="size-4 text-[var(--coral)]" /> : null}
        {value.toLocaleString("ko-KR")}
      </div>
      <div className="mt-1 text-xs font-bold text-[var(--ink-soft)]">{label}</div>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
