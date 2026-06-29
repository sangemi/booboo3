# booboo3 / 부부라이프

## 한 줄 정의

부부라이프는 결혼생활, 소통, 육아, 집안일, 데이트 이야기를 나누는 부부 커뮤니티다. `booboo2`의 Nuxt 2 + AdonisJS 4 서비스를 대체하는 최신 재구축 프로젝트다.

## 현재 스택

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS 4
- Prisma 7 + PostgreSQL
- Auth.js / NextAuth beta 계약: Google, Kakao
- 포트: 4610 예정

## 개발 명령

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

로컬 DB는 EC2 PostgreSQL SSH 터널을 기본으로 쓴다.

```bash
ssh -i /c/Dev/tool/keystore/SkAmazonSeoulPutty.pem -N -L 5432:127.0.0.1:5432 ec2-user@15.165.27.105
```

컨테이너 배포 환경의 `DATABASE_URL`은 `host.docker.internal:5432`를 사용하고, Docker 실행에는 `--add-host=host.docker.internal:host-gateway`가 필요하다.

## 기능 범위

- 커뮤니티 피드: 부부톡, 고민상담, 생활팁, 육아톡, 함께하는 시간, 익명편지
- 글쓰기, 댓글, 나도 그래요, 응원해요, 저장, 도움돼요 반응
- 오늘 우리 부부 온도 체크와 주간 평균
- 오늘의 부부 미션과 완료 상태
- 익명 편지함
- 회복 배지와 운영 큐
- Prisma 모델: 회원/OAuth, 글, 댓글, 반응, 온도, 미션, 편지, 배지, 신고/피드백

## 이관 원칙

- `code/booboo2`는 운영/참조용으로 보존한다.
- 기존 MySQL/Adonis 데이터를 직접 덮어쓰지 않는다.
- 먼저 category/post/comment/user/badge 매핑 스크립트를 만든 뒤 검증용 read-only export를 수행한다.
- 디자인은 `booboo2`를 계승하지 않고 최신 커뮤니티 제품으로 재설계한다.
