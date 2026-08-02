import { Suspense } from "react";

import { AuthForm } from "@/components/booboo/auth-form";
import { SiteHeader } from "@/components/booboo/site-header";

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
    </>
  );
}
