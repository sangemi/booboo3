import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Scale, ShieldCheck, Sprout } from "lucide-react";

import { SiteFooter } from "@/components/booboo/site-footer";
import { SiteHeader } from "@/components/booboo/site-header";

export const metadata: Metadata = {
  title: "소개 | 부부라이프",
  description:
    "보통 부부의 일상과 갈등을 비난보다 회복 쪽으로 기록하는 부부 커뮤니티",
};

const principles = [
  {
    icon: Sprout,
    title: "잘 사는 부부에게서 배우기",
    body:
      "행복한 부부의 이야기를 질투하거나 냉소하지 않습니다. 작은 말투, 집안일의 방식, 사과하는 습관처럼 따라 해볼 수 있는 생활의 기술로 읽습니다.",
  },
  {
    icon: Brain,
    title: "마음 공부의 필요성 나누기",
    body:
      "어른이 된 이후, 특히 부부가 된 이후 마음가짐에 대해 따로 공부한 사람은 많지 않습니다. 부부라이프는 내 감정과 배우자의 마음을 이해하는 연습을 함께 나눕니다.",
  },
  {
    icon: Scale,
    title: "부부싸움에서도 배우기",
    body:
      "누가 더 잘했고 못했는지 따져보는 것도 때로는 필요합니다. 다만 그 목적은 서로에게 망신을 주려는 것이 아니라, 더 나은 관계를 배우기 위함입니다.",
  },
  {
    icon: ShieldCheck,
    title: "익명과 인증을 함께",
    body:
      "기본적으로는 익명으로 자유롭게 소통합니다. 필요할 때만 성별이나 연령대 등 최소한의 인증 정보를 선택 공개하여, 서로 다른 관점을 깊이 있게 이해하도록 돕습니다.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteHeader active="about" />

      <section className="mx-auto w-full max-w-[1040px] px-4 py-10 md:px-8 md:py-16">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--leaf)]">
          About Booboo Life
        </p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight md:text-6xl">
          보통 부부의 하루가 사라지지 않도록
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--ink-soft)] md:text-lg">
          부부라이프는 &apos;부부&apos;라는 이름으로 살아가는 모두에게 위로와
          희망을 전하는 공간입니다. 잘 살아가는 부부에겐 일상의 지혜를 배우고,
          다투는 부부에겐 건강하게 화해하는 대화법을 함께 찾아갑니다.
        </p>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto grid w-full max-w-[1040px] gap-8 px-4 py-10 md:px-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm font-extrabold text-[var(--plum)]">
              왜 부부라이프인가
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight">
              자극적인 이야기에 묻혀버린 보통 부부의 일상을 되찾습니다.
            </h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-[var(--ink-soft)] md:text-base md:leading-8">
            <p>
              인터넷에서는 자극적인 이야기가 쉽게 퍼집니다. 누가 더 잘못했는지,
              누가 이상한 사람인지, 어디까지 참아야 하는지 묻는 글에는 금방
              사람들이 모입니다. 원글을 비난하고, 댓글로 판단하고, 더 강한 말을
              얹는 일은 어렵지 않습니다.
            </p>
            <p>
              그런 분위기가 이어지면 차분하게 이야기를 나누려는 사람은 머물기
              어려워집니다. 평범하게 살고 있는 부부, 크게 무너지지는 않았지만
              더 잘 지내고 싶은 부부, 가끔 싸우지만 다시 해보고 싶은 부부의
              이야기는 상대적으로 덜 보입니다.
            </p>
            <p>
              부부라이프는 그 보통의 삶을 위한 자리입니다. 아주 행복한 부부의
              이야기도, 오늘 크게 다툰 부부의 이야기도 같은 공간에 놓되, 방향은
              비난이 아니라 회복 쪽으로 둡니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1040px] px-4 py-10 md:px-8 md:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold text-[var(--plum)]">
            보통 부부를 위한 공간
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight">
            잘 살고 있는 부부에게도 이야기를 나눌 곳이 필요합니다.
          </h2>
        </div>
        <div className="mt-7 grid gap-5 text-sm leading-7 text-[var(--ink-soft)] md:grid-cols-2 md:text-base md:leading-8">
          <p>
            이혼을 고민하는 부부에게 상담과 법률 절차에 관한 정보가 필요한 것은
            분명합니다. 그래서 인터넷에는 이별 직전의 이야기와 다툼의 이야기가
            많이 다뤄집니다. 하지만 그것만으로 부부의 삶을 설명할 수는 없습니다.
          </p>
          <p>
            흔히 3분의 1이 이혼한다고 말합니다. 그렇다면 나머지 3분의 2의 삶도
            분명히 있습니다. 아주 행복하거나, 그저 평범하거나, 싸우면서도 다시
            살아가는 수많은 부부의 시간이 있습니다. 부부라이프는 그 시간들을
            담고 싶습니다.
          </p>
          <p>
            잘 살아가는 부부의 일상은 상품이나 서비스로 이어지기 어렵다는 이유로
            인터넷에서 자주 놓칩니다. 그러나 누군가의 다정한 말투, 집안일을
            나누는 방식, 먼저 사과한 경험은 다른 부부에게 충분히 큰 도움이
            됩니다.
          </p>
          <p>
            우리는 행복한 부부를 질투하지 않고 배울 수 있기를 바랍니다. 다투는
            부부에게는 편을 갈라 끝내기보다, 왜 다퉜는지 정리하고 다음 대화를
            어떻게 시작할지 찾을 수 있기를 바랍니다.
          </p>
        </div>
      </section>

      <section className="bg-[#f7eee7]">
        <div className="mx-auto w-full max-w-[1040px] px-4 py-10 md:px-8 md:py-14">
          <p className="text-sm font-extrabold text-[var(--plum)]">
            우리가 지키려는 기준
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="rounded-[8px] border border-[var(--line)] bg-white p-5"
              >
                <principle.icon className="size-5 text-[var(--coral)]" />
                <h3 className="mt-4 text-lg font-extrabold">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1040px] px-4 py-10 md:px-8 md:py-14">
        <div className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-6 md:p-8">
          <p className="text-sm font-extrabold text-[var(--plum)]">
            커뮤니티의 약속
          </p>
          <p className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight">
            어느 한쪽으로 치우치지 않고, 오직 &apos;건강한 부부의 삶&apos;만
            바라봅니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[var(--plum)] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[rgba(111,61,91,0.18)]"
            >
              커뮤니티 보기
            </Link>
            <Link
              href="/ai-operations"
              className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--line)] bg-white px-4 text-sm font-bold text-[var(--foreground)] transition hover:bg-[#fbf6f0] focus:outline-none focus:ring-4 focus:ring-[rgba(111,61,91,0.12)]"
            >
              AI운영실
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
