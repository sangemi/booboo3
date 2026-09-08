"use client";

import { Check, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { PersonaValueField, type ProfilePersonaOption } from "./comment-persona-controls";
import {
  commentPersonaLabels,
  type CommentPersonaDisclosure,
  type CommentPersonaRequest,
} from "@/lib/comment-persona";
import { cn } from "@/lib/utils";

export function CommentPersonaLayer({
  requests,
  signedIn,
  onSave,
  onDismiss,
}: {
  requests: CommentPersonaRequest[];
  signedIn: boolean;
  onSave: (disclosures: CommentPersonaDisclosure[]) => Promise<void>;
  onDismiss: () => void;
}) {
  const labelId = useId();
  const [personas, setPersonas] = useState<ProfilePersonaOption[]>([]);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const required = requests.some((request) => request.level === "REQUIRED");

  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    void fetch("/api/profile", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (active) setPersonas(payload?.personas ?? []);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [signedIn]);

  function choiceFor(type: CommentPersonaRequest["type"]) {
    const options = personas.filter((persona) => persona.type === type);
    return choices[type] ?? options.find((persona) => persona.isPublic)?.id ?? options[0]?.id ?? "__new__";
  }

  async function save() {
    if (saving) return;
    const disclosures = requests.flatMap((request): CommentPersonaDisclosure[] => {
      const choice = choiceFor(request.type);
      if (choice !== "__new__") return [{ type: request.type, personaId: choice }];
      const value = values[request.type]?.trim();
      return value ? [{ type: request.type, value }] : [];
    });
    if (disclosures.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await onSave(disclosures);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "정보를 저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  if (requests.length === 0) return null;
  return (
    <aside
      role={required ? "region" : "dialog"}
      aria-modal={required ? undefined : false}
      aria-labelledby={labelId}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !required && !saving) onDismiss();
      }}
      className={cn(
        "relative mt-2 w-full max-w-sm rounded-[8px] border bg-white p-3 text-[var(--foreground)]",
        required ? "border-[#dedede]" : "border-[var(--line)] shadow-[0_4px_18px_rgba(44,41,38,0.10)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p id={labelId} className="text-xs leading-5">
          {required
            ? `${requests.map((request) => commentPersonaLabels[request.type]).join("·")} 정보를 입력하면 댓글이 공개됩니다.`
            : `작성자가 ${requests.map((request) => commentPersonaLabels[request.type]).join("·")} 정보를 요청했습니다. 오픈할까요?`}
        </p>
        {!required ? (
          <button type="button" aria-label="정보 공개 안내 닫기" title="닫기" onClick={onDismiss} disabled={saving} className="grid size-6 shrink-0 place-items-center text-[var(--ink-soft)] hover:text-[var(--foreground)]">
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      <fieldset disabled={saving} className="mt-2 space-y-2 disabled:opacity-60">
        {requests.map((request) => {
          const options = personas.filter((persona) => persona.type === request.type);
          const choice = choiceFor(request.type);
          return (
            <div key={request.type} className="flex flex-wrap items-center gap-2">
              <span className="w-14 shrink-0 text-[11px] text-[var(--ink-soft)]">{commentPersonaLabels[request.type]}</span>
              <div className="min-w-0 flex-1 basis-36 space-y-1.5">
                {options.length > 0 ? (
                  <select
                    aria-label={`${commentPersonaLabels[request.type]} 선택`}
                    value={choice}
                    onChange={(event) => setChoices((current) => ({ ...current, [request.type]: event.target.value }))}
                    className="h-9 w-full rounded-[6px] border border-[var(--line)] bg-white px-2 text-xs"
                  >
                    {options.map((persona) => <option key={persona.id} value={persona.id}>{persona.value}</option>)}
                    <option value="__new__">새로 입력</option>
                  </select>
                ) : null}
                {choice === "__new__" ? (
                  <PersonaValueField
                    compact
                    type={request.type}
                    value={values[request.type] ?? ""}
                    onChange={(value) => {
                      setChoices((current) => ({ ...current, [request.type]: "__new__" }));
                      setValues((current) => ({ ...current, [request.type]: value }));
                    }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-[var(--ink-soft)]">이 댓글에만 표시됩니다.</span>
          <button
            type="button"
            onClick={save}
            disabled={!requests.some((request) => choiceFor(request.type) !== "__new__" || values[request.type]?.trim())}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-[6px] bg-[var(--plum)] px-3 text-xs font-bold text-white disabled:opacity-40"
          >
            <Check className="size-3.5" />
            {saving ? "저장 중" : required ? "입력하고 공개" : "공개하기"}
          </button>
        </div>
      </fieldset>
      {error ? <p role="alert" className="mt-2 text-xs text-[var(--coral)]">{error}</p> : null}
    </aside>
  );
}
