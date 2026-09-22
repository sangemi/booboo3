import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), email: z.string().trim().email().max(254), password: z.string().min(1).max(72) }),
  z.object({ action: z.literal("verify"), email: z.string().trim().email().max(254), token: z.string().regex(/^[a-f0-9]{64}$/) }),
]);
const lifetime = 30 * 60 * 1000;

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "입력한 정보를 확인해 주세요." }, { status: 400 });
  const input = parsed.data;
  const email = input.email.toLowerCase();
  const identifier = `email-verification:${email}`;
  try {
    if (input.action === "verify") {
      const token = createHash("sha256").update(input.token).digest("hex");
      const verified = await prisma.$transaction(async (tx) => {
        const consumed = await tx.verificationToken.deleteMany({ where: { identifier, token, expires: { gt: new Date() } } });
        if (consumed.count !== 1) return false;
        const updated = await tx.user.updateMany({ where: { email, role: { not: "SUSPENDED" } }, data: { emailVerified: new Date() } });
        return updated.count === 1;
      });
      return verified
        ? NextResponse.json({ ok: true })
        : NextResponse.json({ error: "인증 링크가 만료되었거나 이미 사용되었습니다. 다시 발송해 주세요." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || user.role === "SUSPENDED" || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return NextResponse.json({ error: "이메일 또는 비밀번호를 확인해 주세요." }, { status: 400 });
    }
    if (user.emailVerified) return NextResponse.json({ error: "이미 인증된 이메일입니다. 로그인해 주세요." }, { status: 400 });
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) return NextResponse.json({ error: "메일을 보낼 수 없습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });

    const rawToken = randomBytes(32).toString("hex");
    const token = createHash("sha256").update(rawToken).digest("hex");
    const accepted = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${identifier}))`;
      const recent = await tx.verificationToken.findFirst({ where: { identifier, expires: { gt: new Date(Date.now() + lifetime - 60_000) } } });
      if (recent) return false;
      await tx.verificationToken.deleteMany({ where: { identifier } });
      await tx.verificationToken.create({ data: { identifier, token, expires: new Date(Date.now() + lifetime) } });
      return true;
    });
    if (!accepted) return NextResponse.json({ error: "1분 뒤 다시 발송할 수 있습니다." }, { status: 429 });
    const url = new URL("/login", process.env.AUTH_URL || "https://booboolife.com");
    url.searchParams.set("verification", rawToken);
    url.searchParams.set("email", email);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject: "[부부라이프] 이메일을 인증해 주세요", text: `아래 링크에서 이메일 인증을 완료해 주세요. 링크는 30분 동안 유효합니다.\n\n${url.toString()}\n\n요청하지 않았다면 이 메일을 무시해 주세요.` }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return NextResponse.json({ error: "메일 발송에 실패했습니다. 1분 뒤 다시 시도해 주세요." }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "인증을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
