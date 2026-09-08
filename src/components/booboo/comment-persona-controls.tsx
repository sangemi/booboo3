"use client";

import { ArrowLeft, ArrowRight, Check, LoaderCircle, Plus, X } from "lucide-react";
import { useState, type DragEvent } from "react";

import {
  commentPersonaLabels,
  commentPersonaTypes,
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

export function AuthorPersonaPicker({
  personas,
  selectedIds,
  loading,
  onChange,
  onPersonaCreated,
}: {
  personas: ProfilePersonaOption[];
  selectedIds: string[];
  loading: boolean;
  onChange: (ids: string[]) => void;
  onPersonaCreated: (persona: ProfilePersonaOption) => void;
}) {
  const availablePersonas = personas.filter((persona) =>
    commentPersonaTypes.includes(persona.type),
  );
  const missingTypes = commentPersonaTypes.filter(
    (type) => !availablePersonas.some((persona) => persona.type === type),
  );
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState<CommentPersonaType>(
    missingTypes[0] ?? "GENDER",
  );
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function togglePersona(persona: ProfilePersonaOption) {
    if (selectedIds.includes(persona.id)) {
      onChange(selectedIds.filter((id) => id !== persona.id));
      return;
    }

    const idsWithoutSameType = selectedIds.filter(
      (id) => personas.find((item) => item.id === id)?.type !== persona.type,
    );
    onChange([...idsWithoutSameType, persona.id]);
  }

  async function addPersona() {
    if (!newValue.trim() || saving) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/profile/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newType,
          value: newValue,
          isPublic: false,
        }),
      });
      const payload = (await response.json()) as ProfilePersonaOption & {
        error?: string;
      };
      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "정보를 저장하지 못했습니다.");
      }

      onPersonaCreated(payload);
      const idsWithoutSameType = selectedIds.filter(
        (id) => personas.find((item) => item.id === id)?.type !== payload.type,
      );
      onChange([...idsWithoutSameType, payload.id]);
      setNewValue("");
      setAdding(false);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "정보를 저장하지 못했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-2 border-t border-[var(--line)] pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <h3 className="mr-1 text-[11px] font-bold text-[var(--foreground)]">
          글에 표시할 내 정보
        </h3>
        {loading ? (
          <span className="text-[11px] text-[var(--ink-soft)]">불러오는 중</span>
        ) : (
          availablePersonas.map((persona) => {
            const selected = selectedIds.includes(persona.id);
            return (
              <button
                key={persona.id}
                type="button"
                aria-pressed={selected}
                onClick={() => togglePersona(persona)}
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded-[6px] border px-2 text-[11px] transition",
                  selected
                    ? "border-[var(--plum)] bg-[#f4e8ee] font-bold text-[var(--plum)]"
                    : "border-[#ddd4cd] bg-white text-[var(--ink-soft)] hover:border-[var(--plum)]",
                )}
              >
                {selected ? <Check className="size-3" aria-hidden="true" /> : null}
                {displayProfilePersona(persona)}
              </button>
            );
          })
        )}
        {!loading && missingTypes.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setNewType(missingTypes[0]);
              setAdding((current) => !current);
              setError("");
            }}
            aria-expanded={adding}
            className="inline-flex h-6 items-center gap-1 rounded-[6px] border border-dashed border-[#d9ccc2] px-2 text-[11px] text-[var(--ink-soft)] hover:border-[var(--plum)] hover:text-[var(--plum)]"
          >
            <Plus className="size-3" aria-hidden="true" />
            내 정보 추가
          </button>
        ) : null}
      </div>

      {adding ? (
        <div className="mt-2 grid gap-1.5 sm:grid-cols-[120px_minmax(0,1fr)_auto]">
          <select
            value={newType}
            onChange={(event) => {
              setNewType(event.target.value as CommentPersonaType);
              setNewValue("");
              setError("");
            }}
            aria-label="추가할 내 정보"
            className="h-9 rounded-[7px] border border-[var(--line)] bg-white px-2 text-xs outline-none focus:border-[var(--plum)]"
          >
            {missingTypes.map((type) => (
              <option key={type} value={type}>
                {commentPersonaLabels[type]}
              </option>
            ))}
          </select>
          <PersonaValueField type={newType} value={newValue} onChange={setNewValue} compact />
          <button
            type="button"
            onClick={addPersona}
            disabled={!newValue.trim() || saving}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-[7px] bg-[var(--plum)] px-3 text-xs font-bold text-white disabled:opacity-40"
          >
            {saving ? (
              <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-3" aria-hidden="true" />
            )}
            추가
          </button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-[11px] text-[var(--coral)]">
          {error}
        </p>
      ) : null}
    </section>
  );
}

type RequestMode = "NONE" | CommentPersonaRequestLevel;

const requestGroups = [
  { level: "REQUESTED" as const, label: "선택" },
  { level: "REQUIRED" as const, label: "필수" },
];

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

  function handleDragStart(
    event: DragEvent<HTMLElement>,
    type: CommentPersonaType,
  ) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", type);
  }

  function handleDrop(event: DragEvent<HTMLElement>, mode: RequestMode) {
    event.preventDefault();
    const type = event.dataTransfer.getData("text/plain");
    if (!commentPersonaTypes.includes(type as CommentPersonaType)) return;
    setMode(type as CommentPersonaType, mode);
  }

  const unusedTypes = commentPersonaTypes.filter(
    (type) => !value.some((request) => request.type === type),
  );

  return (
    <section className="mt-2 border-t border-[var(--line)] pt-2">
      <h3 className="text-[11px] font-bold text-[var(--foreground)]">
        댓글에서 받고 싶은 정보
      </h3>
      <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
        {requestGroups.map((group) => {
          const items = value.filter(
            (request) => request.level === group.level,
          );
          const isRequired = group.level === "REQUIRED";

          return (
            <div
              key={group.level}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, group.level)}
              className="min-h-11 rounded-[7px] border border-[var(--line)] bg-[#faf7f4] px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-[10px] font-bold text-[var(--ink-soft)]">
                  {group.label}
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                  {items.length === 0 ? (
                    <span className="py-1 text-[11px] text-[var(--ink-soft)] opacity-70">
                      없음
                    </span>
                  ) : (
                    items.map((request) => (
                      <span
                        key={request.type}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, request.type)
                        }
                        className="inline-flex h-6 items-center rounded-[6px] border border-[#e4d8cf] bg-white text-[11px] font-bold text-[var(--foreground)] shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setMode(
                              request.type,
                              isRequired ? "REQUESTED" : "REQUIRED",
                            )
                          }
                          title={isRequired ? "선택으로 옮기기" : "필수로 옮기기"}
                          aria-label={`${commentPersonaLabels[request.type]} ${
                            isRequired ? "선택으로 옮기기" : "필수로 옮기기"
                          }`}
                          className="inline-flex h-full items-center gap-1 rounded-l-[5px] px-2 hover:bg-[#fbf6f0] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--plum)]"
                        >
                          {isRequired ? (
                            <ArrowLeft className="size-3" aria-hidden="true" />
                          ) : (
                            <ArrowRight className="size-3" aria-hidden="true" />
                          )}
                          {commentPersonaLabels[request.type]}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode(request.type, "NONE")}
                          title={`${commentPersonaLabels[request.type]} 빼기`}
                          aria-label={`${commentPersonaLabels[request.type]} 빼기`}
                          className="inline-flex size-6 items-center justify-center rounded-r-[5px] text-[var(--ink-soft)] hover:bg-[#fbf6f0] hover:text-[var(--plum)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--plum)]"
                        >
                          <X className="size-3" aria-hidden="true" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {unusedTypes.length > 0 ? (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, "NONE")}
          className="mt-1.5 flex flex-wrap gap-1"
        >
          {unusedTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMode(type, "REQUESTED")}
              title={`${commentPersonaLabels[type]} 선택에 추가`}
              aria-label={`${commentPersonaLabels[type]} 선택에 추가`}
              className="inline-flex h-6 items-center gap-1 rounded-[6px] border border-dashed border-[#d9ccc2] px-2 text-[11px] text-[var(--ink-soft)] hover:border-[var(--plum)] hover:text-[var(--plum)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--plum)]"
            >
              <Plus className="size-3" aria-hidden="true" />
              {commentPersonaLabels[type]}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}


export function PersonaValueField({
  type,
  value,
  onChange,
  compact = false,
}: {
  type: CommentPersonaType;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const className =
    `${compact ? "h-9 rounded-[7px] px-2 text-xs" : "h-10 rounded-[8px] px-3 text-sm"} w-full border border-[var(--line)] bg-white outline-none focus:border-[var(--plum)]`;

  if (type === "GENDER") {
    return (
      <select aria-label={commentPersonaLabels[type]} value={value} onChange={(event) => onChange(event.target.value)} className={className}>
        <option value="">선택</option>
        <option value="남성">남성</option>
        <option value="여성">여성</option>
      </select>
    );
  }

  if (type === "AGE_GROUP") {
    return (
      <select aria-label={commentPersonaLabels[type]} value={value} onChange={(event) => onChange(event.target.value)} className={className}>
        <option value="">선택</option>
        {["20대", "30대", "40대", "50대", "60대 이상"].map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }

  if (type === "PARENTING") {
    return (
      <select aria-label={commentPersonaLabels[type]} value={value} onChange={(event) => onChange(event.target.value)} className={className}>
        <option value="">선택</option>
        {["자녀 없음", "자녀 있음", "자녀를 기다리는 중"].map((option) => (
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
          aria-label={commentPersonaLabels[type]}
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
      aria-label={commentPersonaLabels[type]}
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
