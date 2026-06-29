"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Lightbulb,
  MessageSquarePlus,
  Send,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  aiOperationLogs,
  aiPrinciples,
  type AiOperationLog,
} from "@/lib/ai-operations-data";

export function AiOperationsRoom() {
  const [logs, setLogs] = useState<AiOperationLog[]>(aiOperationLogs);
  const [source, setSource] = useState<"seed" | "database" | "local">("seed");
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposal, setProposal] = useState({
    title: "",
    body: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLogs() {
      try {
        const response = await fetch("/api/ai-operations", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          logs?: AiOperationLog[];
          source?: "seed" | "database";
        };
        if (!active || !payload.logs?.length) return;
        setLogs(payload.logs);
        setSource(payload.source ?? "database");
      } catch {
        setSource("local");
      }
    }

    loadLogs();

    return () => {
      active = false;
    };
  }, []);

  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!proposal.title.trim() || !proposal.body.trim()) return;

    const fallbackLog: AiOperationLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      title: proposal.title.trim(),
      source: "유저 제안",
      summary: proposal.body.trim(),
      decision:
        "접수. AI가 운영 영향, 악용 가능성, 커뮤니티 온도에 미칠 변화를 검토해야 합니다.",
      publicNotes: [
        "제안은 공개 검토 큐에 추가되었습니다.",
        "운영자와 AI가 함께 검토한 뒤 채택, 보류, 기각 중 하나로 남깁니다.",
        "개인정보나 특정 회원을 겨냥한 내용은 공개 기록에서 정리됩니다.",
      ],
    };

    setSaving(true);
    try {
      const response = await fetch("/api/ai-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: proposal.title,
          body: proposal.body,
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          log?: AiOperationLog;
        };
        if (payload.log) {
          setLogs((current) => [payload.log!, ...current]);
          setSource("database");
        }
      } else {
        setLogs((current) => [fallbackLog, ...current]);
        setSource("local");
      }
    } catch {
      setLogs((current) => [fallbackLog, ...current]);
      setSource("local");
    } finally {
      setSaving(false);
    }

    setProposal({ title: "", body: "" });
    setProposalOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[var(--foreground)]">
      <header className="border-b border-[var(--line)] bg-[#2d2930] text-white">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-5 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/72 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            부부라이프로 돌아가기
          </Link>
          <div className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-[6px] bg-white/10 px-3 py-1 text-xs font-bold text-[#f7c948]">
                <Bot className="size-3.5" />
                AI 운영 공개 기록
              </p>
              <h1 className="max-w-3xl font-serif text-5xl font-bold leading-tight md:text-6xl">
                운영 판단을 숨기지 않는 커뮤니티
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">
                이 방은 AI가 부부라이프를 어떻게 운영하려고 판단했는지
                공개하는 곳입니다. 기술적인 내부 기록 대신, 회원이 이해할 수
                있는 운영 이유와 검토 과정을 남깁니다.
              </p>
            </div>

            <div className="rounded-[8px] border border-white/12 bg-white/8 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c948]">
                Open queue
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Metric label="공개 판단" value={logs.length} />
                <Metric label="유저 제안" value={logs.filter((log) => log.source === "유저 제안").length} />
                <Metric label="채택 실험" value={2} />
              </div>
              <p className="mt-4 text-xs font-bold text-white/56">
                데이터 상태:{" "}
                {source === "database"
                  ? "PostgreSQL 연결"
                  : source === "local"
                    ? "로컬 임시 반영"
                    : "시드 데이터"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1280px] gap-5 px-4 py-6 md:px-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
          <section className="rounded-[8px] border border-[var(--line)] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold">운영 제안하기</h2>
              <MessageSquarePlus className="size-4 text-[var(--coral)]" />
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              커뮤니티 분위기, 댓글 노출, 신고 기준, 미션 아이디어를 AI에게
              제안할 수 있습니다.
            </p>
            <button
              onClick={() => setProposalOpen((value) => !value)}
              className="mt-4 h-11 w-full rounded-[8px] bg-[var(--coral)] text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,111,97,0.18)]"
            >
              운영 제안하기
            </button>
          </section>

          {proposalOpen ? (
            <form
              onSubmit={submitProposal}
              className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-[0_16px_40px_rgba(75,54,38,0.08)]"
            >
              <label className="block text-xs font-bold text-[var(--ink-soft)]">
                제안 제목
              </label>
              <input
                value={proposal.title}
                onChange={(event) =>
                  setProposal((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="mt-2 h-10 w-full rounded-[8px] border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--plum)]"
                placeholder="예: 갈등 글에는 조언 버튼을 늦게 보여주세요"
              />
              <label className="mt-4 block text-xs font-bold text-[var(--ink-soft)]">
                제안 내용
              </label>
              <textarea
                value={proposal.body}
                onChange={(event) =>
                  setProposal((current) => ({
                    ...current,
                    body: event.target.value,
                  }))
                }
                className="mt-2 min-h-32 w-full resize-y rounded-[8px] border border-[var(--line)] p-3 text-sm leading-6 outline-none focus:border-[var(--plum)]"
                placeholder="왜 필요한지, 어떤 위험이 있을지 함께 적어주세요."
              />
              <button className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--plum)] text-sm font-bold text-white">
                <Send className="size-4" />
                {saving ? "저장 중" : "제안 공개 큐에 올리기"}
              </button>
            </form>
          ) : null}

          <section className="rounded-[8px] border border-[var(--line)] bg-[#fff7dd] p-4">
            <h2 className="text-sm font-extrabold">공개 원칙</h2>
            <div className="mt-4 space-y-3">
              {aiPrinciples.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div key={principle.title} className="rounded-[8px] bg-white/74 p-3">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-[#7a5b00]" />
                      <strong className="text-sm">{principle.title}</strong>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                      {principle.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="space-y-4">
          {logs.map((log) => (
            <article
              key={log.id}
              className="rounded-[8px] border border-[var(--line)] bg-white p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-[6px] bg-[#f4ebe3] px-2 py-1 text-xs font-bold text-[var(--plum)]">
                  {log.source}
                </span>
                <span className="text-xs font-bold text-[var(--ink-soft)]">
                  {log.date}
                </span>
              </div>
              <h2 className="mt-4 font-serif text-3xl font-bold leading-tight">
                {log.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                {log.summary}
              </p>
              <div className="mt-5 rounded-[8px] bg-[#f7eee7] p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[var(--leaf)]" />
                  <strong className="text-sm">현재 판단</strong>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
                  {log.decision}
                </p>
              </div>
              <div className="mt-5 grid gap-2">
                {log.publicNotes.map((note) => (
                  <p
                    key={note}
                    className="flex gap-2 rounded-[8px] border border-[var(--line)] px-3 py-2 text-sm leading-6 text-[var(--ink-soft)]"
                  >
                    <Lightbulb className="mt-1 size-4 shrink-0 text-[var(--coral)]" />
                    {note}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] bg-white/10 p-3">
      <p className="text-xs font-bold text-white/56">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold">{value}</p>
    </div>
  );
}
