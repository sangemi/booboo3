"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";

import {
  commentPersonaLabels,
  commentPersonaTypes,
  type CommentPersonaDisclosure,
  type CommentPersonaRequest,
  type CommentPersonaRequestLevel,
  type CommentPersonaType,
} from "@/lib/comment-persona";
import {
  formatMarriageYear,
  marriageYearRange,
  parseMarriageYear,
} from "@/lib/marriage-persona";
import { cn } from "@/lib/utils";

export type ProfilePersonaOption = {
  id: string;
  type: CommentPersonaType;
  value: string;
  normalizedValue: string;
  isPublic: boolean;
  status: "DECLARED" | "PENDING" | "VERIFIED" | "REJECTED";
};

type RequestMode = "NONE" | CommentPersonaRequestLevel;

export function CommentPersonaRequestEditor({
  value,
  onChange,
}: {
  value: CommentPersonaRequest[];
  onChange: (value: CommentPersonaRequest[]) => void;
}) {
  function setMode(type: CommentPersonaType, mode: RequestMode) {
    const next = value.filter((request) => request.type !== type);
    if (mode !== "NONE") next.push({ type, level: mode });
    onChange(
      next.sort(
        (left, right) =>
          commentPersonaTypes.indexOf(left.type) -
          commentPersonaTypes.indexOf(right.type),
      ),
    );
  }

  return (
    <section className="mt-4 border-t border-[var(--line)] pt-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-[var(--foreground)]">
            댓글에서 받고 싶은 정보
          </h3>
          <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
            요청은 건너뛸 수 있고, 필수는 댓글을 등록할 때 바로 선택합니다.
          </p>
        </div>
        <span className="text-[11px] text-[var(--ink-soft)]">
          여러 항목 선택 가능
        </span>
      </div>
      <div className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {commentPersonaTypes.map((type) => {
          const mode =
            value.find((request) => request.type === type)?.level ?? "NONE";
          return (
            <div
              key={type}
              className="flex min-h-11 flex-wrap items-center justify-between gap-2 py-2"
            >
              <span className="text-xs font-bold text-[var(--ink-soft)]">
                {commentPersonaLabels[type]}
              </span>
              <div className="grid grid-cols-3 rounded-[7px] border border-[var(--line)] bg-[#faf7f4] p-0.5">
                {(
                  [
                    ["NONE", "안 받음"],
                    ["REQUESTED", "요청"],
                    ["REQUIRED", "필수"],
                  ] as const
                ).map(([option, label]) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={mode === option}
                    onClick={() => setMode(type, option)}
                    className={cn(
                      "h-7 rounded-[5px] px-2 text-[11px]",
                      mode === option
                        ? "bg-white font-bold text-[var(--plum)] shadow-sm"
                        : "text-[var(--ink-soft)]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CommentPersonaDialog({
  open,
  requests,
  personas,
  signedIn,
  onClose,
  onConfirm,
}: {
  open: boolean;
  requests: CommentPersonaRequest[];
  personas: ProfilePersonaOption[];
  signedIn: boolean;
  onClose: () => void;
  onConfirm: (disclosures: CommentPersonaDisclosure[]) => Promise<boolean>;
}) {
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    initialChoices(requests, personas),
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [createdPersonaIds, setCreatedPersonaIds] = useState<
    Record<string, string>
  >({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const optionsByType = useMemo(
    () =>
      Object.fromEntries(
        commentPersonaTypes.map((type) => [
          type,
          personas.filter((persona) => persona.type === type),
        ]),
      ) as Record<CommentPersonaType, ProfilePersonaOption[]>,
    [personas],
  );

  if (!open) return null;

  async function confirm() {
    if (saving) return;
    setSaving(true);
    setError("");

    try {
      const disclosures: CommentPersonaDisclosure[] = [];
      for (const request of requests) {
        const choice = choices[request.type] ?? "";
        if (!choice) {
          if (request.level === "REQUIRED") {
            throw new Error(`${commentPersonaLabels[request.type]}을 선택해 주세요.`);
          }
          disclosures.push({ type: request.type, skip: true });
          continue;
        }

        if (choice !== "__new__") {
          disclosures.push({ type: request.type, personaId: choice });
          continue;
        }

        const value = values[request.type]?.trim();
        if (!value) {
          if (request.level === "REQUIRED") {
            throw new Error(`${commentPersonaLabels[request.type]}을 입력해 주세요.`);
          }
          disclosures.push({ type: request.type, skip: true });
          continue;
        }

        if (!signedIn) {
          disclosures.push({ type: request.type, value });
          continue;
        }

        const createdPersonaId = createdPersonaIds[request.type];
        if (createdPersonaId) {
          disclosures.push({
            type: request.type,
            personaId: createdPersonaId,
          });
          continue;
        }

        const response = await fetch("/api/profile/personas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: request.type, value, isPublic: true }),
        });
        const payload = (await response.json()) as {
          id?: string;
          error?: string;
        };
        if (!response.ok || !payload.id) {
          throw new Error(payload.error ?? "페르소나를 저장하지 못했습니다.");
        }
        const personaId = payload.id;
        setCreatedPersonaIds((current) => ({
          ...current,
          [request.type]: personaId,
        }));
        disclosures.push({ type: request.type, personaId });
      }

      const confirmed = await onConfirm(disclosures);
      if (!confirmed) throw new Error("댓글을 저장하지 못했습니다. 다시 시도해 주세요.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "선택한 페르소나를 확인해 주세요.",
      );
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[rgba(44,41,38,0.5)] p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.currentTarget === event.target && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="comment-persona-title"
        className="flex max-h-[min(86vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-[0_28px_80px_rgba(44,41,38,0.24)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
          <div>
            <h2 id="comment-persona-title" className="text-base font-bold">
              댓글에 표시할 페르소나
            </h2>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
              필수 항목은 선택해야 하며, 요청 항목은 건너뛸 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            aria-label="페르소나 선택 닫기"
            onClick={onClose}
            disabled={saving}
            className="grid size-9 shrink-0 place-items-center rounded-[6px] text-[var(--ink-soft)] hover:bg-[#f4ebe3] disabled:opacity-40"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {requests.map((request) => {
            const options = optionsByType[request.type];
            const choice = choices[request.type] ?? "";
            return (
              <div
                key={request.type}
                className="border-b border-[var(--line)] py-4 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`comment-persona-${request.type}`}
                    className="text-sm font-bold"
                  >
                    {commentPersonaLabels[request.type]}
                  </label>
                  <span
                    className={cn(
                      "rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold",
                      request.level === "REQUIRED"
                        ? "bg-[#f4e8ee] text-[var(--plum)]"
                        : "bg-[#f3f0ed] text-[var(--ink-soft)]",
                    )}
                  >
                    {request.level === "REQUIRED" ? "필수" : "요청"}
                  </span>
                </div>
                <select
                  id={`comment-persona-${request.type}`}
                  value={choice}
                  onChange={(event) =>
                    setChoices((current) => ({
                      ...current,
                      [request.type]: event.target.value,
                    }))
                  }
                  className="mt-2 h-10 w-full rounded-[8px] border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--plum)]"
                >
                  {request.level === "REQUESTED" ? (
                    <option value="">선택 안 함</option>
                  ) : null}
                  {options.map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {displayProfilePersona(persona)}
                      {persona.status === "VERIFIED" ? " · 인증" : ""}
                      {persona.isPublic ? " · 공개 중" : ""}
                    </option>
                  ))}
                  <option value="__new__">새로 입력</option>
                </select>
                {choice === "__new__" ? (
                  <div className="mt-2">
                    <PersonaValueField
                      type={request.type}
                      value={values[request.type] ?? ""}
                      onChange={(value) =>
                        setValues((current) => ({
                          ...current,
                          [request.type]: value,
                        }))
                      }
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <footer className="shrink-0 border-t border-[var(--line)] bg-[#fcfaf8] px-5 py-4">
          <p className="text-xs leading-5 text-[var(--ink-soft)]">
            {signedIn
              ? "새로 입력한 정보는 내 페르소나에도 공개 상태로 저장됩니다."
              : "선택한 정보는 이 댓글에만 표시됩니다."}
          </p>
          {error ? (
            <p role="alert" className="mt-2 text-xs text-[var(--coral)]">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={confirm}
            disabled={saving}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--plum)] px-4 text-sm font-bold text-white disabled:opacity-45"
          >
            {saving ? "등록 중" : "선택하고 댓글 등록"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function PersonaValueField({
  type,
  value,
  onChange,
}: {
  type: CommentPersonaType;
  value: string;
  onChange: (value: string) => void;
}) {
  const className =
    "h-10 w-full rounded-[8px] border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--plum)]";

  if (type === "GENDER") {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)} className={className}>
        <option value="">선택</option>
        <option value="남성">남성</option>
        <option value="여성">여성</option>
      </select>
    );
  }

  if (type === "AGE_GROUP") {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)} className={className}>
        <option value="">선택</option>
        {["20대", "30대", "40대", "50대", "60대 이상"].map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }

  if (type === "PARENTING") {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)} className={className}>
        <option value="">선택</option>
        {["아이를 기다리는 중", "영유아 부모", "초등학생 부모", "중고등학생 부모", "성인 자녀 부모"].map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }

  if (type === "MARRIAGE_YEARS") {
    const range = marriageYearRange();
    const marriageYear = parseMarriageYear(value);
    return (
      <div>
        <input
          type="number"
          inputMode="numeric"
          min={range.min}
          max={range.max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="결혼연도, 예: 2019"
          className={className}
        />
        {marriageYear !== null ? (
          <p className="mt-1.5 text-xs text-[var(--ink-soft)]">
            댓글에는 {formatMarriageYear(marriageYear)}로 표시됩니다.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="예: 변호사"
      className={className}
    />
  );
}

function displayProfilePersona(persona: ProfilePersonaOption) {
  if (persona.type !== "MARRIAGE_YEARS") return persona.value;
  const year = parseMarriageYear(persona.normalizedValue);
  return year === null ? persona.value : formatMarriageYear(year);
}

function initialChoices(
  requests: CommentPersonaRequest[],
  personas: ProfilePersonaOption[],
) {
  return Object.fromEntries(
    requests.map((request) => {
      const options = personas.filter((persona) => persona.type === request.type);
      const publicOption = options.find((persona) => persona.isPublic);
      return [
        request.type,
        publicOption?.id ??
          (request.level === "REQUIRED" ? "__new__" : ""),
      ];
    }),
  );
}
