"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Gauge,
  HeartHandshake,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import { SiteFooter } from "@/components/booboo/site-footer";

import styles from "./ai-operations-room.module.css";

const inspectionMessages = [
  "남편 말 듣고 끄덕이다가 아내 말도 다시 듣는 중",
  "아내 말이 맞나 싶다가 남편 사정도 펼쳐보는 중",
  "둘 다 말이 길어서 AI가 물 한 잔 마시는 중",
  "판정 전에 맥락 한 국자 더 넣는 중",
] as const;

const conveyorCargo = [
  { label: "남편 말", tone: "plum" },
  { label: "아내 말", tone: "coral" },
  { label: "맥락 부족", tone: "butter" },
  { label: "둘 다 말이 김", tone: "leaf" },
] as const;

export function AiOperationsRoom() {
  const [inspectionRound, setInspectionRound] = useState(0);
  const currentMessage = inspectionMessages[inspectionRound];

  function runInspectionAgain() {
    setInspectionRound((current) => (current + 1) % inspectionMessages.length);
  }

  return (
    <main className={styles.room}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/brand/booboolife-mark-192.png"
            alt=""
            width={42}
            height={42}
            priority
          />
          <span>부부라이프</span>
        </Link>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft aria-hidden="true" />
          커뮤니티로 돌아가기
        </Link>
      </header>

      <section className={styles.stage}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            <Bot aria-hidden="true" />
            AI 운영실, 오늘도 가동 중
          </p>
          <h1>AI를 이용한 중립적 커뮤니티</h1>
          <p className={styles.lead}>
            한쪽 말만 듣고 고개를 끄덕이면 경고등이 켜집니다. 양쪽 이야기를
            번갈아 살피고, 비난은 덜고 맥락은 더합니다.
          </p>
        </div>

        <div className={styles.controlDeck}>
          <div className={styles.statusBar}>
            <span className={styles.liveLight} aria-hidden="true" />
            <strong>편향 교정기 3호</strong>
            <span>가끔 삐걱거리지만 한쪽 편은 들지 않습니다</span>
          </div>

          <div className={styles.machineGrid}>
            <section className={styles.machine} aria-label="AI 중립 점검 장치">
              <div className={styles.machineHeading}>
                <div>
                  <Wrench aria-hidden="true" />
                  <strong>양쪽 말 번갈아 듣는 기계</strong>
                </div>
                <span>뚝딱 · 뚝딱 · 잠깐만요</span>
              </div>

              <div className={styles.factoryWindow} key={inspectionRound}>
                <div className={styles.rail} aria-hidden="true" />
                <div className={styles.inspector} aria-hidden="true">
                  <span className={styles.cable} />
                  <span className={styles.botHead}>
                    <Bot />
                  </span>
                  <span className={styles.scannerBeam} />
                </div>

                <div className={styles.notice}>
                  <TriangleAlert aria-hidden="true" />
                  성급한 결론 투입 금지
                </div>

                <div className={styles.conveyor} aria-hidden="true">
                  <div className={styles.beltMarks} />
                  <div className={styles.cargoLine}>
                    {[...conveyorCargo, ...conveyorCargo].map((cargo, index) => (
                      <span
                        key={`${cargo.label}-${index}`}
                        className={styles[cargo.tone]}
                      >
                        {cargo.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <output className={styles.machineOutput} aria-live="polite">
                <Sparkles aria-hidden="true" />
                {currentMessage}
              </output>
            </section>

            <aside className={styles.gaugePanel} aria-label="중립 상태">
              <div className={styles.gaugeTitle}>
                <Gauge aria-hidden="true" />
                <span>오늘의 기계 상태</span>
              </div>

              <div className={styles.scaleIcon} aria-hidden="true">
                <Scale />
              </div>
              <label htmlFor="neutrality-meter">가운데 찾는 중</label>
              <meter
                id="neutrality-meter"
                min={0}
                max={100}
                low={35}
                high={65}
                optimum={50}
                value={50}
                className={styles.meter}
              >
                50%
              </meter>
              <div className={styles.meterLabels}>
                <span>왼쪽 말</span>
                <strong>50 : 50</strong>
                <span>오른쪽 말</span>
              </div>

              <div className={styles.recipe}>
                <p>
                  <ShieldCheck aria-hidden="true" /> 비난 3g 덜기
                </p>
                <p>
                  <HeartHandshake aria-hidden="true" /> 맥락 2스푼 추가
                </p>
              </div>

              <button type="button" onClick={runInspectionAgain}>
                <RotateCcw aria-hidden="true" />
                한 번 더 재보기
              </button>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
