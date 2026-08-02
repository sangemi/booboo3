import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/admin-session";
import { prisma } from "@/lib/db";

const deletePostsSchema = z.object({
  postIds: z.array(z.string().min(1)).min(1).max(100),
});

export async function DELETE(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return forbidden();

  const parsed = deletePostsSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "삭제할 게시글을 다시 선택해 주세요." },
      { status: 400 },
    );
  }

  const posts = await prisma.post.findMany({
    where: { id: { in: parsed.data.postIds } },
    select: { id: true, publicId: true, title: true },
  });

  if (posts.length === 0) {
    return NextResponse.json(
      { error: "삭제할 게시글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const deleted = await tx.post.deleteMany({
      where: { id: { in: posts.map((post) => post.id) } },
    });

    await tx.adminActionLog.create({
      data: {
        actorId: admin.id,
        action: "posts_bulk_delete",
        targetType: "post",
        metadata: {
          posts: posts.map((post) => ({
            id: post.id,
            publicId: post.publicId,
            title: post.title,
          })),
        },
      },
    });

    return deleted;
  });

  revalidatePath("/");
  revalidatePath("/admin/posts");

  return NextResponse.json({ deletedCount: result.count });
}

function forbidden() {
  return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
}
