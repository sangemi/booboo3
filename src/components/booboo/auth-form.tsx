"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle, MessageCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { type Resolver, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

type AuthFormProps = {
  mode: "login" | "register";
  googleEnabled: boolean;
  kakaoEnabled: boolean;
};

const loginSchema = z.object({
  email: z.string().trim().email("이메일 형식을 확인해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

const registerSchema = loginSchema.extend({
  nickname: z
    .string()
    .trim()
    .min(2, "닉네임은 2자 이상 입력해 주세요.")
    .max(20, "닉네임은 20자까지 쓸 수 있어요.")
    .regex(
      /^[가-힣a-zA-Z0-9_]+$/,
      "한글, 영문, 숫자, 밑줄만 쓸 수 있어요.",
    ),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상 입력해 주세요.")
    .max(72, "비밀번호는 72자까지 쓸 수 있어요."),
  gender: z.enum(["남성", "여성"]).optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type AuthValues = LoginForm & {
  nickname: string;
  gender?: "남성" | "여성";
};

export function AuthForm({ mode, googleEnabled, kakaoEnabled }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(
    searchParams.get("callbackUrl") ?? searchParams.get("redirect"),
  );
  const [error, setError] = useState("");
  const [socialLoading, setSocialLoading] = useState<"google" | "kakao" | null>(
    null,
  );
  const isRegister = mode === "register";
  const schema = isRegister ? registerSchema : loginSchema;
  const form = useForm<AuthValues>({
    resolver: zodResolver(schema) as unknown as Resolver<AuthValues>,
    defaultValues: isRegister
      ? { nickname: "", email: "", password: "", gender: undefined }
      : { nickname: "", email: "", password: "", gender: undefined },
  });
  const selectedGender = useWatch({ control: form.control, name: "gender" });

  async function submit(values: AuthValues) {
    setError("");

    if (isRegister) {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const fieldErrors = data.fieldErrors as
          | Record<string, string | undefined>
          | undefined;
        if (fieldErrors) {
          for (const [field, message] of Object.entries(fieldErrors)) {
            if (message) {
              form.setError(field as keyof AuthValues, { message });
            }
          }
        }
        setError(data.error || "가입을 마치지 못했습니다.");
        return;
      }
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      redirectTo,
    });

    if (result?.error) {
      setError(
        isRegister
          ? "가입은 완료됐지만 자동 로그인에 실패했습니다. 다시 로그인해 주세요."
          : "이메일 또는 비밀번호가 올바르지 않습니다.",
      );
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function socialLogin(provider: "google" | "kakao") {
    const enabled = provider === "google" ? googleEnabled : kakaoEnabled;
    if (!enabled) {
      setError(`현재 ${provider === "google" ? "Google" : "카카오"} 로그인을 사용할 수 없습니다.`);
      return;
    }

    setError("");
    setSocialLoading(provider);
    await signIn(provider, { redirectTo });
  }

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const nicknameError = isRegister
    ? form.formState.errors.nickname?.message
    : undefined;
  return (
    <div className="w-full max-w-[440px] rounded-[8px] border border-[var(--line)] bg-white p-6 shadow-[0_18px_60px_rgba(82,56,47,0.08)] md:p-8">
      <div className="mb-7">
        <p className="text-xs font-bold text-[var(--leaf)]">
          {isRegister ? "부부라이프 시작하기" : "다시 만나 반가워요"}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">
          {isRegister ? "반갑습니다." : "로그인"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          {isRegister
            ? "행복을 위한 커뮤니티에 오신 것을 환영합니다."
            : "행복한 우리가 되는 방법."}
        </p>
      </div>

      <div className="grid gap-2.5">
        <button
          type="button"
          onClick={() => socialLogin("google")}
          disabled={Boolean(socialLoading)}
          className="flex h-11 items-center justify-center gap-3 rounded-[8px] border border-[var(--line)] bg-white text-sm font-bold transition hover:bg-[#faf7f4] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {socialLoading === "google" ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <span className="grid size-5 place-items-center font-bold text-[#4285f4]">G</span>
          )}
          Google로 계속하기
        </button>
        <button
          type="button"
          onClick={() => socialLogin("kakao")}
          disabled={Boolean(socialLoading)}
          className="flex h-11 items-center justify-center gap-3 rounded-[8px] bg-[#fee500] text-sm font-bold text-[#241d00] transition hover:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {socialLoading === "kakao" ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <MessageCircle className="size-5 fill-current" />
          )}
          카카오로 계속하기
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-[var(--ink-soft)]">
        <span className="h-px flex-1 bg-[var(--line)]" />
        이메일로 {isRegister ? "가입" : "로그인"}
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
        {isRegister ? (
          <Field label="닉네임" error={nicknameError}>
            <input
              {...form.register("nickname")}
              type="text"
              autoComplete="nickname"
              placeholder="커뮤니티에서 사용할 이름"
              className={inputClass(Boolean(nicknameError))}
            />
          </Field>
        ) : null}

        <Field label="이메일" error={emailError}>
          <input
            {...form.register("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            className={inputClass(Boolean(emailError))}
          />
        </Field>

        <Field label="비밀번호" error={passwordError}>
          <input
            {...form.register("password")}
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder={isRegister ? "8자 이상" : "비밀번호"}
            className={inputClass(Boolean(passwordError))}
          />
        </Field>

        {isRegister ? (
          <fieldset>
            <legend className="mb-2 text-sm font-bold">성별 (선택)</legend>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "남성", value: "남성" },
                { label: "여성", value: "여성" },
                { label: "건너뛰기", value: "" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() =>
                    form.setValue(
                      "gender",
                      option.value ? (option.value as "남성" | "여성") : undefined,
                    )
                  }
                  className={`h-10 rounded-[8px] border text-sm transition ${
                    selectedGender === option.value ||
                    (!selectedGender && !option.value)
                      ? "border-[var(--plum)] bg-[#f4ebe3] font-bold text-[var(--plum)]"
                      : "border-[var(--line)] text-[var(--ink-soft)] hover:bg-[#faf7f4]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">
              직접 고른 성별은 인증 배지 없이 저장됩니다.
            </p>
          </fieldset>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-[8px] bg-[#fff0ed] px-3 py-2 text-sm text-[#a33c32]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--plum)] text-sm font-bold text-white transition hover:bg-[#5f334d] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {form.formState.isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {isRegister ? "가입하고 시작하기" : "로그인"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
        {isRegister ? "이미 계정이 있나요?" : "처음 오셨나요?"}{" "}
        <Link
          href={`${isRegister ? "/login" : "/register"}?callbackUrl=${encodeURIComponent(redirectTo)}`}
          className="font-bold text-[var(--plum)] hover:underline"
        >
          {isRegister ? "로그인" : "회원가입"}
        </Link>
      </p>

      {isRegister ? (
        <p className="mt-4 text-center text-xs text-[var(--ink-soft)]">
          가입 시{" "}
          <Link href="/company/terms" target="_blank" className="underline">
            이용약관
          </Link>
          에 동의한 것으로 봅니다.
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-[#a33c32]">{error}</span> : null}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `h-11 w-full rounded-[8px] border bg-white px-3 text-sm outline-none transition ${
    hasError
      ? "border-[#d76458] focus:ring-4 focus:ring-[rgba(215,100,88,0.12)]"
      : "border-[var(--line)] focus:border-[var(--plum)] focus:ring-4 focus:ring-[rgba(111,61,91,0.1)]"
  }`;
}

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
