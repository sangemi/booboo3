import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateCommentPersonasSchema } from "@/lib/community-schema";
import {
  CommentNotFoundError,
  CommentPermissionError,
  InvalidCommentPersonaError,
  updateCommunityCommentPersonas,
} from "@/lib/community-service";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ commentId: string }> },
) {
  const session = await auth();
  const { commentId } = await context.params;
  const parsed = updateCommentPersonasSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "선택한 정보를 확인해 주세요." }, { status: 400 });
  }
  try {
    const comment = await updateCommunityCommentPersonas({
      commentId,
      personaDisclosures: parsed.data.personaDisclosures,
      userId: session?.user?.id,
      anonKey: request.cookies.get("booboo_anon_id")?.value,
    });
    return NextResponse.json({ comment, source: "database" });
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    if (error instanceof CommentPermissionError) {
      return NextResponse.json({ error: "내 댓글에서만 정보를 변경할 수 있습니다." }, { status: 403 });
    }
    if (error instanceof InvalidCommentPersonaError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to update comment personas", error);
    return NextResponse.json({ error: "정보를 저장하지 못했습니다. 다시 시도해 주세요." }, { status: 503 });
  }
}
