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
  title: "커뮤니티 운영정책",
  description: "부부라이프 게시물, 댓글, 신고와 이용 제한에 적용되는 운영 기준입니다.",
  alternates: { canonical: "https://booboolife.com/company/community-policy" },
};

export default function CommunityPolicyPage() {
  return (
    <LegalDocument
      active="community-policy"
      title="커뮤니티 운영정책"
      description="잘 사는 부부에게서 배우고, 다툼에서는 망신보다 배움을 남기기 위한 구체적인 게시 기준입니다."
      effectiveDate={legalEffectiveDate}
      version="1.0"
    >
      <LegalNotice>
        의견이 다르다는 이유만으로 게시물을 지우지 않습니다. 다만 사람을 공격하거나 안전을 해치는 방식의 표현은 내용의 주장과 별개로 제한할 수 있습니다.
      </LegalNotice>

      <LegalSection title="1. 운영 원칙">
        <LegalBullets>
          <li><strong>잘 사는 부부에게서 배우기:</strong> 평범한 일상, 고마움과 회복의 경험도 갈등 이야기만큼 존중합니다.</li>
          <li><strong>부부싸움에서도 배우기:</strong> “누가 더 잘못했나요?”의 목적은 망신주기가 아니라 다음 선택을 돌아보는 데 있습니다.</li>
          <li><strong>따뜻한 댓글 남기기:</strong> 비판할 때도 사람 전체를 단정하지 않고, 게시물에 드러난 행동과 상황을 중심으로 말합니다.</li>
          <li><strong>치우치지 않기:</strong> 성별, 직업, 소득, 가족 형태만으로 잘잘못이나 신뢰도를 정하지 않습니다.</li>
        </LegalBullets>
      </LegalSection>

      <LegalSection title="2. 게시판별 기준">
        <LegalTable
          headers={["공간", "올리기 좋은 내용", "추가 기준"]}
          rows={[
            ["부부톡", "결혼생활의 일상, 고민, 기쁨과 변화", "상대방을 특정할 수 있는 정보는 지웁니다."],
            ["남편 vs 아내", "구체적인 갈등 상황과 서로의 행동", "판정에 필요한 맥락을 적고, 여론으로 상대를 공격하지 않습니다."],
            ["생활팁", "집안일, 대화, 관계, 육아와 생활의 실용적인 방법", "광고·협찬·이해관계가 있으면 분명히 밝힙니다."],
            ["익명 편지", "말하지 못한 고마움, 미안함과 서운함", "개인을 찾아내거나 공격할 단서는 넣지 않습니다."],
            ["미션 소감", "오늘의 미션을 실천한 경험", "참여하지 않은 사람을 평가하거나 압박하지 않습니다."],
          ]}
        />
      </LegalSection>

      <LegalSection title="3. 공개할 수 없는 내용">
        <LegalBullets>
          <li><strong>개인정보:</strong> 이름, 얼굴, 연락처, 주소, 차량번호, 직장·학교처럼 제3자를 알아볼 수 있는 정보</li>
          <li><strong>괴롭힘:</strong> 모욕, 혐오, 외모 비하, 성적 수치심 유발, 반복적인 조롱과 따라다니기</li>
          <li><strong>위험한 내용:</strong> 가정폭력·성폭력·자살·자해·범죄를 선동하거나 구체적인 실행을 돕는 정보</li>
          <li><strong>성적 유해정보:</strong> 아동·청소년 성착취물, 불법 촬영물, 동의 없는 성적 이미지와 음란물</li>
          <li><strong>권리 침해:</strong> 허위 사실 유포, 명예훼손, 저작권·초상권 침해, 재판이나 수사에 부당한 영향을 줄 수 있는 정보</li>
          <li><strong>서비스 악용:</strong> 광고, 도배, 사기, 다단계, 계정 거래, 투표 조작, 제재 회피와 자동화된 대량 활동</li>
        </LegalBullets>
      </LegalSection>

      <LegalSection title="4. 부부 갈등을 쓸 때">
        <LegalList>
          <li>배우자의 실명과 사진을 올리지 않고, 직장·지역·가족관계 등 여러 단서를 조합해 특정되지 않게 합니다.</li>
          <li>상대방의 의료 정보, 성생활, 범죄 피해와 같은 민감한 사생활은 조언에 꼭 필요한 범위보다 자세히 공개하지 않습니다.</li>
          <li>자녀가 관련된 경우 자녀의 얼굴, 학교, 이름, 건강 정보와 당사자가 커서 원치 않을 기록을 남기지 않습니다.</li>
          <li>판정 결과를 배우자에게 압박 수단으로 제시하거나 외부 집단 공격을 요청해서는 안 됩니다.</li>
          <li>폭력이나 즉각적인 위험이 있는 상황은 커뮤니티 판정보다 경찰 112, 여성긴급전화 1366 등 전문 지원을 먼저 이용합니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. 조치 기준">
        <LegalTable
          headers={["단계", "적용 예", "가능한 조치"]}
          rows={[
            ["안내", "맥락 부족, 가벼운 표현 문제, 게시판 선택 오류", "표현 수정 요청, 게시판 이동, 댓글 안내"],
            ["제한", "개인정보 노출, 반복 비난, 광고·도배", "노출 축소, 일부 가림, 삭제, 일정 기간 작성 제한"],
            ["긴급 제한", "협박, 불법 촬영물, 아동 성착취물, 구체적인 위해 예고", "즉시 삭제, 계정 정지, 필요한 경우 관계 기관 협조"],
            ["영구 제한", "중대한 위반 또는 제재 회피가 반복되는 경우", "계정과 접속의 영구 제한"],
          ]}
        />
        <p className="text-sm text-[var(--ink-soft)]">
          조치는 피해 가능성, 공개 범위, 반복성, 고의성, 수정 여부를 함께 고려합니다.
        </p>
      </LegalSection>

      <LegalSection title="6. AI 운영과 사람의 재검토">
        <LegalList>
          <li>AI는 신고 분류, 유해 가능성 탐지, 중복 게시물 확인과 운영 판단 정리를 보조할 수 있습니다.</li>
          <li>AI의 결과만으로 이용자의 인격이나 부부관계를 단정하지 않습니다.</li>
          <li>계정 정지처럼 이용에 중대한 영향을 주는 조치에는 설명을 요청하고 사람의 재검토를 받을 수 있습니다.</li>
          <li>AI가 놓친 맥락이나 잘못 판단한 표현은 이의신청 과정에서 다시 확인합니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="7. 신고, 삭제 요청과 이의신청">
        <LegalList>
          <li>신고할 때는 게시물 주소, 문제되는 부분과 요청 이유를 함께 보내 주세요.</li>
          <li>본인 또는 가족의 개인정보가 노출된 긴급 삭제 요청은 제목에 “긴급 삭제”를 표시해 {operator.email}로 접수할 수 있습니다.</li>
          <li>이용 제한에 이의가 있으면 통지를 받은 날부터 30일 안에 같은 이메일로 재검토를 요청할 수 있습니다.</li>
          <li>신고자의 신원은 원칙적으로 신고 대상에게 공개하지 않습니다. 다만 법령이나 적법한 절차에 따른 요구가 있으면 예외가 될 수 있습니다.</li>
        </LegalList>
      </LegalSection>
    </LegalDocument>
  );
}
