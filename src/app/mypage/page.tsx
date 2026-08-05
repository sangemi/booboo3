import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProfileManager } from "@/components/booboo/profile-manager";
import { SiteHeader } from "@/components/booboo/site-header";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

export default async function MyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/mypage");

  return (
    <>
      <SiteHeader active="community" />
      <ProfileManager />
    </>
  );
}
