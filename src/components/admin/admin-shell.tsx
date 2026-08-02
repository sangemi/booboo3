"use client";

import {
  ArrowLeft,
  Coins,
  FileText,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "운영 현황", icon: LayoutDashboard },
  { href: "/admin/users", label: "회원 관리", icon: Users },
  { href: "/admin/posts", label: "게시글 관리", icon: FileText },
  { href: "/admin/assets", label: "캐시·포인트", icon: Coins },
] as const;

export function AdminShell({
  children,
  adminName,
  adminEmail,
}: {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#f7f5f2] md:flex">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-30 grid size-10 place-items-center rounded-[6px] border border-[#ded9d3] bg-white text-[#393536] shadow-sm md:hidden"
        aria-label="관리자 메뉴 열기"
      >
        <Menu className="size-5" />
      </button>

      {mobileOpen ? (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 md:hidden"
          aria-label="관리자 메뉴 닫기"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-[#302c2e] text-white transition-transform md:sticky md:top-0 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/admin" className="min-w-0">
            <p className="text-xs font-bold text-[#d9b7ca]">BOOBOO LIFE</p>
            <p className="mt-0.5 truncate text-sm font-bold">관리자</p>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid size-8 place-items-center rounded-[6px] text-white/70 hover:bg-white/10 md:hidden"
            aria-label="관리자 메뉴 닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="관리자 메뉴">
          {adminLinks.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-[6px] px-3 text-sm font-semibold transition",
                  active
                    ? "bg-white text-[#302c2e]"
                    : "text-white/72 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="px-2 py-2">
            <p className="truncate text-xs font-bold">{adminName}</p>
            <p className="mt-1 truncate text-[11px] text-white/50">{adminEmail}</p>
          </div>
          <Link
            href="/"
            className="mt-1 flex h-9 items-center gap-2 rounded-[6px] px-2 text-xs font-semibold text-white/65 hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            커뮤니티로 돌아가기
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="h-16 border-b border-[#ded9d3] bg-white px-16 py-5 text-sm font-bold text-[#494345] md:px-7">
          부부라이프 운영
        </div>
        {children}
      </main>
    </div>
  );
}
