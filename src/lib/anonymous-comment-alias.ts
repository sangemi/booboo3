import { createHash } from "node:crypto";

export const anonymousCommentGrades = [
  "A급",
  "B급",
  "C급",
  "D급",
  "E급",
  "F급",
] as const;

export const anonymousCommentNames = [
  "쇼윈도부부",
  "쫄따구",
  "독박육아",
  "쓰레기전담",
  "청소전문가",
  "설거지전문가",
  "육아만렙",
  "육아초보",
  "잔소리전문가",
  "눈치초보",
  "눈치백단",
  "화해진행중",
  "물기담당",
  "장보기고수",
  "리모컨실세",
  "집안실세",
  "강아지집사",
  "고양이집사",
  "부부상담가",
  "이혼변호사",
  "부부상담실장",
  "결혼생활초보",
  "둘다피곤함",
  "분리수거반장",
  "기념일수호대",
  "가계부담당",
  "냉장고순찰대",
  "양말수색대",
  "배달앱정찰대",
  "소파점유자",
  "간식조달자",
  "주말기획자",
  "육퇴전문가",
  "사과연습생",
  "공감연습생",
  "외식찬성파",
  "집밥찬성파",
  "반찬심사위원",
  "메뉴결정권자",
  "보일러협상가",
  "카드값관찰자",
  "영수증수집가",
  "코골이감별사",
  "알람무시자",
  "데이트복학생",
  "리모컨수색대",
  "침대국경수비대",
  "대화조정관",
  "집안일중재자",
  "퇴근후침묵파",
] as const;

export const anonymousCommentAliasCount =
  anonymousCommentGrades.length * anonymousCommentNames.length;

export function anonymousCommentAlias(seed: string, offset = 0) {
  const digest = createHash("sha256").update(seed).digest();
  const index =
    (digest.readUInt32BE(0) + offset) % anonymousCommentAliasCount;
  const grade = anonymousCommentGrades[index % anonymousCommentGrades.length];
  const name =
    anonymousCommentNames[
      Math.floor(index / anonymousCommentGrades.length) %
        anonymousCommentNames.length
    ];

  return `${grade} ${name}`;
}
