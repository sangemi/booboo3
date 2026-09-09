import "dotenv/config";

import { prisma } from "../src/lib/db";

type EditorialRecord =
  | {
      kind: "글";
      author: string;
      title: string;
      body: string;
      publicId: number;
      createdAt: Date;
    }
  | {
      kind: "댓글";
      author: string;
      title: string;
      body: string;
      publicId: number;
      createdAt: Date;
    };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

async function findEditorialRecord(id: string): Promise<EditorialRecord | null> {
  const post = await prisma.post.findUnique({ where: { id } });
  if (post) {
    return {
      kind: "글",
      author: post.authorName,
      title: post.title,
      body: post.body,
      publicId: post.publicId,
      createdAt: post.createdAt,
    };
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { post: { select: { title: true, publicId: true } } },
  });
  if (!comment) return null;

  return {
    kind: "댓글",
    author: comment.authorName,
    title: comment.post.title,
    body: comment.body,
    publicId: comment.post.publicId,
    createdAt: comment.createdAt,
  };
}

function formatKoreanDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function emailHtml(record: EditorialRecord, publicUrl: string) {
  const body = escapeHtml(record.body).replace(/\n/g, "<br>");

  return `<!doctype html>
<html lang="ko"><body style="margin:0;background:#f7f3f0;color:#2d2926;font-family:Arial,'Noto Sans KR',sans-serif;word-break:keep-all;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 14px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #e7ddd7;">
      <tr><td style="padding:30px 32px 12px;">
        <p style="margin:0 0 8px;color:#8f617b;font-size:12px;font-weight:700;">BOOBOO LIFE</p>
        <h1 style="margin:0;font-size:22px;line-height:1.45;">오늘의 ${record.kind}이 공개되었습니다.</h1>
      </td></tr>
      <tr><td style="padding:12px 32px;font-size:14px;line-height:1.8;color:#6a625e;">
        ${escapeHtml(record.author)} · ${escapeHtml(formatKoreanDate(record.createdAt))}
      </td></tr>
      <tr><td style="padding:10px 32px 24px;">
        <div style="padding:20px;background:#faf8f6;border-left:3px solid #97607f;">
          <h2 style="margin:0 0 12px;font-size:18px;line-height:1.5;">${escapeHtml(record.title)}</h2>
          <div style="font-size:14px;line-height:1.8;">${body}</div>
        </div>
      </td></tr>
      <tr><td style="padding:0 32px 32px;">
        <a href="${publicUrl}" target="_blank" style="display:inline-block;padding:12px 16px;background:#7b3f65;color:#fff;text-decoration:none;font-size:14px;font-weight:700;">공개 페이지 확인</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

async function main() {
  const recordId = process.argv[2]?.trim();
  if (!recordId) throw new Error("게시글 또는 댓글의 내부 ID가 필요합니다.");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.EDITORIAL_EMAIL_TO ?? "sangemi@daum.net";
  if (!apiKey) throw new Error("RESEND_API_KEY가 설정되지 않았습니다.");
  if (!from) throw new Error("RESEND_FROM_EMAIL이 설정되지 않았습니다.");

  const record = await findEditorialRecord(recordId);
  if (!record) throw new Error(`운영 콘텐츠를 찾지 못했습니다: ${recordId}`);

  const publicUrl = `https://booboolife.com/talk/post/${record.publicId}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `booboolife-editorial-${recordId}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `[부부라이프 AI 운영] ${formatKoreanDate(record.createdAt)} 오늘의 ${record.kind}`,
      html: emailHtml(record, publicUrl),
    }),
  });
  const result = await response.json().catch(() => null) as
    | { id?: string; message?: string }
    | null;

  if (!response.ok) {
    throw new Error(result?.message ?? `Resend 발송 실패 (${response.status})`);
  }

  console.log(JSON.stringify({ ok: true, id: result?.id ?? null, to, publicUrl }));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "메일 발송 실패");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
