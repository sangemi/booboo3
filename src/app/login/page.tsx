import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthForm } from "@/components/booboo/auth-form";
import { SiteFooter } from "@/components/booboo/site-footer";
import { SiteHeader } from "@/components/booboo/site-header";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader active="community" />
      <main className="grid flex-1 place-items-center px-4 py-10 md:py-16">
        <Suspense>
          <AuthForm
            mode="login"
            googleEnabled={Boolean(
              process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
            )}
            kakaoEnabled={Boolean(
              process.env.AUTH_KAKAO_ID && process.env.AUTH_KAKAO_SECRET,
            )}
          />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
