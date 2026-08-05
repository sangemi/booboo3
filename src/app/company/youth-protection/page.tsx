import type { Metadata } from "next";

import {
  LegalBullets,
  LegalDocument,
  LegalList,
  LegalNotice,
  LegalSection,
} from "@/components/booboo/legal-document";
import { legalEffectiveDate, operator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "청소년 보호정책",
  description: "부부라이프의 청소년 유해정보 차단과 보호 기준을 안내합니다.",
  alternates: { canonical: "https://booboolife.com/company/youth-protection" },
};

export default function YouthProtectionPage() {
  return (
    <LegalDocument
      active="youth-protection"
      title="청소년 보호정책"
      description="부부 관계를 다루는 과정에서 청소년에게 해로운 정보가 무분별하게 노출되지 않도록 적용하는 기준입니다."
      effectiveDate={legalEffectiveDate}
      version="1.0"
    >
      <LegalNotice>
        부부라이프 회원가입은 만 14세 이상부터 가능합니다. 청소년에게 유해하거나 아동·청소년의 안전을 침해하는 정보는 발견 즉시 제한합니다.
      </LegalNotice>

      <LegalSection title="1. 보호 원칙">
        <LegalBullets>
          <li>아동·청소년의 성적 대상화와 착취를 허용하지 않습니다.</li>
          <li>가정 갈등을 다루더라도 자녀의 신원과 사생활을 우선 보호합니다.</li>
          <li>자살·자해, 폭력, 약물과 범죄를 미화하거나 실행을 돕는 정보의 노출을 제한합니다.</li>
          <li>청소년에게 부적절한 정보는 삭제, 가림, 검색 제외 또는 접근 제한할 수 있습니다.</li>
        </LegalBullets>
      </LegalSection>

      <LegalSection title="2. 금지되는 정보">
        <LegalList>
          <li>아동·청소년 성착취물과 이를 제작·공유·구매하도록 유도하는 정보</li>
          <li>아동·청소년의 나체, 성적 이미지 또는 성적 수치심을 유발하는 합성·편집물</li>
          <li>미성년자의 이름, 얼굴, 학교, 주소, 연락처 등 신원을 알아볼 수 있는 정보</li>
          <li>성매매, 불법 약물, 도박, 흉기와 범죄 실행을 구체적으로 권유하거나 안내하는 정보</li>
          <li>자살·자해 방법을 구체적으로 설명하거나 이를 부추기는 정보</li>
          <li>청소년에게 심각한 정신적·신체적 위해를 줄 수 있는 잔혹하거나 음란한 정보</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. 예방과 조치">
        <LegalList>
          <li>운영자는 신고와 AI 보조 검토를 통해 유해 가능성이 높은 게시물을 우선 확인할 수 있습니다.</li>
          <li>중대한 유해정보는 사전 안내 없이 즉시 차단하고, 반복 게시 계정을 제한합니다.</li>
          <li>범죄 피해가 의심되거나 법적 신고 의무가 있는 경우 관계 기관의 적법한 절차에 협조할 수 있습니다.</li>
          <li>유해정보의 재게시, 링크 공유, 우회 표현도 동일하게 제한합니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. 보호 요청">
        <p>
          청소년 유해정보나 아동·청소년의 개인정보 노출을 발견하면 게시물 주소와 문제되는 부분을 {operator.email}로 보내 주세요. 긴급한 신체 위험이나 범죄 상황은 서비스 신고보다 112 등 관계 기관에 먼저 연락해야 합니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 담당자">
        <p>청소년 보호 업무는 서비스 규모와 관계없이 운영책임자가 함께 담당합니다.</p>
        <LegalBullets>
          <li>책임자: {operator.representative}</li>
          <li>연락처: {operator.phone}</li>
          <li>이메일: {operator.email}</li>
        </LegalBullets>
      </LegalSection>
    </LegalDocument>
  );
}
