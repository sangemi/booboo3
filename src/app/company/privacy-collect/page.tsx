import type { Metadata } from "next";

import {
  LegalDocument,
  LegalNotice,
  LegalSection,
  LegalTable,
} from "@/components/booboo/legal-document";
import { legalEffectiveDate, operator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "개인정보 수집·이용 동의 | 부부라이프",
  description: "부부라이프 회원가입과 소셜 로그인에 필요한 개인정보 수집·이용 내용을 안내합니다.",
  alternates: { canonical: "https://booboolife.com/company/privacy-collect" },
};

export default function PrivacyCollectPage() {
  return (
    <LegalDocument
      active="privacy-collect"
      title="개인정보 수집·이용 동의"
      description="회원가입 방법에 따라 꼭 필요한 정보와 선택해서 제공할 수 있는 정보를 구분해 안내합니다."
      effectiveDate={legalEffectiveDate}
      version="1.0"
    >
      <LegalNotice>
        필수 항목의 수집·이용에 동의하지 않을 권리가 있습니다. 다만 계정을 식별하고 로그인할 수 없어 회원 서비스 이용이 제한됩니다. 선택 항목은 제공하지 않아도 기본 기능을 이용할 수 있습니다.
      </LegalNotice>

      <LegalSection title="1. 이메일 회원가입 (필수)">
        <LegalTable
          headers={["수집 항목", "이용 목적", "보유 기간"]}
          rows={[
            [
              "이메일, 닉네임, 암호화된 비밀번호",
              "회원가입, 본인 식별, 로그인과 계정 관리",
              "회원 탈퇴 시까지",
            ],
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Google 로그인 (필수)">
        <LegalTable
          headers={["수집 항목", "이용 목적", "보유 기간"]}
          rows={[
            [
              "Google 계정 식별자, 이메일, 이름, 프로필 이미지, OAuth 연결 정보",
              "Google 계정으로 가입·로그인하고 부부라이프 계정과 연결",
              "연결 해제 또는 회원 탈퇴 시까지",
            ],
          ]}
        />
        <p className="text-sm text-[var(--ink-soft)]">
          Google 사용자 데이터는 로그인과 이용자에게 보이는 계정 기능에만 사용하며, 판매·광고·신용평가·범용 AI 모델 학습에 사용하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="3. 카카오 로그인">
        <LegalTable
          headers={["구분", "수집 항목", "이용 목적", "보유 기간"]}
          rows={[
            [
              "필수",
              "카카오 계정 식별자, 닉네임, OAuth 연결 정보",
              "카카오 계정으로 가입·로그인하고 부부라이프 계정과 연결",
              "연결 해제 또는 회원 탈퇴 시까지",
            ],
            [
              "선택",
              "프로필 이미지, 이메일, 성별, 연령대",
              "프로필 표시와 카카오가 확인한 성별·연령대의 인증 페르소나 저장",
              "페르소나 삭제, 연결 해제 또는 회원 탈퇴 시까지",
            ],
          ]}
        />
        <p className="text-sm text-[var(--ink-soft)]">
          선택 항목 제공에 동의하지 않아도 카카오 로그인과 커뮤니티 기본 기능을 이용할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="4. 선택형 프로필과 커뮤니티 정보">
        <LegalTable
          headers={["수집 항목", "이용 목적", "보유 기간"]}
          rows={[
            [
              "성별, 나이대, 직업, 결혼연도, 부모 경험, 공개 여부와 인증 상태",
              "이용자가 선택한 페르소나 표시와 인증",
              "항목 삭제 또는 회원 탈퇴 시까지",
            ],
            [
              "글, 댓글, 익명 편지, 투표, 반응, 스크랩, 미션 참여·소감, 운영 제안",
              "이용자가 요청한 커뮤니티 기능 제공과 운영정책 적용",
              "이용자가 삭제하거나 서비스 종료 시까지",
            ],
          ]}
        />
      </LegalSection>

      <LegalSection title="5. 동의 철회와 문의">
        <p>
          프로필과 페르소나는 마이페이지에서 수정할 수 있습니다. 계정 삭제, 소셜 연결 해제 또는 수집·이용 동의 철회는 {operator.email}로 요청할 수 있습니다. 자세한 처리 기준은 개인정보처리방침에서 확인할 수 있습니다.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
