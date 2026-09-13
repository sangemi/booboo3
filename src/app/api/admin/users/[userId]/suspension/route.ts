import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminUser } from "@/lib/admin-session";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });

  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
  if (user.role !== "SUSPENDED") {
    return NextResponse.json({ error: "정지된 계정이 아닙니다." }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { role: "MEMBER" } });
    await tx.adminActionLog.create({
      data: {
        actorId: admin.id,
        action: "member_resume",
        targetType: "user",
        targetId: userId,
      },
    });
  });
  revalidatePath("/admin/users");
  return NextResponse.json({ ok: true });
}
