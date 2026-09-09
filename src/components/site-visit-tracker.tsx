"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function SiteVisitTracker() {
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    void fetch("/api/site-visits", { method: "POST", keepalive: true }).catch(() => undefined);
  }, [pathname, status]);

  return null;
}
