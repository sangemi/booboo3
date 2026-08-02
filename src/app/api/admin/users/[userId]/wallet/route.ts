import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/admin-session";
import { prisma } from "@/lib/db";

const grantSchema = z.object({
  asset: z.enum(["CASH", "POINT"]),
  amount: z.number().int().min(1).max(10_000_000),
  reason: z.string().trim().min(2).max(200),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return forbidden();

  const parsed = grantSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "지급할 재화, 수량과 사유를 확인해 주세요." },
      { status: 400 },
    );
  }

  const { userId } = await params;
  const { asset, amount, reason } = parsed.data;
  const result = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, cashBalance: true, pointBalance: true },
    });

    if (!target) return null;

    const updated = await tx.user.update({
      where: { id: userId },
      data:
        asset === "CASH"
          ? { cashBalance: { increment: amount } }
          : { pointBalance: { increment: amount } },
      select: { cashBalance: true, pointBalance: true },
    });
    const balanceAfter =
      asset === "CASH" ? updated.cashBalance : updated.pointBalance;

    const transaction = await tx.walletTransaction.create({
      data: {
        userId,
        actorId: admin.id,
        asset,
        type: "ADMIN_GRANT",
        amount,
        balanceAfter,
        reason,
      },
      select: { id: true, createdAt: true },
    });

    await tx.adminActionLog.create({
      data: {
        actorId: admin.id,
        action: asset === "CASH" ? "cash_grant" : "point_grant",
        targetType: "user",
        targetId: userId,
        metadata: {
          amount,
          balanceAfter,
          reason,
          targetEmail: target.email,
        },
      },
    });

    return { ...updated, transaction };
  });

  if (!result) {
    return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(result);
}

function forbidden() {
  return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
}
