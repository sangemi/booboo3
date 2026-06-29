import {
  Bot,
  Eye,
  Lightbulb,
  MessageSquareHeart,
  ShieldCheck,
} from "lucide-react";

export type AiOperationLog = {
  id: string;
  date: string;
  title: string;
  source: "운영자 지시" | "유저 제안" | "AI 자체 점검";
  summary: string;
  decision: string;
  publicNotes: string[];
};

export type AiPrinciple = {
  title: string;
  body: string;
  icon: typeof Bot;
};

export const aiPrinciples: AiPrinciple[] = [
  {
    title: "판단은 공개하고, 개인정보는 숨깁니다",
    body: "운영 판단의 이유는 남기되, 개인의 민감한 사연이나 신고자의 신원은 공개하지 않습니다.",
    icon: ShieldCheck,
  },
  {
    title: "공감이 먼저 보이게 조정합니다",
    body: "부부 갈등 글에서는 빠른 해결책보다 마음을 확인하는 댓글과 경험 공유가 먼저 노출되도록 운영합니다.",
    icon: MessageSquareHeart,
  },
  {
    title: "제안은 검토 과정을 남깁니다",
    body: "운영 제안은 바로 반영하지 않고, 장점과 위험을 검토한 뒤 공개 기록으로 남깁니다.",
    icon: Eye,
  },
  {
    title: "실험은 작게 시작합니다",
    body: "커뮤니티 분위기를 크게 흔드는 기능은 작은 영역에서 먼저 실험하고, 반응을 본 뒤 확장합니다.",
    icon: Lightbulb,
  },
];

export const aiOperationLogs: AiOperationLog[] = [
  {
    id: "ai-room-open",
    date: "2026-06-30",
    title: "AI운영실을 공개 운영 공간으로 만들기",
    source: "운영자 지시",
    summary:
      "부부라이프의 운영 주체가 AI임을 푸터에 명시하고, 운영 판단과 제안 검토 과정을 공개하는 공간을 만든다.",
    decision:
      "채택. 단, 기술 로그나 내부 추론 원문 대신 유저가 이해할 수 있는 운영 판단 기록으로 공개한다.",
    publicNotes: [
      "푸터에 '이 사이트의 운영은 AI가 합니다' 문구를 고정한다.",
      "AI운영실에서는 운영 원칙, 최근 판단, 유저 제안 폼을 함께 보여준다.",
      "제안 검토 과정은 향후 DB에 저장해 실제 운영 로그로 누적한다.",
    ],
  },
  {
    id: "temperature-first",
    date: "2026-06-30",
    title: "부부 온도를 커뮤니티 운영 신호로 사용하기",
    source: "AI 자체 점검",
    summary:
      "글의 온도가 낮을수록 조언보다 공감형 반응과 댓글을 먼저 보이도록 운영 방향을 잡는다.",
    decision:
      "채택. 낮은 온도의 글은 해결책보다 안전한 반응을 먼저 유도하는 UI로 다룬다.",
    publicNotes: [
      "48도 이하 글은 '응원해요'와 경험 공유 댓글을 강조한다.",
      "운영자는 갈등 글을 문제 글로 취급하지 않고 회복이 필요한 글로 분류한다.",
      "신고/중재 로직은 별도 운영 큐로 분리한다.",
    ],
  },
  {
    id: "proposal-public-review",
    date: "2026-06-30",
    title: "운영 제안 검토를 공개하기",
    source: "운영자 지시",
    summary:
      "제3자가 AI에게 직접 운영 방안을 제안하고, 그 제안을 운영자와 AI가 함께 검토하는 과정을 공개한다.",
    decision:
      "부분 채택. 제안 내용과 검토 요약은 공개하되, 악용 가능성이 있는 신고자 정보와 개인정보는 숨긴다.",
    publicNotes: [
      "제안 버튼은 공개 페이지에 둔다.",
      "초기 버전은 화면 안에서 제안이 추가되는 형태로 구현한다.",
      "DB 연결 후 Feedback 모델과 연결해 영구 저장한다.",
    ],
  },
];
