import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminEmail } from "@/lib/admin-access";
import { getAdminUser } from "@/lib/admin-session";
import { prisma } from "@/lib/db";

const actionSchema = z.object({
  action: z.enum(["delete", "delete_and_suspend"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "처리할 작업을 다시 선택해 주세요." }, { status: 400 });
  }

  const { postId } = await params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      publicId: true,
      title: true,
      body: true,
      authorId: true,
      author: { select: { email: true, role: true } },
    },
  });
  if (!post) {
    return NextResponse.json({ error: "이미 삭제된 글입니다." }, { status: 404 });
  }
  if (parsed.data.action === "delete_and_suspend") {
    if (!post.authorId) {
      return NextResponse.json({ error: "비회원 글에는 정지할 계정이 없습니다. 글만 삭제해 주세요." }, { status: 409 });
    }
    if (isAdminEmail(post.author?.email) || post.author?.role === "ADMIN") {
      return NextResponse.json({ error: "관리자 계정은 이 화면에서 정지할 수 없습니다." }, { status: 403 });
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const deleted = await tx.post.deleteMany({ where: { id: post.id } });
    if (deleted.count === 0) return false;

    if (parsed.data.action === "delete_and_suspend" && post.authorId) {
      const suspended = await tx.user.updateMany({
        where: { id: post.authorId, role: { not: "ADMIN" } },
        data: { role: "SUSPENDED" },
      });
      if (suspended.count !== 1) throw new Error("Member cannot be suspended");
    }

    await tx.adminActionLog.create({
      data: {
        actorId: admin.id,
        action: parsed.data.action === "delete" ? "post_delete" : "post_delete_and_suspend",
        targetType: "post",
        targetId: post.id,
        metadata: {
          publicId: post.publicId,
          title: post.title,
          body: post.body,
          authorId: post.authorId,
        },
      },
    });
    return true;
  });

  if (!result) {
    return NextResponse.json({ error: "이미 삭제된 글입니다." }, { status: 404 });
  }
  revalidatePath("/");
  revalidatePath(`/talk/post/${post.publicId}`);
  revalidatePath("/admin/posts");
  revalidatePath("/admin/users");
  return NextResponse.json({ ok: true });
}
