import "server-only";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-access";

export async function getAdminUser() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !isAdminEmail(user.email)) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: user.name ?? "관리자",
  };
}
