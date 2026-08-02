"use client";

import Link from "next/link";
import { Heart, LogIn, Menu, Plus, Search, UserRound, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { VerifiedName } from "@/components/booboo/verified-name";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  active: "about" | "community";
  query?: string;
  onQueryChange?: (value: string) => void;
  onWriteClick?: () => void;
};

const navItems = [
  { href: "/about", label: "소개", key: "about" },
  { href: "/", label: "커뮤니티", key: "community" },
] as const;

export function SiteHeader({
  active,
  query,
  onQueryChange,
  onWriteClick,
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const showCommunityActions = query !== undefined && onQueryChange && onWriteClick;

  return (
    <header className="border-b border-[var(--line)] bg-[rgba(255,250,246,0.9)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-[8px] bg-[var(--plum)] text-white">
            <Heart className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--leaf)]">
              Booboo Life
            </p>
            <p className="font-serif text-2xl font-bold leading-tight">
              부부라이프
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-[8px] px-3 py-2 text-sm font-bold transition",
                active === item.key
                  ? "bg-[#f4ebe3] text-[var(--plum)]"
                  : "text-[var(--ink-soft)] hover:bg-[#f7eee7] hover:text-[var(--foreground)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          {showCommunityActions ? (
            <>
              <label className="relative w-52 xl:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  className="h-10 w-full rounded-[8px] border border-[var(--line)] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[var(--plum)] focus:ring-4 focus:ring-[rgba(111,61,91,0.12)]"
                  placeholder="집안일, 사과, 기념일..."
                />
              </label>
              <button
                onClick={onWriteClick}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[var(--coral)] px-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,111,97,0.18)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[rgba(255,111,97,0.24)] lg:px-4"
              >
                <Plus className="size-4" />
                글쓰기
              </button>
            </>
          ) : null}

          {status === "authenticated" && session.user ? (
            <Link
              href="/mypage"
              className="ml-1 flex h-10 max-w-36 items-center gap-2 rounded-[8px] border border-[var(--line)] bg-white px-2.5 hover:bg-[#faf7f4]"
            >
              <UserRound className="size-4 shrink-0 text-[var(--plum)]" />
              <VerifiedName
                name={session.user.name || "마이페이지"}
                verifiedCount={session.user.verifiedPersonaCount}
                compact
              />
            </Link>
          ) : status === "unauthenticated" ? (
            <Link
              href="/login"
              className="ml-1 inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[var(--line)] bg-white px-3 text-sm font-bold hover:bg-[#faf7f4]"
            >
              <LogIn className="size-4" />
              로그인
            </Link>
          ) : (
            <span className="ml-1 h-10 w-20 rounded-[8px] bg-[#f4ebe3]" />
          )}
        </div>

        <button
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setMobileOpen((value) => !value)}
          className="grid size-10 place-items-center rounded-[8px] border border-[var(--line)] bg-white text-[var(--foreground)] lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[var(--line)] bg-[var(--paper)] px-4 py-3 lg:hidden">
          <nav className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-[8px] px-3 py-3 text-sm font-bold",
                  active === item.key
                    ? "bg-[#f4ebe3] text-[var(--plum)]"
                    : "text-[var(--foreground)]",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={session?.user ? "/mypage" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-[8px] px-3 py-3 text-sm font-bold text-[var(--foreground)]"
            >
              {session?.user ? <UserRound className="size-4" /> : <LogIn className="size-4" />}
              {session?.user ? "마이페이지" : "로그인"}
            </Link>
          </nav>

          {showCommunityActions ? (
            <div className="mt-3 grid gap-2">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  className="h-10 w-full rounded-[8px] border border-[var(--line)] bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--plum)]"
                  placeholder="게시글 검색"
                />
              </label>
              <button
                onClick={() => {
                  onWriteClick();
                  setMobileOpen(false);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[var(--coral)] px-4 text-sm font-bold text-white"
              >
                <Plus className="size-4" />
                글쓰기
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
