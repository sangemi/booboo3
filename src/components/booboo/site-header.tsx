"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { VerifiedName } from "@/components/booboo/verified-name";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  active: "about" | "community" | "company";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const showCommunityActions = query !== undefined && onQueryChange && onWriteClick;

  useEffect(() => {
    if (!profileOpen) return;

    const closeProfile = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof MouseEvent &&
        profileMenuRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setProfileOpen(false);
    };

    document.addEventListener("mousedown", closeProfile);
    window.addEventListener("keydown", closeProfile);
    return () => {
      document.removeEventListener("mousedown", closeProfile);
      window.removeEventListener("keydown", closeProfile);
    };
  }, [profileOpen]);

  return (
    <header className="relative z-[80] border-b border-[var(--line)] bg-[rgba(255,250,246,0.9)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/booboolife-mark-192.png"
            alt=""
            width={44}
            height={44}
            priority
            className="size-11 shrink-0 object-contain"
          />
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
            <div ref={profileMenuRef} className="relative ml-1">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex h-10 max-w-40 items-center gap-2 rounded-[8px] border border-[var(--line)] bg-white px-2.5 hover:bg-[#faf7f4]"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <UserRound className="size-4 shrink-0 text-[var(--plum)]" />
                <VerifiedName
                  name={session.user.name || "마이페이지"}
                  verifiedCount={session.user.verifiedPersonaCount}
                  compact
                />
                <ChevronDown className="size-3.5 shrink-0 text-[var(--ink-soft)]" />
              </button>

              {profileOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-12 z-[100] w-48 overflow-hidden rounded-[8px] border border-[var(--line)] bg-white py-1 shadow-[0_16px_40px_rgba(44,41,38,0.16)]"
                >
                  <Link href="/mypage" onClick={() => setProfileOpen(false)} role="menuitem" className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-[#faf7f4]">
                    <UserRound className="size-4 text-[var(--ink-soft)]" /> 내 프로필
                  </Link>
                  <Link href="/mypage/scraps" onClick={() => setProfileOpen(false)} role="menuitem" className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-[#faf7f4]">
                    <Bookmark className="size-4 text-[var(--ink-soft)]" /> 내 스크랩
                  </Link>
                  {session.user.isAdmin ? (
                    <Link href="/admin" onClick={() => setProfileOpen(false)} role="menuitem" className="flex items-center gap-2.5 border-t border-[var(--line)] px-3 py-2.5 text-sm font-bold text-[var(--plum)] hover:bg-[#f7eee7]">
                      <ShieldCheck className="size-4" /> 관리자
                    </Link>
                  ) : null}
                  <button type="button" onClick={() => signOut({ redirectTo: "/" })} role="menuitem" className="flex w-full items-center gap-2.5 border-t border-[var(--line)] px-3 py-2.5 text-left text-sm text-[var(--ink-soft)] hover:bg-[#faf7f4]">
                    <LogOut className="size-4" /> 로그아웃
                  </button>
                </div>
              ) : null}
            </div>
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
            {session?.user?.isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-[8px] px-3 py-3 text-sm font-bold text-[var(--plum)]"
              >
                <ShieldCheck className="size-4" />
                관리자
              </Link>
            ) : null}
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
