import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalBullets,
  LegalDocument,
  LegalList,
  LegalNotice,
  LegalSection,
} from "@/components/booboo/legal-document";
import { legalEffectiveDate, operator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "이용약관 | 부부라이프",
  description: "부부라이프 커뮤니티의 가입, 게시물, 이용 제한 및 운영 기준을 안내합니다.",
  alternates: { canonical: "https://booboolife.com/company/terms" },
};

export default function TermsPage() {
  return (
    <LegalDocument
      active="terms"
      title="이용약관"
      description="부부라이프에서 서로의 결혼생활을 안전하게 나누기 위해 이용자와 운영자가 함께 지켜야 할 기준입니다."
      effectiveDate={legalEffectiveDate}
      version="1.0"
    >
      <LegalNotice>
        게시물과 댓글은 원칙적으로 공개됩니다. 익명으로 작성해도 타인의 권리를 침해하거나 법령을 위반할 수 있는 내용은 게시할 수 없습니다.
      </LegalNotice>

      <LegalSection title="제1조 (목적)">
        <p>
          이 약관은 {operator.businessName}(이하 “운영자”)가 제공하는 부부라이프 웹사이트와 관련 서비스(이하 “서비스”)의 이용 조건, 운영자와 이용자의 권리·의무 및 책임사항을 정하는 것을 목적으로 합니다.
        </p>
      </LegalSection>

      <LegalSection title="제2조 (용어의 정의)">
        <LegalList>
          <li>“이용자”란 회원 여부와 관계없이 서비스를 이용하는 사람을 말합니다.</li>
          <li>“회원”이란 이메일, Google 또는 카카오 계정으로 가입해 계정을 가진 사람을 말합니다.</li>
          <li>“게시물”이란 글, 댓글, 익명 편지, 미션 소감, 투표, 반응, 프로필과 페르소나 등 이용자가 서비스에 입력하거나 공개한 정보를 말합니다.</li>
          <li>“페르소나”란 성별, 나이대, 직업, 결혼연도처럼 이용자가 선택적으로 등록하거나 인증받는 프로필 특성을 말합니다.</li>
          <li>“익명”은 다른 이용자에게 계정 이름을 표시하지 않는 게시 방식이며, 법적 책임이나 운영상 기록까지 없어지는 것을 뜻하지 않습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제3조 (약관의 효력과 변경)">
        <LegalList>
          <li>이 약관은 서비스에 게시하고 이용자가 동의한 때부터 효력이 발생합니다.</li>
          <li>운영자는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있습니다.</li>
          <li>중요한 변경은 시행 7일 전에 알리며, 이용자에게 불리한 변경은 원칙적으로 30일 전에 서비스 공지 또는 등록 이메일로 알립니다.</li>
          <li>이용자가 변경에 동의하지 않으면 계정을 탈퇴할 수 있습니다. 법령상 별도 동의가 필요한 변경은 동의를 다시 받습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제4조 (가입과 계정)">
        <LegalList>
          <li>회원은 만 14세 이상이어야 하며, 가입 과정에서 정확한 정보를 제공해야 합니다.</li>
          <li>이메일 계정의 비밀번호와 소셜 계정의 접근 권한은 회원 본인이 관리해야 합니다.</li>
          <li>타인의 이메일·소셜 계정을 사용하거나 다른 사람을 사칭해서는 안 됩니다.</li>
          <li>운영자는 허위 가입, 반복적인 제재 회피, 서비스 장애 유발이 확인된 신청을 거절하거나 계정을 제한할 수 있습니다.</li>
          <li>Google 또는 카카오로 처음 로그인하면 해당 소셜 계정과 연결된 부부라이프 계정이 생성될 수 있습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제5조 (서비스의 내용)">
        <p>운영자는 다음 기능을 제공합니다.</p>
        <LegalBullets>
          <li>부부톡, 남편 vs 아내, 생활팁 게시판과 댓글</li>
          <li>게시물 반응, 스크랩 및 계정당 1회의 판정 투표</li>
          <li>오늘의 부부 미션, 참여 기록과 소감 나누기</li>
          <li>익명 편지와 공감·비공감 반응</li>
          <li>프로필과 선택형 인증 페르소나</li>
          <li>AI를 활용한 운영 보조, 콘텐츠 정리 및 운영 제안 접수</li>
        </LegalBullets>
      </LegalSection>

      <LegalSection title="제6조 (게시물과 공개 범위)">
        <LegalList>
          <li>게시물은 작성 화면에서 별도로 비공개라고 명시하지 않는 한 인터넷에 공개되며 검색 서비스에 노출될 수 있습니다.</li>
          <li>회원은 게시 전에 배우자, 자녀, 가족과 제3자를 알아볼 수 있는 이름·사진·연락처·직장·주소 등 정보를 제거해야 합니다.</li>
          <li>회원이 ‘내 이름’을 선택한 게시물에는 공개 설정된 프로필과 인증 페르소나가 표시될 수 있습니다.</li>
          <li>탈퇴해도 이미 공개된 게시물은 서비스의 대화 흐름을 위해 작성자 표시를 제거한 상태로 남을 수 있습니다. 탈퇴 전에 직접 삭제하거나 운영자에게 삭제를 요청할 수 있습니다.</li>
          <li>게시물을 외부에 공유한 이용자나 검색 서비스의 저장본까지 운영자가 모두 회수할 수는 없습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제7조 (금지되는 이용)">
        <LegalBullets>
          <li>개인정보 노출, 신상 털기, 사칭, 스토킹 또는 협박</li>
          <li>명예훼손, 모욕, 혐오 표현, 반복적인 괴롭힘과 집단 공격</li>
          <li>아동·청소년 성착취물, 불법 촬영물, 음란물 또는 폭력적인 유해정보</li>
          <li>자살·자해를 조장하거나 가정폭력과 범죄를 구체적으로 선동하는 내용</li>
          <li>저작권 등 제3자의 권리를 침해하는 게시물</li>
          <li>광고, 도배, 조작된 후기, 투표 조작, 자동화된 대량 접근</li>
          <li>해킹, 악성코드 배포, 서비스 구조의 무단 탐색과 장애 유발</li>
          <li>그 밖에 법령 또는 <Link href="/company/community-policy" className="font-bold text-[var(--plum)] underline">커뮤니티 운영정책</Link>을 위반하는 행위</li>
        </LegalBullets>
      </LegalSection>

      <LegalSection title="제8조 (운영과 이용 제한)">
        <LegalList>
          <li>운영자는 게시물의 맥락, 피해 가능성, 반복성, 긴급성을 고려해 노출 축소, 수정 요청, 삭제, 작성 제한, 일시 정지 또는 영구 정지를 할 수 있습니다.</li>
          <li>생명·신체에 급박한 위험이 있거나 불법 촬영물·아동 성착취물 등 중대한 위법 가능성이 있는 경우 사전 통지 없이 즉시 조치할 수 있습니다.</li>
          <li>운영에는 AI 기반 분류와 검토 보조가 사용될 수 있습니다. 중대한 제한에 이의가 있는 회원은 운영자에게 설명과 재검토를 요청할 수 있습니다.</li>
          <li>신고만으로 위반이 확정되지는 않으며, 판정 투표 결과도 법적·도덕적 책임을 확정하는 결정이 아닙니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제9조 (게시물의 권리와 이용 허락)">
        <LegalList>
          <li>회원이 작성한 게시물의 권리는 작성자에게 있습니다.</li>
          <li>회원은 게시물을 서비스 안에서 저장, 표시, 전송, 검색, 공유하고 운영·개선하는 데 필요한 범위에서 운영자에게 비독점적이고 무상인 이용 권한을 부여합니다.</li>
          <li>이 권한은 게시물이 서비스에 남아 있는 동안 유지됩니다. 삭제 후에도 백업 또는 법적 의무 이행을 위해 제한된 기간 동안 보관될 수 있습니다.</li>
          <li>운영자가 작성한 디자인, 로고, 문구와 소프트웨어를 허락 없이 복제하거나 상업적으로 이용할 수 없습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제10조 (페르소나 인증)">
        <LegalList>
          <li>인증 페르소나는 제공된 자료나 소셜 계정의 동의 항목이 특정 정보를 뒷받침한다는 뜻이며, 그 사람의 인격·전문성·게시물 정확성을 보증하지 않습니다.</li>
          <li>카카오가 동의받아 제공한 성별·연령대는 각각 인증 페르소나로 저장될 수 있습니다.</li>
          <li>위조 자료, 다른 사람의 정보 또는 오해를 유도하는 페르소나는 인증 취소와 이용 제한 대상이 됩니다.</li>
          <li>인증 여부에 따라 기본적인 커뮤니티 이용 권한을 차등하지 않습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제11조 (서비스 변경과 중단)">
        <LegalList>
          <li>운영자는 안정적인 제공을 위해 점검, 기능 변경 또는 일시 중단을 할 수 있습니다.</li>
          <li>서비스의 중요한 축소나 종료는 가능한 범위에서 미리 알립니다. 긴급 장애, 보안 사고, 재난 등 사전 안내가 어려운 경우에는 사후에 알릴 수 있습니다.</li>
          <li>무료로 제공되는 기능은 운영 여건에 따라 변경될 수 있습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제12조 (책임의 범위)">
        <LegalList>
          <li>서비스의 게시물, 댓글, 판정 투표와 미션 소감은 이용자의 경험과 의견이며 전문적인 의료·심리·법률 상담이 아닙니다.</li>
          <li>운영자는 이용자 사이의 관계, 오프라인 행동, 게시물의 정확성이나 특정 결과를 보증하지 않습니다.</li>
          <li>운영자의 고의 또는 중대한 과실이 없는 한 천재지변, 통신 장애, 제3자 서비스 장애와 이용자의 귀책사유로 생긴 손해에 책임을 지지 않습니다.</li>
          <li>이 조항은 관계 법령상 배제할 수 없는 운영자의 책임을 제한하지 않습니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제13조 (탈퇴와 계약 종료)">
        <LegalList>
          <li>회원은 언제든지 계정 삭제를 요청해 이용계약을 종료할 수 있습니다.</li>
          <li>운영자는 중대한 법령 위반, 타인에게 회복하기 어려운 피해를 주는 행위 또는 반복적인 정책 위반이 있는 경우 이용계약을 종료할 수 있습니다.</li>
          <li>개인정보와 게시물의 탈퇴 후 처리는 <Link href="/company/privacy" className="font-bold text-[var(--plum)] underline">개인정보처리방침</Link>에 따릅니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="제14조 (통지, 문의와 분쟁)">
        <LegalList>
          <li>개별 안내는 회원이 등록한 이메일 또는 서비스 화면으로 전달할 수 있습니다.</li>
          <li>문의, 게시물 삭제 요청과 이용 제한 이의신청은 {operator.email}로 접수합니다.</li>
          <li>이 약관은 대한민국 법률을 따르며, 분쟁이 발생하면 민사소송법상 관할 법원에서 해결합니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="부칙">
        <p>이 약관은 {legalEffectiveDate}부터 시행합니다.</p>
        <p className="text-sm text-[var(--ink-soft)]">
          운영자: {operator.businessName} · 대표 {operator.representative} · 사업자등록번호 {operator.businessNumber} · {operator.email}
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
