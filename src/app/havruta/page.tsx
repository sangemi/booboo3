import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Mail } from "lucide-react";

import { SiteFooter } from "@/components/booboo/site-footer";
import { SiteHeader } from "@/components/booboo/site-header";
import { operator } from "@/lib/legal";

const path = "/havruta";
const description = "하브루타 전문 강사 자격을 보유한 15년 차 이혼 전문 변호사, SK 변호사와 함께하는 부부 대화 실습 12회 과정.";

export const metadata: Metadata = {
  title: "부부하브루타 | 부부 대화 실습 12회 과정",
  description,
  alternates: { canonical: path },
  openGraph: {
    title: "부부하브루타",
    description,
    url: path,
    images: ["/brand/havruta-conversation.jpg"],
  },
};

const tabs = [
  { key: "all", label: "전체" },
  { key: "intro", label: "부부하브루타란?" },
  { key: "effects", label: "효과" },
  { key: "curriculum", label: "커리큘럼" },
  { key: "instructor", label: "강사 소개" },
] as const;

const conversationPrinciples = [
  ["질문", "짐작으로 빈칸을 채우기 전에 상대가 겪은 일을 물어봅니다."],
  ["경청", "끼어들거나 조언하기 전에 끝까지 듣고, 이해한 뜻을 짧게 확인합니다."],
  ["의견 나누기", "생각이 다른 지점을 말하고, 각자 어떤 이유로 그렇게 보는지 들어봅니다."],
  ["새롭게 이해하기", "둘이 이야기하고 나서야 보인 점을 하나씩 짚어봅니다."],
];

const conversationExamples = [
  { situation: "연락 없이 늦은 날", before: "한 통 보내는 게 그렇게 어려워?", after: "기다리면서 걱정됐어. 오늘 어떤 일이 있었어?" },
  { situation: "주말 계획이 엇갈릴 때", before: "또 네 마음대로 정했네.", after: "이번 주말에 꼭 하고 싶었던 게 뭐였어?" },
  { situation: "저녁 식탁에서", before: "오늘도 똑같았지?", after: "오늘 있었던 일 중에 나한테도 들려주고 싶은 장면이 있어?" },
];

const practiceDialogue = [
  ["묻는 사람", "오늘 퇴근길에도 자꾸 떠오른 일이 있었어?"],
  ["답하는 사람", "회의에서 내가 준비한 안이 바로 넘어갔어. 그때는 그냥 괜찮다고 했는데 계속 생각나."],
  ["묻는 사람", "그 장면에서 어떤 게 제일 마음에 남았어?"],
  ["답하는 사람", "안이 안 된 것보다, 왜 그렇게 준비했는지 아무도 안 물어본 게 서운했어."],
];

const practiceQuestions = [
  ["평소 대화가 거의 없어도 할 수 있나요?", "무거운 주제를 꺼내기 전에 오늘 있었던 작은 일 하나를 물어보세요. 한두 문장만 나누고 마쳐도 됩니다."],
  ["배우자가 말이 적으면 어떻게 하나요?", "둘 다 편한 때를 고르고, 넓게 묻기보다 한 장면을 짚어보세요. 바로 답하기 어렵다면 생각할 시간을 줍니다."],
  ["수업을 들어야 시작할 수 있나요?", "오늘 저녁에도 해볼 수 있습니다. 서로 편할 때 질문 하나를 고르고, 5분씩 묻는 사람과 듣는 사람을 바꿔보세요."],
];

const curriculum = [
  {
    phase: "기초 · 서로의 말을 듣는 연습",
    lessons: [
      ["부부하브루타 첫 대화", "같은 이야기에도 서로 다른 해석이 생기는 이유를 알아보고, 하루 중 기억에 남는 장면을 하나씩 나눕니다."],
      ["한 문장을 함께 읽는 하브루타", "짝을 이루어 읽고 토론하는 전통에서 출발해, 짧은 글 한 문장을 읽고 각자가 주목한 대목을 비교합니다."],
      ["들은 내용을 내 말로 확인하기", "조언을 잠시 미루고 상대가 한 말을 한 문장으로 되짚습니다. 내가 이해한 뜻이 맞는지 확인합니다."],
      ["추궁을 질문으로 바꾸기", "늦은 귀가나 답장처럼 반복되는 상황을 골라, 상대의 사정을 들을 수 있는 열린 질문으로 바꿔봅니다."],
    ],
  },
  {
    phase: "적용 · 눈치 보던 주제로 대화하기",
    lessons: [
      ["다툼이 커지기 전에 멈추기", "지난 다툼에서 말이 엇갈린 순간을 살피고, 잠시 쉬었다가 언제 대화를 다시 시작할지 정합니다."],
      ["집안일과 돌봄 이야기", "각자 눈에 보이는 일과 놓치고 있던 일을 적어봅니다. 일주일 동안 바꿔볼 분담 한 가지를 고릅니다."],
      ["생활비와 소비 기준", "같은 지출을 두고 ‘아깝다’거나 ‘필요하다’고 느끼는 이유를 나눕니다. 함께 결정할 지출 기준을 정해봅니다."],
      ["양가 가족과의 거리", "명절 방문이나 가족 연락의 가상 사례를 놓고, 각자 지키고 싶은 약속과 조정할 수 있는 범위를 확인합니다."],
    ],
  },
  {
    phase: "정착 · 우리 집 대화 습관 만들기",
    lessons: [
      ["가족과 뉴스 하브루타", "생활과 가까운 기사 한 편을 골라 사실과 의견을 나눠봅니다. 아이가 있다면 아이의 질문도 받아봅니다."],
      ["함께 보내는 시간과 혼자 쉴 시간", "주말에 서로 기대한 것이 달랐던 장면을 떠올립니다. 같이할 일과 각자 쉴 시간을 달력에 적어봅니다."],
      ["사과하고 다시 대화하기", "상대가 겪은 일을 구체적으로 짚고 사과합니다. 비슷한 상황에서 내가 바꿀 행동 하나를 말해봅니다."],
      ["우리 부부의 대화 약속", "첫 회차의 질문을 다시 나눕니다. 앞으로 한 달 동안 해볼 10분 대화의 시간, 장소, 쉬어가는 신호를 정합니다."],
    ],
  },
];

const sectionClass = "scroll-mt-6 border-b border-[var(--line)] py-9 md:py-12";
const headingClass = "font-serif text-3xl font-bold leading-tight";
const bodyClass = "mt-4 max-w-3xl text-base leading-8 text-[var(--ink-soft)]";

export default async function HavrutaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const { view } = await searchParams;
  const selectedView = view === "practice" ? "intro" : view;
  const active = tabs.find(({ key }) => key === selectedView)?.key ?? "all";
  const show = (key: typeof active) => active === "all" || active === key;

  return (
    <>
      <SiteHeader active="havruta" />
      <main>
        <section className="relative isolate overflow-hidden bg-[#293833] text-white">
          <Image src="/brand/havruta-conversation.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-[#162822]/75" />
          <div className="relative mx-auto max-w-[1080px] px-4 py-10 md:px-8 md:py-16">
            <p className="text-sm font-semibold text-[#d7ecdf]">SK 변호사와 함께하는 부부 대화 수업</p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-6xl">부부하브루타</h1>
            <p className="mt-4 max-w-lg text-base leading-7 md:text-lg">또 같은 말로 다투기 전에, 질문 하나를 바꿔보세요. 집안일, 생활비, 양가 가족처럼 피하기 쉬운 이야기부터 함께 연습합니다.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={active === "all" ? "#curriculum" : `${path}?view=curriculum#curriculum`} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-bold text-[#20382f] hover:bg-[#edf5ef]">
                <ArrowDown className="size-4" aria-hidden="true" /> 커리큘럼 보기
              </Link>
              <a href={`mailto:${operator.email}?subject=${encodeURIComponent("부부하브루타 강의 문의")}`} className="inline-flex items-center gap-2 rounded-md border border-white/70 px-4 py-2.5 text-sm font-bold hover:bg-white/15">
                <Mail className="size-4" aria-hidden="true" /> 강의 문의
              </a>
            </div>
          </div>
        </section>

        <div className="border-b border-[var(--line)] bg-[var(--paper)]">
          <nav aria-label="부부하브루타 과정 메뉴" className="mx-auto flex max-w-[1080px] flex-wrap gap-x-4 gap-y-1 px-4 md:gap-x-7 md:px-8">
            {tabs.map(({ key, label }) => (
              <Link key={key} href={key === "all" ? path : `${path}?view=${key}`} scroll={false}
                aria-current={key === active ? "page" : undefined}
                className={`border-b-2 px-0.5 py-3 text-sm font-bold ${key === active ? "border-[#345b48] text-[#345b48]" : "border-transparent text-[var(--ink-soft)] hover:text-[#345b48]"}`}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mx-auto max-w-[1080px] px-4 pb-8 md:px-8">
          {show("intro") && (
            <section id="intro" className={sectionClass}>
              <h2 className={headingClass}>부부하브루타란?</h2>
              <p className={bodyClass}>저녁 메뉴와 내일 일정을 이야기했는데, 정작 서로 어떤 하루를 보냈는지는 모를 때가 있습니다. 오래 함께한 부부도 마찬가지입니다. 부부하브루타는 매일 마주치는 사람에게 아직 모르는 것이 있다는 데서 시작합니다.</p>

              <h3 className="mt-8 text-xl font-bold">우리 대화에도 이런 순간이 있나요?</h3>
              <ul className="mt-4 ml-5 max-w-3xl list-disc space-y-2 leading-7">
                <li>식사와 일정 얘기가 끝나면 무슨 말을 꺼낼지 막막해집니다.</li>
                <li>한 공간에 있으면서 각자 휴대폰만 보다가 하루가 끝납니다.</li>
                <li>같은 얘기를 되풀이할 것 같아서, 하려던 말을 중간에 접습니다.</li>
                <li>말은 오래 했는데 내 마음은 전하지 못한 것 같고, 배우자가 요즘 무엇을 좋아하는지도 잘 모르겠습니다.</li>
              </ul>
              <p className={bodyClass}>마음을 꺼내는 게 어색하다면, 상대가 고치길 바라는 일보다 그 사람이 오늘 어떻게 지냈는지부터 물어보세요.</p>

              <h3 className="mt-8 text-xl font-bold">짝과 함께 묻고 생각하는 전통</h3>
              <p className={bodyClass}>하브루타는 학습 짝을 뜻하는 말로, 유대 전통에서 두 사람이 글을 함께 읽고 서로의 해석을 묻는 방식입니다. 같은 문장을 읽어도 각자 주목하는 부분이 다릅니다. 상대의 질문에 답하며 자기 생각을 더 분명히 살펴볼 수 있습니다. 부부는 한 문장 대신 오늘 겪은 일 하나로 시작해도 좋습니다.</p>
              <dl className="mt-5 max-w-3xl divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {conversationPrinciples.map(([title, detail]) => (
                  <div key={title} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
                    <dt className="font-bold text-[#345b48]">{title}</dt>
                    <dd className="text-sm leading-6 text-[var(--ink-soft)]">{detail}</dd>
                  </div>
                ))}
              </dl>
              <p className={bodyClass}>집에서 기억할 것은 세 가지입니다. 질문으로 시작하고, 말을 끊지 않고 듣고, 답이 달라도 그 이유를 물어봅니다. 저녁 식탁처럼 자주 마주치는 자리에서 해보세요. 서로 판단받을 걱정 없이 말할 수 있는 순간을 고르고, 아이와도 책이나 뉴스에서 각자 궁금했던 점을 나눠볼 수 있습니다.</p>

              <h3 className="mt-8 text-xl font-bold">같은 상황에서 어떤 말을 건넬까요?</h3>
              <div className="mt-4 max-w-3xl divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {conversationExamples.map(({ situation, before, after }) => (
                  <div key={situation} className="py-4">
                    <h4 className="font-bold">{situation}</h4>
                    <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm leading-6 sm:grid-cols-[5rem_1fr]">
                      <dt className="text-[var(--ink-soft)]">익숙한 말</dt>
                      <dd className="text-[var(--ink-soft)]">“{before}”</dd>
                      <dt className="font-bold text-[#345b48]">바꿔 묻기</dt>
                      <dd>“{after}”</dd>
                    </dl>
                  </div>
                ))}
              </div>

              <h3 className="mt-8 text-xl font-bold">질문이 이어지는 대화 예시</h3>
              <dl className="mt-4 max-w-3xl divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {practiceDialogue.map(([speaker, line]) => (
                  <div key={line} className="grid gap-1 py-3 text-sm leading-6 sm:grid-cols-[7rem_1fr] sm:gap-4">
                    <dt className="font-bold text-[#345b48]">{speaker}</dt>
                    <dd>“{line}”</dd>
                  </div>
                ))}
              </dl>
              <p className={bodyClass}>한 번 더 묻자, 회의에서 안이 채택되지 않은 일보다 자신의 설명을 들어주는 사람이 없었다는 점이 더 마음에 남았음을 알게 됩니다. 조언은 상대가 원하는지 물은 뒤에 해도 늦지 않습니다.</p>

              <h3 id="practice" className="mt-8 scroll-mt-6 text-xl font-bold">오늘 저녁, 10분 실습</h3>
              <ol className="mt-4 ml-5 max-w-3xl list-decimal space-y-2 leading-7">
                <li>둘 다 여유가 있을 때 TV를 끄고 휴대폰을 내려놓습니다.</li>
                <li>지금 편하게 답할 수 있는 질문을 아래에서 하나 고릅니다.</li>
                <li>한 사람이 묻고 말을 끊지 않고 듣습니다. 다 들으면 이해한 내용을 짧게 확인합니다.</li>
                <li>5분 뒤 역할을 바꿉니다. 답하기 어려운 질문은 건너뛰어도 됩니다.</li>
              </ol>
              <ul className="mt-4 ml-5 max-w-3xl list-disc space-y-2 leading-7">
                <li>오늘 마음이 한결 가벼워진 순간이 있었어?</li>
                <li>요즘 혼자 마음에 담아둔 일 중에 오늘 나누고 싶은 게 있어?</li>
                <li>요즘 내 모습 중에 당신에게 새롭게 보인 게 있어?</li>
              </ul>
              <p className={bodyClass}>마지막에 오늘 새로 알게 된 점을 한 가지씩 나눠보세요. 오늘은 질문 하나만 꺼내보고 다음에 이어가도 됩니다.</p>

              <h3 className="mt-8 text-xl font-bold">시작하기 전에 자주 묻는 질문</h3>
              <dl className="mt-4 max-w-3xl divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {practiceQuestions.map(([question, answer]) => (
                  <div key={question} className="py-4">
                    <dt className="font-bold">{question}</dt>
                    <dd className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">{answer}</dd>
                  </div>
                ))}
              </dl>
              <a href="https://havruta-seung-a.tistory.com/1" className="mt-4 inline-block text-sm text-[#345b48] underline underline-offset-4">참고 자료 · 이승아의 부부하브루타 글과 카드 15장</a>
            </section>
          )}

          {show("effects") && (
            <section id="effects" className={sectionClass}>
              <h2 className={headingClass}>효과</h2>
              <p className={bodyClass}>부부하브루타는 상대의 생각을 더 구체적으로 듣고, 의견이 갈릴 때 다시 이야기할 방법을 연습하는 데 도움이 될 수 있습니다.</p>
              <dl className="mt-5 max-w-3xl divide-y divide-[var(--line)] border-y border-[var(--line)]">
                <div className="py-4">
                  <dt className="font-bold">내 생각의 이유를 더 깊이 살핍니다</dt>
                  <dd className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">왜 그렇게 생각하는지 설명해보고, 상대가 주목한 점도 듣습니다. 같은 일에서 내가 놓친 부분을 발견하거나, 처음 떠올린 판단을 다시 생각해볼 수 있습니다.</dd>
                </div>
                <div className="py-4">
                  <dt className="font-bold">일정 밖의 이야기도 나눕니다</dt>
                  <dd className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">집안일과 내일 일정을 함께 챙기는 사이이기에, 짧게라도 서로에게 물어볼 기회를 만들 수 있습니다. 요즘 무엇이 힘든지, 어떤 말에 힘을 얻었는지 구체적으로 알아갑니다.</dd>
                </div>
                <div className="py-4">
                  <dt className="font-bold">서로 다르게 생각하는 이유를 알아봅니다</dt>
                  <dd className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">생활비나 주말 계획을 놓고 의견이 다를 때, 각자 무엇이 중요했는지 물어봅니다. 그 이유를 알고 나면 두 사람이 받아들일 수 있는 작은 약속을 찾기가 수월해질 수 있습니다.</dd>
                </div>
                <div className="py-4">
                  <dt className="font-bold">아이의 질문을 받는 습관으로 이어갑니다</dt>
                  <dd className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">질문을 주고받는 식탁 대화는 자녀와도 해볼 수 있습니다. 함께 읽은 기사나 책에서 각자 궁금했던 대목을 고르면, 아이가 자기 생각을 말하고 어른도 그 이유를 듣는 시간이 됩니다.</dd>
                </div>
              </dl>
            </section>
          )}

          {show("curriculum") && (
            <section id="curriculum" className={sectionClass}>
              <h2 className={headingClass}>12회 커리큘럼</h2>
              <p className={bodyClass}>듣는 연습에서 시작해 실제 갈등 주제를 다루고, 마지막에는 집에서 이어갈 대화 약속을 만듭니다.</p>
              {curriculum.map(({ phase, lessons }, group) => (
                <div key={phase} className="mt-8">
                  <h3 className="mb-2 text-sm font-bold text-[#345b48]">{phase}</h3>
                  <ol start={group * 4 + 1} className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                    {lessons.map(([title, detail], index) => (
                      <li key={title} className="grid grid-cols-[3rem_1fr] gap-3 py-4">
                        <span className="pt-0.5 text-sm font-semibold tabular-nums text-[var(--ink-soft)]">{group * 4 + index + 1}회</span>
                        <div><h4 className="font-bold">{title}</h4><p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{detail}</p></div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </section>
          )}

          {show("instructor") && (
            <section id="instructor" className={sectionClass}>
              <h2 className={headingClass}>강사 소개</h2>
              <h3 className="mt-5 text-xl font-bold">SK 변호사</h3>
              <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm leading-6 sm:grid-cols-[auto_1fr]">
                <dt className="font-bold text-[#345b48]">경력</dt>
                <dd>15년 차 이혼 전문 변호사</dd>
                <dt className="font-bold text-[#345b48]">자격</dt>
                <dd>하브루타 전문 강사 자격 보유</dd>
              </dl>
              <p className={bodyClass}>이혼 사건을 다루며 마주한 부부 갈등을 바탕으로 수업을 구성했습니다. 집안일이나 생활비처럼 같은 문제로 자주 부딪힐 때, 두 사람이 그 일을 각각 어떻게 받아들였는지부터 살핍니다.</p>
              <p className={bodyClass}>수업에서는 추궁처럼 들리는 말을 열린 질문으로 바꾸고, 상대의 답을 내 말로 되짚어봅니다. 연습을 마치면 비슷한 상황에서 꺼내볼 질문 한 문장과 함께 시도할 작은 약속을 정합니다.</p>
              <p className="mt-6 text-xs text-[var(--ink-soft)]">강사 실명: 김상겸</p>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
