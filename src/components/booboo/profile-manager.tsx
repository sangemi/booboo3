"use client";

import {
  BadgeCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import { VerifiedName } from "@/components/booboo/verified-name";

type Persona = {
  id: string;
  type: PersonaType;
  label: string;
  value: string;
  isPublic: boolean;
  status: "DECLARED" | "PENDING" | "VERIFIED" | "REJECTED";
  source: "SELF" | "GOOGLE" | "KAKAO" | "WORK_EMAIL" | "DOCUMENT" | "ADMIN";
  verifiedAt: string | null;
};

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  nickname: string | null;
  providers: string[];
  personas: Persona[];
  verifiedPersonaCount: number;
};

type PersonaType =
  | "GENDER"
  | "AGE_GROUP"
  | "EMPLOYER"
  | "PROFESSION"
  | "MARRIAGE_YEARS"
  | "PARENTING"
  | "OTHER";

const personaOptions: Array<{ value: PersonaType; label: string }> = [
  { value: "MARRIAGE_YEARS", label: "결혼 연차" },
  { value: "GENDER", label: "성별" },
  { value: "AGE_GROUP", label: "나이대" },
  { value: "PROFESSION", label: "직업" },
  { value: "EMPLOYER", label: "직장" },
  { value: "PARENTING", label: "부모 경험" },
  { value: "OTHER", label: "직접 입력" },
];

const statusLabels: Record<Persona["status"], string> = {
  DECLARED: "직접 등록",
  PENDING: "인증 확인 중",
  VERIFIED: "인증 완료",
  REJECTED: "인증 반려",
};

const sourceLabels: Record<Persona["source"], string> = {
  SELF: "직접 등록",
  GOOGLE: "Google 인증",
  KAKAO: "카카오 인증",
  WORK_EMAIL: "회사 이메일 인증",
  DOCUMENT: "서류 인증",
  ADMIN: "운영자 확인",
};

export function ProfileManager() {
  const { update: updateSession } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [nickname, setNickname] = useState("");
  const [personaType, setPersonaType] = useState<PersonaType>("MARRIAGE_YEARS");
  const [personaValue, setPersonaValue] = useState("");
  const [personaPublic, setPersonaPublic] = useState(true);

  const loadProfile = useCallback(async () => {
    const response = await fetch("/api/profile", { cache: "no-store" });
    if (!response.ok) {
      setError("프로필을 불러오지 못했습니다.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as Profile;
    setProfile(data);
    setNickname(data.nickname ?? data.name ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/profile", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("profile request failed");
        return (await response.json()) as Profile;
      })
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setNickname(data.nickname ?? data.name ?? "");
      })
      .catch(() => {
        if (active) setError("프로필을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function saveNickname(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    clearFeedback();

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "닉네임을 저장하지 못했습니다.");
    } else {
      setMessage("닉네임을 저장했습니다.");
      await Promise.all([loadProfile(), updateSession()]);
    }

    setSaving(false);
  }

  async function addPersona(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    clearFeedback();

    const response = await fetch("/api/profile/personas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: personaType,
        value: personaValue,
        isPublic: personaPublic,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "페르소나를 추가하지 못했습니다.");
    } else {
      setPersonaValue("");
      setMessage("페르소나를 추가했습니다.");
      await loadProfile();
    }

    setSaving(false);
  }

  async function toggleVisibility(persona: Persona) {
    setSaving(true);
    clearFeedback();

    const response = await fetch(`/api/profile/personas/${persona.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !persona.isPublic }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "공개 설정을 바꾸지 못했습니다.");
    } else {
      await loadProfile();
    }

    setSaving(false);
  }

  async function removePersona(persona: Persona) {
    setSaving(true);
    clearFeedback();

    const response = await fetch(`/api/profile/personas/${persona.id}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "페르소나를 삭제하지 못했습니다.");
    } else {
      setMessage("페르소나를 삭제했습니다.");
      await loadProfile();
    }

    setSaving(false);
  }

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <LoaderCircle className="size-6 animate-spin text-[var(--plum)]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center text-sm text-[var(--ink-soft)]">
        {error || "프로필을 불러오지 못했습니다."}
      </div>
    );
  }

  const displayName = profile.nickname ?? profile.name ?? "부부라이프 회원";

  return (
    <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-6 md:px-8 md:py-10">
      <section className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white">
        <div className="grid gap-5 border-b border-[var(--line)] bg-[#fff9f3] p-5 md:grid-cols-[auto_1fr_auto] md:items-center md:p-7">
          <div
            className={`grid size-16 place-items-center rounded-full bg-white text-xl font-bold text-[var(--plum)] ${verificationRing(profile.verifiedPersonaCount)}`}
          >
            {displayName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <VerifiedName
              name={displayName}
              verifiedCount={profile.verifiedPersonaCount}
            />
            <p className="mt-1 truncate text-sm text-[var(--ink-soft)]">
              {profile.email}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              인증된 페르소나 {profile.verifiedPersonaCount}개 · 모든 회원의 커뮤니티 이용 권한은 같습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/" })}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[var(--line)] px-3 text-sm font-bold text-[var(--ink-soft)] hover:bg-white md:justify-self-end"
          >
            <LogOut className="size-4" />
            로그아웃
          </button>
        </div>

        <div className="grid md:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-[var(--line)] p-5 md:border-b-0 md:border-r md:p-6">
            <h1 className="font-serif text-2xl font-bold">마이페이지</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              나를 설명하는 정보 가운데 공개할 것만 골라 관리하세요.
            </p>

            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <p className="text-xs font-bold text-[var(--ink-soft)]">연결된 로그인</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.providers.length > 0 ? (
                  profile.providers.map((provider) => (
                    <span
                      key={provider}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ebe3] px-2.5 py-1 text-xs font-bold text-[var(--plum)]"
                    >
                      <ShieldCheck className="size-3.5" />
                      {providerName(provider)}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
                    <LockKeyhole className="size-3.5" /> 이메일 로그인
                  </span>
                )}
              </div>
            </div>
          </aside>

          <div className="min-w-0 p-5 md:p-7">
            <section>
              <h2 className="text-lg font-bold">프로필 이름</h2>
              <form onSubmit={saveNickname} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-[8px] border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--plum)] focus:ring-4 focus:ring-[rgba(111,61,91,0.1)]"
                  aria-label="닉네임"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-[8px] bg-[var(--plum)] px-4 text-sm font-bold text-white disabled:opacity-55"
                >
                  이름 저장
                </button>
              </form>
            </section>

            <section className="mt-8 border-t border-[var(--line)] pt-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">내 페르소나</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                    직접 등록한 정보와 인증된 정보는 서로 다르게 표시됩니다.
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[var(--ink-soft)]">
                  {profile.personas.length}개
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-[8px] border border-[var(--line)]">
                {profile.personas.length > 0 ? (
                  profile.personas.map((persona) => (
                    <div
                      key={persona.id}
                      className="flex items-center gap-3 border-b border-[var(--line)] px-3 py-3 last:border-b-0 md:px-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[var(--ink-soft)]">
                            {persona.label}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(persona.status)}`}
                          >
                            {persona.status === "VERIFIED" ? (
                              <BadgeCheck className="size-3" />
                            ) : null}
                            {statusLabels[persona.status]}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm font-bold">{persona.value}</p>
                        <p className="mt-1 text-xs text-[var(--ink-soft)]">
                          {sourceLabels[persona.source]}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(persona)}
                        disabled={saving}
                        aria-label={persona.isPublic ? "페르소나 비공개" : "페르소나 공개"}
                        title={persona.isPublic ? "비공개로 바꾸기" : "공개하기"}
                        className="grid size-9 shrink-0 place-items-center rounded-[8px] text-[var(--ink-soft)] hover:bg-[#f4ebe3]"
                      >
                        {persona.isPublic ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                      {persona.status !== "VERIFIED" ? (
                        <button
                          type="button"
                          onClick={() => removePersona(persona)}
                          disabled={saving}
                          aria-label="페르소나 삭제"
                          title="삭제"
                          className="grid size-9 shrink-0 place-items-center rounded-[8px] text-[var(--ink-soft)] hover:bg-[#fff0ed] hover:text-[#a33c32]"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-8 text-center text-sm text-[var(--ink-soft)]">
                    나를 설명하는 첫 페르소나를 추가해 보세요.
                  </p>
                )}
              </div>

              <form onSubmit={addPersona} className="mt-4 grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)_auto]">
                <select
                  value={personaType}
                  onChange={(event) => {
                    setPersonaType(event.target.value as PersonaType);
                    setPersonaValue("");
                  }}
                  className="h-10 rounded-[8px] border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--plum)]"
                  aria-label="페르소나 종류"
                >
                  {personaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {personaValueInput(personaType, personaValue, setPersonaValue)}
                <button
                  type="submit"
                  disabled={saving || !personaValue.trim()}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[var(--coral)] px-4 text-sm font-bold text-white disabled:opacity-55"
                >
                  <Plus className="size-4" />
                  추가
                </button>
                <label className="flex items-center gap-2 text-xs text-[var(--ink-soft)] sm:col-span-3">
                  <input
                    type="checkbox"
                    checked={personaPublic}
                    onChange={(event) => setPersonaPublic(event.target.checked)}
                    className="size-4 accent-[var(--plum)]"
                  />
                  다른 회원에게 공개
                </label>
              </form>
              <p className="mt-3 text-xs leading-5 text-[var(--ink-soft)]">
                회사 이메일과 서류를 이용한 추가 인증은 다음 단계에서 연결합니다.
              </p>
            </section>

            {message ? (
              <p className="mt-5 rounded-[8px] bg-[#edf6ef] px-3 py-2 text-sm text-[#356447]">
                {message}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mt-5 rounded-[8px] bg-[#fff0ed] px-3 py-2 text-sm text-[#a33c32]">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function personaValueInput(
  type: PersonaType,
  value: string,
  setValue: (value: string) => void,
) {
  const className =
    "h-10 min-w-0 rounded-[8px] border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--plum)]";

  if (type === "GENDER") {
    return (
      <select value={value} onChange={(event) => setValue(event.target.value)} className={className} aria-label="성별">
        <option value="">선택</option>
        <option value="남성">남성</option>
        <option value="여성">여성</option>
      </select>
    );
  }

  if (type === "AGE_GROUP") {
    return (
      <select value={value} onChange={(event) => setValue(event.target.value)} className={className} aria-label="나이대">
        <option value="">선택</option>
        {["20대", "30대", "40대", "50대", "60대 이상"].map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }

  if (type === "PARENTING") {
    return (
      <select value={value} onChange={(event) => setValue(event.target.value)} className={className} aria-label="부모 경험">
        <option value="">선택</option>
        {["아이를 기다리는 중", "영유아 부모", "초등학생 부모", "중고등학생 부모", "성인 자녀 부모"].map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      type={type === "MARRIAGE_YEARS" ? "number" : "text"}
      min={type === "MARRIAGE_YEARS" ? 0 : undefined}
      max={type === "MARRIAGE_YEARS" ? 80 : undefined}
      placeholder={personaPlaceholder(type)}
      className={className}
      aria-label="페르소나 내용"
    />
  );
}

function personaPlaceholder(type: PersonaType) {
  if (type === "MARRIAGE_YEARS") return "결혼 연차 숫자";
  if (type === "PROFESSION") return "예: 변호사";
  if (type === "EMPLOYER") return "예: 삼성전자";
  return "예: 주말마다 함께 등산해요";
}

function providerName(provider: string) {
  if (provider === "google") return "Google";
  if (provider === "kakao") return "카카오";
  return provider;
}

function statusClass(status: Persona["status"]) {
  if (status === "VERIFIED") return "bg-[#e7f3ea] text-[#356447]";
  if (status === "PENDING") return "bg-[#fff4cf] text-[#755900]";
  if (status === "REJECTED") return "bg-[#fff0ed] text-[#a33c32]";
  return "bg-[#f4ebe3] text-[var(--ink-soft)]";
}

function verificationRing(count: number) {
  if (count >= 5) {
    return "ring-4 ring-[var(--butter)] shadow-[0_0_0_7px_rgba(111,61,91,0.18),0_0_30px_rgba(247,201,72,0.36)]";
  }
  if (count >= 3) return "ring-4 ring-[rgba(111,61,91,0.28)]";
  if (count >= 1) return "ring-2 ring-[rgba(95,138,112,0.36)]";
  return "border border-[var(--line)]";
}
