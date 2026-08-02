import { BadgeCheck, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type VerifiedNameProps = {
  name: string;
  verifiedCount: number;
  compact?: boolean;
};

export function VerifiedName({
  name,
  verifiedCount,
  compact = false,
}: VerifiedNameProps) {
  const tier =
    verifiedCount >= 5 ? 3 : verifiedCount >= 3 ? 2 : verifiedCount >= 1 ? 1 : 0;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5",
        compact ? "text-sm" : "text-xl md:text-2xl",
        tier === 0 && "text-[var(--foreground)]",
        tier === 1 && "font-bold text-[var(--leaf)]",
        tier === 2 && "font-bold text-[var(--plum)]",
        tier === 3 &&
          "font-extrabold text-[var(--plum)] [text-shadow:0_0_18px_rgba(247,201,72,0.5)]",
      )}
    >
      {tier === 3 ? (
        <Sparkles className={cn("shrink-0 text-[var(--butter)]", compact ? "size-4" : "size-5")} />
      ) : null}
      <span className="truncate">{name}</span>
      {tier > 0 ? (
        <BadgeCheck
          className={cn(
            "shrink-0",
            compact ? "size-4" : "size-5",
            tier === 1 && "text-[var(--leaf)]",
            tier >= 2 && "text-[var(--coral)]",
          )}
        />
      ) : null}
    </span>
  );
}
