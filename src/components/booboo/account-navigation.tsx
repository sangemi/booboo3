import { Bookmark, UserRound } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const accountItems = [
  { key: "profile", href: "/mypage", label: "내 프로필", icon: UserRound },
  {
    key: "scraps",
    href: "/mypage/scraps",
    label: "내 스크랩",
    icon: Bookmark,
  },
] as const;

export function AccountNavigation({
  active,
}: {
  active: (typeof accountItems)[number]["key"];
}) {
  return (
    <nav aria-label="마이페이지 메뉴" className="mt-6 grid gap-1">
      {accountItems.map((item) => {
        const Icon = item.icon;
        const selected = item.key === active;

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-2 rounded-[6px] px-3 text-sm transition",
              selected
                ? "bg-[#f4ebe3] font-bold text-[var(--plum)]"
                : "text-[var(--ink-soft)] hover:bg-[#faf7f4] hover:text-[var(--foreground)]",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
