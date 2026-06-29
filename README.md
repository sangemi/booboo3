# booboo3

부부라이프 3 커뮤니티 프로젝트입니다.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma 7
- PostgreSQL
- NextAuth/Auth.js

## Local Development

```bash
pnpm install
pnpm prisma:generate
pnpm dev -p 4610
```

The local app runs at:

```text
http://localhost:4610
```

## Features

- DB-backed community posts, comments, reactions, and temperature checks
- AI operations room at `/ai-operations`
- User operation proposals persisted to PostgreSQL
- Seed data for local community testing

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm build
```
