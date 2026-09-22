import { isAdminEmail } from "./admin-access";

type Activity = {
  id: string;
  authorName: string;
  author: { id: string; email: string | null; role: string } | null;
};

const editorialNames = new Set(["운영자A", "운영자I", "부부라이프 AI 운영자"]);

export function participationSource(activity: Activity) {
  if (activity.id.startsWith("booboolife-ai-") || editorialNames.has(activity.authorName)) return "excluded";
  if (!activity.author) return "unidentified";
  const email = activity.author.email?.trim().toLowerCase();
  if (activity.author.role !== "MEMBER" || isAdminEmail(email) || email === "help@lawfirmy.com") return "excluded";
  return "member";
}

export function summarizeParticipation(posts: Activity[], comments: Activity[]) {
  const memberPosts = posts.filter((post) => participationSource(post) === "member");
  const memberComments = comments.filter((comment) => participationSource(comment) === "member");
  return {
    posts: memberPosts.length,
    comments: memberComments.length,
    members: new Set([...memberPosts, ...memberComments].map((activity) => activity.author!.id)).size,
    unidentified: [...posts, ...comments].filter((activity) => participationSource(activity) === "unidentified").length,
  };
}
