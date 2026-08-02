import type { Metadata } from "next";

import {
  LegalBullets,
  LegalDocument,
  LegalList,
  LegalNotice,
  LegalSection,
  LegalTable,
} from "@/components/booboo/legal-document";
import { legalEffectiveDate, operator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 부부라이프",
  description: "부부라이프가 처리하는 회원, 소셜 로그인, 게시물과 페르소나 정보를 안내합니다.",
  alternates: { canonical: "https://booboolife.com/company/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      active="privacy"
      title="개인정보처리방침"
      description="어떤 정보를 왜 처리하는지, 소셜 로그인 정보와 인증 페르소나가 어떻게 저장되는지 설명합니다."
      effectiveDate={legalEffectiveDate}
      version="1.0"
    >
      <LegalNotice>
        부부라이프는 Google·카카오 로그인에서 계정 연결에 필요한 정보만 요청합니다. Google 사용자 정보를 판매하거나 광고, 신용평가 또는 AI 모델 학습에 사용하지 않습니다.
      </LegalNotice>

      <LegalSection title="1. 개인정보 처리자">
        <p>
          {operator.businessName}(이하 “운영자”)는 개인정보 보호법에 따라 부부라이프 이용자의 개인정보를 보호하고 관련 문의와 권리 행사를 처리하기 위해 이 방침을 공개합니다.
        </p>
      </LegalSection>

      <LegalSection title="2. 처리 목적, 항목과 보유 기간">
        <LegalTable
          headers={["구분", "처리 항목", "목적", "보유 기간"]}
          rows={[
            [
              "이메일 가입",
              "이메일, 닉네임, 암호화된 비밀번호, 선택한 성별",
              "회원 식별, 로그인, 프로필과 선택형 페르소나 제공",
              "회원 탈퇴 시까지",
            ],
            [
              "Google 로그인",
              "Google 계정 식별자, 이메일, 이름, 프로필 이미지, OAuth 연결 정보",
              "Google 계정으로 가입·로그인, 계정 연결 유지",
              "연결 해제 또는 회원 탈퇴 시까지",
            ],
            [
              "카카오 로그인",
              "카카오 계정 식별자, 닉네임, OAuth 연결 정보, 제공에 동의한 경우 프로필 이미지·이메일·성별·연령대",
              "카카오 계정으로 가입·로그인, 동의 항목의 인증 페르소나 생성",
              "연결 해제 또는 회원 탈퇴 시까지",
            ],
            [
              "프로필·페르소나",
              "닉네임, 프로필 이미지, 성별, 나이대, 직업, 결혼연도, 부모 경험, 공개 여부, 인증 상태와 최소 인증 이력",
              "프로필 표시, 선택형 페르소나 관리와 인증",
              "항목 삭제 또는 회원 탈퇴 시까지",
            ],
            [
              "커뮤니티 이용",
              "게시물, 댓글, 반응, 투표, 스크랩, 익명 편지, 미션 참여·소감, 운영 제안",
              "커뮤니티 기능 제공, 신고 처리, 운영정책 적용",
              "이용자가 삭제하거나 서비스 종료 시까지",
            ],
            [
              "자동 생성 정보",
              "접속 IP, 접속기록, 브라우저·기기 정보, 인증 쿠키, 익명 반응 식별 쿠키",
              "로그인 유지, 중복 반응 방지, 보안과 부정 이용 방지",
              "인증·익명 식별 쿠키는 최대 1년, 보안 접속기록은 원칙적으로 최대 3개월",
            ],
            [
              "문의와 권리 행사",
              "이름 또는 닉네임, 이메일, 문의 내용, 본인 확인에 필요한 정보",
              "문의 답변, 삭제·열람 요청과 분쟁 처리",
              "처리 완료 후 3년",
            ],
          ]}
        />
        <p className="text-sm text-[var(--ink-soft)]">
          법령에 별도 보존 의무가 있거나 분쟁·수사 대응을 위해 필요한 경우에는 해당 근거와 기간에 따라 분리 보관할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="3. 개인정보를 수집하는 방법">
        <LegalBullets>
          <li>회원가입, 프로필 편집, 글·댓글 작성과 문의 과정에서 이용자가 직접 입력</li>
          <li>이용자가 동의한 범위에서 Google 또는 카카오가 제공</li>
          <li>서비스 이용 과정에서 웹 서버, 인증 쿠키와 보안 시스템을 통해 자동 생성</li>
        </LegalBullets>
      </LegalSection>

      <LegalSection title="4. Google 사용자 데이터의 처리">
        <LegalList>
          <li><strong>접근:</strong> 로그인에 필요한 기본 프로필 범위에서 계정 식별자, 이름, 이메일과 프로필 이미지를 받습니다.</li>
          <li><strong>이용:</strong> 부부라이프 계정 생성, 로그인, 계정 연결과 프로필 표시에만 사용합니다.</li>
          <li><strong>저장:</strong> 계정 식별 정보와 로그인 연결 유지에 필요한 OAuth 정보를 암호화된 통신과 접근 통제가 적용된 데이터베이스에 저장할 수 있습니다.</li>
          <li><strong>공유:</strong> 이용자의 동의 없이 Google 사용자 데이터를 판매하거나 광고 사업자에게 제공하지 않습니다. 법령에 따른 적법한 요구가 있는 경우를 제외하고 제3자에게 제공하지 않습니다.</li>
          <li><strong>제한적 이용:</strong> Google 사용자 데이터를 맞춤 광고, 신용평가, 감시 또는 범용 AI 모델 학습에 사용하지 않습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. 카카오 사용자 데이터와 인증 페르소나">
        <LegalList>
          <li>카카오 로그인은 계정 식별자와 기본 프로필을 사용하며, 이메일·성별·연령대는 이용자가 카카오 동의 화면에서 허용한 경우에만 받습니다.</li>
          <li>성별과 연령대가 제공되면 해당 값은 각각 “카카오 인증” 페르소나로 저장될 수 있습니다.</li>
          <li>인증 이력에는 제공자와 확인한 항목 등 최소한의 근거만 남기며 카카오 원본 프로필 전체를 인증 증빙으로 별도 복제하지 않습니다.</li>
          <li>프로필에서 페르소나 공개 여부를 바꾸거나 항목 삭제를 요청할 수 있습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="6. 개인정보의 제3자 제공">
        <p>운영자는 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다음 경우에는 예외로 합니다.</p>
        <LegalBullets>
          <li>이용자가 제공 대상, 목적, 항목과 기간을 확인하고 별도로 동의한 경우</li>
          <li>법령에 근거가 있거나 수사기관·법원이 적법한 절차에 따라 요구한 경우</li>
          <li>사람의 생명이나 신체에 급박한 위험이 있어 개인정보 보호법이 허용하는 범위에서 필요한 경우</li>
        </LegalBullets>
      </LegalSection>

      <LegalSection title="7. 개인정보 처리업무의 위탁">
        <LegalTable
          headers={["수탁자", "위탁 업무", "보유·이용 기간"]}
          rows={[
            [
              "아마존웹서비시즈코리아 유한책임회사",
              "서버, 데이터베이스와 보안 인프라 운영",
              "서비스 이용 또는 위탁계약 종료 시까지",
            ],
          ]}
        />
        <p className="text-sm text-[var(--ink-soft)]">
          새로운 수탁자가 이용자 개인정보를 처리하게 되면 이 방침을 통해 공개합니다. 현재 이용자 개인정보의 국외 이전을 전제로 운영하지 않으며, 국외 이전이 필요한 경우 관련 사항을 별도로 알리고 필요한 절차를 거칩니다.
        </p>
      </LegalSection>

      <LegalSection title="8. 개인정보의 파기">
        <LegalList>
          <li>보유 기간이 끝나거나 처리 목적이 달성되면 지체 없이 개인정보를 파기합니다.</li>
          <li>전자 파일은 복구하기 어려운 방법으로 삭제하고, 출력물이 있는 경우 분쇄하거나 소각합니다.</li>
          <li>법령에 따라 보존해야 하는 정보는 다른 정보와 분리해 해당 기간 동안만 보관합니다.</li>
          <li>탈퇴 후 남는 공개 게시물은 계정과의 연결을 끊고 작성자를 익명으로 표시할 수 있습니다. 게시물 자체의 삭제를 원하면 탈퇴 전에 삭제하거나 별도로 요청해야 합니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="9. 이용자의 권리와 행사 방법">
        <LegalList>
          <li>이용자는 자신의 개인정보 열람, 전송, 정정·삭제, 처리 정지와 동의 철회를 요청할 수 있습니다.</li>
          <li>프로필과 공개 페르소나는 마이페이지에서 직접 수정할 수 있습니다.</li>
          <li>계정 삭제, 소셜 연결 해제와 그 밖의 권리 행사는 {operator.email}로 요청할 수 있습니다. 운영자는 요청자가 본인인지 확인할 수 있습니다.</li>
          <li>법정대리인이나 위임받은 사람도 법령에서 정한 방법으로 권리를 행사할 수 있습니다.</li>
          <li>다른 법령에서 수집 대상으로 정했거나 다른 사람의 권리를 침해할 우려가 있는 경우 일부 요청이 제한될 수 있으며, 그 이유를 안내합니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="10. 만 14세 미만 아동의 정보">
        <p>
          서비스는 만 14세 미만 아동의 회원가입을 받지 않으며, 법정대리인 동의 절차를 제공하지 않습니다. 만 14세 미만 아동의 정보가 수집된 사실을 알게 되면 확인 후 지체 없이 삭제합니다.
        </p>
      </LegalSection>

      <LegalSection title="11. 쿠키와 거부 방법">
        <LegalList>
          <li>로그인 상태를 유지하기 위한 필수 인증 쿠키와 익명 편지의 중복 반응을 막기 위한 무작위 식별 쿠키를 사용합니다.</li>
          <li>익명 식별 쿠키에는 이름, 이메일과 게시물 내용이 직접 들어가지 않습니다.</li>
          <li>브라우저 설정에서 쿠키를 삭제하거나 차단할 수 있습니다. 필수 쿠키를 차단하면 로그인과 일부 반응 기능이 작동하지 않을 수 있습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="12. 안전성 확보 조치">
        <LegalBullets>
          <li>비밀번호의 단방향 암호화 저장과 전송 구간 암호화</li>
          <li>개인정보와 운영 환경변수에 대한 접근 권한 제한</li>
          <li>접속기록 관리, 보안 업데이트와 취약점 점검</li>
          <li>개인정보 처리 최소화와 인증 근거의 최소 저장</li>
          <li>침해사고 발생 시 차단, 영향 확인과 법령에 따른 통지</li>
        </LegalBullets>
      </LegalSection>

      <LegalSection title="13. AI를 활용한 운영">
        <LegalList>
          <li>공개 게시물과 신고 내용은 유해 가능성 분류, 중복 확인과 운영 판단 보조를 위해 AI 분석 대상이 될 수 있습니다.</li>
          <li>OAuth 토큰, 비밀번호와 비공개 인증 자료는 AI 운영 판단의 입력으로 사용하지 않습니다.</li>
          <li>현재 이용자의 권리나 의무에 중대한 영향을 주는 조치를 AI만으로 확정하지 않습니다.</li>
          <li>중대한 이용 제한에 대해 설명과 사람의 재검토를 요청할 수 있습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="14. 개인정보 보호책임자와 구제 방법">
        <LegalBullets>
          <li>개인정보 보호책임자: {operator.representative}</li>
          <li>연락처: {operator.phone}</li>
          <li>이메일: {operator.email}</li>
        </LegalBullets>
        <p>
          개인정보 침해에 관한 상담이 필요하면 개인정보침해신고센터(국번 없이 118), 개인정보분쟁조정위원회(1833-6972), 경찰청(국번 없이 182) 등 관계 기관에 문의할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="15. 방침 변경">
        <p>
          이 방침을 변경할 때에는 시행 7일 전부터 서비스에 알립니다. 이용자 권리에 중대한 영향을 주는 변경은 원칙적으로 30일 전에 알립니다.
        </p>
        <p className="text-sm text-[var(--ink-soft)]">
          {operator.businessName} · 대표 {operator.representative} · {operator.address} · {operator.email}
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
