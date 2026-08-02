"use client";

import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Lock,
  MessageCircle,
  Send,
  Smile,
  Sparkles,
  ThumbsUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { VerifiedName } from "@/components/booboo/verified-name";
import {
  categories,
  categoryLabels,
  CategoryKey,
  CommunityPost,
  emptyVerdicts,
  Letter,
  letters,
  missions,
  seedPosts,
  VerdictState,
} from "@/lib/community-data";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/booboo/site-footer";
import { SiteHeader } from "@/components/booboo/site-header";

const verdictOptions: Array<{
  key: keyof VerdictState;
  label: string;
  description: string;
}> = [
  { key: "husband", label: "남편 쪽", description: "남편의 책임이 더 커요" },
  { key: "wife", label: "아내 쪽", description: "아내의 책임이 더 커요" },
  { key: "both", label: "둘 다", description: "둘 다 돌아볼 부분이 있어요" },
  { key: "notEnough", label: "정보 부족", description: "이야기가 더 필요해요" },
];

type BoobooAppProps = {
  initialPost?: CommunityPost;
  initialCategory?: CategoryKey;
};

export function BoobooApp({ initialPost, initialCategory }: BoobooAppProps = {}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<CommunityPost[]>(() =>
    initialPost
      ? [initialPost, ...seedPosts.filter((post) => post.id !== initialPost.id)]
      : seedPosts,
  );
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(
    initialCategory ?? "all",
  );
  const [query, setQuery] = useState("");
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [communityLetters, setCommunityLetters] = useState(letters);
  const [selectedPostId, setSelectedPostId] = useState(
    initialPost?.id ?? seedPosts[0]?.id ?? "",
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(Boolean(initialPost));
  const [composerOpen, setComposerOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    category: "talk" as Exclude<CategoryKey, "all">,
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [postAsMe, setPostAsMe] = useState(false);
  const [commentAsMe, setCommentAsMe] = useState(false);
  const [letterDraft, setLetterDraft] = useState("");
  const [letterTone, setLetterTone] = useState<Letter["tone"] | null>(null);
  const [postSubmitError, setPostSubmitError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const response = await fetch("/api/community/posts", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          posts?: CommunityPost[];
          source?: "seed" | "database";
        };

        if (!active || !payload.posts?.length) return;
        setPosts(payload.posts);
        const requestedPost = initialPost
          ? payload.posts.find((post) => post.publicId === initialPost.publicId)
          : undefined;
        setSelectedPostId(requestedPost?.id ?? payload.posts[0].id);
      } catch {
        return;
      }
    }

    async function loadLetters() {
      try {
        const response = await fetch("/api/community/letters", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          letters?: typeof letters;
        };
        if (!active || !payload.letters?.length) return;
        setCommunityLetters(payload.letters);
      } catch {
        return;
      }
    }

    loadPosts();
    loadLetters();

    return () => {
      active = false;
    };
  }, [initialPost]);

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return posts.filter((post) => {
      const inCategory =
        activeCategory === "all" ||
        activeCategory === visibleCategoryForPost(post.category);
      const inQuery =
        normalized.length === 0 ||
        `${post.title} ${post.body} ${post.author} ${post.tags.join(" ")}`
          .toLowerCase()
          .includes(normalized);

      return inCategory && inQuery;
    });
  }, [activeCategory, posts, query]);

  const selectedPost =
    posts.find((post) => post.id === selectedPostId) ?? filteredPosts[0] ?? posts[0];
  const selectedPostIndex = selectedPost
    ? filteredPosts.findIndex((post) => post.id === selectedPost.id)
    : -1;
  const canGoPrevious = selectedPostIndex > 0;
  const canGoNext =
    selectedPostIndex >= 0 && selectedPostIndex < filteredPosts.length - 1;

  useEffect(() => {
    if (!mobileDetailOpen || !window.matchMedia("(max-width: 1279px)").matches) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileDetailOpen]);

  function selectPost(post: CommunityPost) {
    setSelectedPostId(post.id);
    setMobileDetailOpen(true);
  }

  function postHref(publicId: number) {
    const categoryQuery =
      activeCategory === "all" ? "" : `?category=${activeCategory}`;
    return `/talk/post/${publicId}${categoryQuery}`;
  }

  function moveSelectedPost(direction: -1 | 1) {
    if (selectedPostIndex < 0) return;

    const nextPost = filteredPosts[selectedPostIndex + direction];
    if (!nextPost) return;

    selectPost(nextPost);
    router.push(postHref(nextPost.publicId), { scroll: false });
  }

  async function reactToPost(
    postId: string,
    type: keyof CommunityPost["reactions"],
  ) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [type]: post.reactions[type] + 1,
              },
            }
          : post,
      ),
    );

    try {
      const response = await fetch(`/api/community/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) return;

      const payload = (await response.json()) as {
        reactions?: CommunityPost["reactions"];
      };
      if (!payload.reactions) return;

      setPosts((current) =>
        current.map((post) =>
          post.id === postId ? { ...post, reactions: payload.reactions! } : post,
        ),
      );
    } catch {
      return;
    }
  }

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPost.title.trim() || !newPost.body.trim()) return;
    setPostSubmitError("");

    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newPost.category,
          title: newPost.title,
          body: newPost.body,
          tags: ["새글"],
          isAnonymous: !postAsMe,
        }),
      });

      if (!response.ok) {
        setPostSubmitError("글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      const payload = (await response.json()) as { post?: CommunityPost };
      if (!payload.post) {
        setPostSubmitError("글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      setPosts((current) => [payload.post!, ...current]);
      setSelectedPostId(payload.post.id);
      router.push(postHref(payload.post.publicId), { scroll: false });
    } catch {
      setPostSubmitError("글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setNewPost({ title: "", body: "", category: "talk" });
    setPostAsMe(false);
    setComposerOpen(false);
  }

  async function voteVerdict(postId: string, choice: keyof VerdictState) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              verdicts: {
                ...(post.verdicts ?? emptyVerdicts),
                [choice]: (post.verdicts?.[choice] ?? 0) + 1,
              },
            }
          : post,
      ),
    );

    try {
      const response = await fetch(`/api/community/posts/${postId}/verdicts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      if (!response.ok) return;

      const payload = (await response.json()) as {
        verdicts?: VerdictState;
      };
      if (!payload.verdicts) return;

      setPosts((current) =>
        current.map((post) =>
          post.id === postId ? { ...post, verdicts: payload.verdicts! } : post,
        ),
      );
    } catch {
      return;
    }
  }

  async function submitComment(postId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = commentDrafts[postId]?.trim();
    if (!draft) return;

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: draft,
          tone: "support",
          isAnonymous: !commentAsMe,
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          comment?: CommunityPost["comments"][number];
        };
        if (payload.comment) {
          setPosts((current) =>
            current.map((post) =>
              post.id === postId
                ? { ...post, comments: [...post.comments, payload.comment!] }
                : post,
            ),
          );
          setCommentDrafts((current) => ({ ...current, [postId]: "" }));
          return;
        }
      }
    } catch {
      // Keep the optimistic local comment when the network write fails.
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: crypto.randomUUID(),
                  author:
                    commentAsMe && session?.user?.name
                      ? session.user.name
                      : "방문자",
                  authorVerifiedPersonaCount:
                    commentAsMe && session?.user
                      ? session.user.verifiedPersonaCount
                      : 0,
                  body: draft,
                  tone: "support",
                  createdAt: "방금 전",
                },
              ],
            }
          : post,
      ),
    );
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
  }

  function completeMission(id: string) {
    setCompletedMissions((current) =>
      current.includes(id)
        ? current.filter((missionId) => missionId !== id)
        : [...current, id],
    );

    fetch(`/api/community/missions/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => undefined);
  }

  async function submitLetter() {
    const body = letterDraft.trim();
    if (!body || !letterTone) return;

    const title = body.split(/\r?\n/)[0]?.slice(0, 44) || "차마 못 한 말";

    try {
      const response = await fetch("/api/community/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, tone: letterTone }),
      });
      if (!response.ok) return;

      const payload = (await response.json()) as {
        letter?: (typeof letters)[number];
      };
      if (!payload.letter) return;

      setCommunityLetters((current) => [payload.letter!, ...current]);
      setLetterDraft("");
      setLetterTone(null);
    } catch {
      return;
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteHeader
        active="community"
        query={query}
        onQueryChange={setQuery}
        onWriteClick={() => setComposerOpen((value) => !value)}
      />

      <section className="mx-auto grid w-full max-w-[1440px] gap-4 px-4 py-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 space-y-4">
          <div className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 md:px-5">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 md:text-base">
              <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#f4ebe3] px-2.5 py-1 text-[11px] font-bold text-[var(--plum)]">
                <Sparkles className="size-3.5" />
                목표
              </span>
              {" "}
              <span>
                행복한 부부는 더 배우고 나누고, 다투는 부부는 건강하게 싸우는
                연습을
              </span>
            </p>
          </div>

          <nav className="flex gap-1 overflow-x-auto rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-1">
            {categories.map((category) => {
              const active = activeCategory === category.key;

              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={cn(
                    "h-10 shrink-0 rounded-[6px] px-4 text-sm font-bold transition",
                    active
                      ? "bg-[var(--plum)] text-white"
                      : "text-[var(--ink-soft)] hover:bg-[#f7eee7] hover:text-[var(--foreground)]",
                  )}
                >
                  {category.label}
                </button>
              );
            })}
          </nav>

          {composerOpen ? (
            <form
              onSubmit={submitPost}
              className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-[0_14px_40px_rgba(75,54,38,0.08)]"
            >
              <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                <select
                  value={newPost.category}
                  onChange={(event) =>
                    setNewPost((current) => ({
                      ...current,
                      category: event.target.value as Exclude<CategoryKey, "all">,
                    }))
                  }
                  className="h-11 rounded-[8px] border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--plum)]"
                >
                  {categories
                    .filter((category) => category.key !== "all")
                    .map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                </select>
                <input
                  value={newPost.title}
                  onChange={(event) =>
                    setNewPost((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="h-11 rounded-[8px] border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--plum)]"
                  placeholder="무슨 이야기를 나눌까요?"
                />
              </div>
              <textarea
                value={newPost.body}
                onChange={(event) =>
                  setNewPost((current) => ({ ...current, body: event.target.value }))
                }
                className="mt-3 min-h-32 w-full resize-y rounded-[8px] border border-[var(--line)] p-3 text-sm leading-6 outline-none focus:border-[var(--plum)]"
                placeholder="상황, 마음, 원하는 피드백을 적어주세요."
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {session?.user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--ink-soft)]">
                      글쓴이
                    </span>
                    <div className="flex rounded-[8px] border border-[var(--line)] bg-[#faf7f4] p-0.5">
                      <button
                        type="button"
                        onClick={() => setPostAsMe(false)}
                        className={cn(
                          "h-8 rounded-[6px] px-3 text-xs",
                          !postAsMe
                            ? "bg-white font-bold text-[var(--plum)] shadow-sm"
                            : "text-[var(--ink-soft)]",
                        )}
                      >
                        익명
                      </button>
                      <button
                        type="button"
                        onClick={() => setPostAsMe(true)}
                        className={cn(
                          "h-8 rounded-[6px] px-3 text-xs",
                          postAsMe
                            ? "bg-white font-bold text-[var(--plum)] shadow-sm"
                            : "text-[var(--ink-soft)]",
                        )}
                      >
                        내 이름
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--ink-soft)]">익명으로 올라갑니다.</p>
                )}
                <button className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[var(--plum)] px-4 text-sm font-bold text-white">
                  <Send className="size-4" />
                  올리기
                </button>
              </div>
              {postSubmitError ? (
                <p role="status" className="mt-3 text-sm font-bold text-[var(--coral)]">
                  {postSubmitError}
                </p>
              ) : null}
            </form>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white">
              {filteredPosts.map((post) => {
                const selected = selectedPost?.id === post.id;

                return (
                  <Link
                    key={post.id}
                    href={postHref(post.publicId)}
                    onClick={() => selectPost(post)}
                    className={cn(
                      "block border-b border-[var(--line)] px-3 py-2.5 transition last:border-b-0 hover:bg-[#fbf6f0]",
                      selected ? "bg-[#fbf6f0]" : "bg-white",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-[6px] bg-[#f4ebe3] px-2 py-1 text-[11px] font-bold text-[var(--plum)]">
                          {categoryLabels[post.category]}
                        </span>
                        <span className="text-[11px] text-[var(--ink-soft)]">
                          {post.createdAt}
                        </span>
                        {post.pinned ? (
                          <span className="rounded-[6px] bg-[#fff4bf] px-2 py-1 text-[11px] font-bold text-[#7a5b00]">
                            주목
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold">
                        <span className="inline-flex items-center gap-1 text-[var(--coral)]">
                          <Heart className="size-3.5" />
                          {post.reactions.meToo}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[var(--leaf)]">
                          <MessageCircle className="size-3.5" />
                          {post.comments.length}
                        </span>
                      </div>
                    </div>
                    <h3
                      className={cn(
                        "mt-2 text-sm leading-snug md:text-base",
                        selected ? "font-extrabold" : "font-normal",
                      )}
                    >
                      {post.title}
                    </h3>
                  </Link>
                );
              })}
            </div>

            {selectedPost ? (
              <article className="hidden rounded-[8px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(75,54,38,0.08)] xl:sticky xl:top-4 xl:block xl:self-start">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-[6px] bg-[#f4ebe3] px-2 py-1 text-xs font-bold text-[var(--plum)]">
                    {categoryLabels[selectedPost.category]}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-3xl font-bold leading-tight">
                  {selectedPost.title}
                </h3>
                <div className="mt-3">
                  <VerifiedName
                    name={selectedPost.author}
                    verifiedCount={selectedPost.authorVerifiedPersonaCount ?? 0}
                    compact
                  />
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--ink-soft)]">
                  {selectedPost.body}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[6px] border border-[var(--line)] px-2 py-1 text-xs font-bold text-[var(--ink-soft)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <ReactionButton
                    icon={Heart}
                    label="나도 그래요"
                    value={selectedPost.reactions.meToo}
                    onClick={() => reactToPost(selectedPost.id, "meToo")}
                  />
                  <ReactionButton
                    icon={Smile}
                    label="응원해요"
                    value={selectedPost.reactions.hug}
                    onClick={() => reactToPost(selectedPost.id, "hug")}
                  />
                  <ReactionButton
                    icon={Bookmark}
                    label="저장"
                    value={selectedPost.reactions.saved}
                    onClick={() => reactToPost(selectedPost.id, "saved")}
                  />
                  <ReactionButton
                    icon={ThumbsUp}
                    label="도움돼요"
                    value={selectedPost.reactions.helpful}
                    onClick={() => reactToPost(selectedPost.id, "helpful")}
                  />
                </div>

                <section className="mt-5 rounded-[8px] border border-[var(--line)] bg-[#fbf6f0] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-extrabold">
                      누가 더 잘못했나요?
                    </h4>
                    <span className="text-xs font-bold text-[var(--ink-soft)]">
                      총{" "}
                      {Object.values(selectedPost.verdicts ?? emptyVerdicts).reduce(
                        (sum, count) => sum + count,
                        0,
                      )}
                      표
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {verdictOptions.map((option) => {
                      const value =
                        (selectedPost.verdicts ?? emptyVerdicts)[option.key] ?? 0;

                      return (
                        <button
                          key={option.key}
                          onClick={() => voteVerdict(selectedPost.id, option.key)}
                          className="rounded-[8px] border border-[var(--line)] bg-white p-3 text-left transition hover:border-[var(--plum)] hover:bg-white"
                        >
                          <span className="flex items-center justify-between gap-3">
                            <strong className="text-sm">{option.label}</strong>
                            <span className="font-serif text-xl font-bold">
                              {value}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--ink-soft)]">
                            {option.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <div className="mt-6 border-t border-[var(--line)] pt-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold">
                      댓글 {selectedPost.comments.length}
                    </h4>
                    <span className="text-xs text-[var(--ink-soft)]">
                      따뜻한 댓글 바래요
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {selectedPost.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-[8px] bg-[#fbf6f0] p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <VerifiedName
                            name={comment.author}
                            verifiedCount={
                              comment.authorVerifiedPersonaCount ?? 0
                            }
                            compact
                          />
                          <span className="text-xs text-[var(--ink-soft)]">
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                          {comment.body}
                        </p>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={(event) => submitComment(selectedPost.id, event)}
                    className="mt-3"
                  >
                    {session?.user ? (
                      <CommentIdentityControl
                        asMe={commentAsMe}
                        onChange={setCommentAsMe}
                      />
                    ) : null}
                    <div className="mt-2 flex gap-2">
                      <input
                        value={commentDrafts[selectedPost.id] ?? ""}
                        onChange={(event) =>
                          setCommentDrafts((current) => ({
                            ...current,
                            [selectedPost.id]: event.target.value,
                          }))
                        }
                        className="h-10 min-w-0 flex-1 rounded-[8px] border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--plum)]"
                        placeholder="따뜻한 댓글 남기기"
                      />
                      <button
                        aria-label="댓글 등록"
                        className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[var(--plum)] text-white"
                      >
                        <Send className="size-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <section className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">오늘의 부부 미션</h2>
              <Flame className="size-4 text-[var(--coral)]" />
            </div>
            <p className="mb-3 text-sm leading-6 text-[var(--ink-soft)]">
              하루에 하나만 해도 집 분위기가 조금 달라지는 행동을 모읍니다.
            </p>
            <div className="space-y-3">
              {missions.map((mission) => {
                const completed = completedMissions.includes(mission.id);
                return (
                  <button
                    key={mission.id}
                    onClick={() => completeMission(mission.id)}
                    className={cn(
                      "w-full rounded-[8px] border p-3 text-left transition",
                      completed
                        ? "border-[var(--leaf)] bg-[#eef7f1]"
                        : "border-[var(--line)] bg-white hover:border-[var(--leaf)]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-sm">{mission.title}</strong>
                      <span
                        className={cn(
                          "grid size-6 place-items-center rounded-full border",
                          completed
                            ? "border-[var(--leaf)] bg-[var(--leaf)] text-white"
                            : "border-[var(--line)] text-transparent",
                        )}
                      >
                        <Check className="size-3.5" />
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                      {mission.prompt}
                    </p>
                    <p className="mt-2 text-xs font-bold text-[var(--plum)]">
                      {mission.difficulty} · {mission.completions}쌍 참여
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--line)] bg-[#fff7dd] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">익명 편지함</h2>
              <Lock className="size-4 text-[#987000]" />
            </div>
            <div className="space-y-3">
              {communityLetters.map((letter) => (
                <div key={letter.id} className="rounded-[8px] bg-white/72 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{letter.title}</strong>
                    <span className="rounded-[6px] bg-[#fff0b5] px-2 py-1 text-xs font-bold text-[#7a5b00]">
                      {letter.tone}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    {letter.body}
                  </p>
                  <p className="mt-2 text-xs font-bold text-[var(--plum)]">
                    응답 {letter.replies}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-[8px] bg-white/72 p-1">
              {(["고마움", "미안함", "서운함"] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  aria-pressed={letterTone === tone}
                  onClick={() => setLetterTone(tone)}
                  className={cn(
                    "h-9 rounded-[6px] text-xs font-bold transition",
                    letterTone === tone
                      ? "bg-[#7a5b00] text-white"
                      : "text-[#7a5b00] hover:bg-[#fff0b5]",
                  )}
                >
                  {tone}
                </button>
              ))}
            </div>
            <textarea
              value={letterDraft}
              onChange={(event) => setLetterDraft(event.target.value)}
              className="mt-3 min-h-20 w-full resize-none rounded-[8px] border border-[#ead18a] bg-white/80 p-3 text-sm outline-none focus:border-[#987000]"
              placeholder="배우자에게 차마 못 한 말을 적어두기"
            />
            <button
              onClick={submitLetter}
              disabled={!letterDraft.trim() || !letterTone}
              className="mt-2 h-10 w-full rounded-[8px] bg-[#7a5b00] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              익명으로 접어두기
            </button>
          </section>
        </aside>
      </section>

      {selectedPost && mobileDetailOpen ? (
        <section className="fixed inset-0 z-50 flex flex-col bg-[var(--background)] xl:hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--line)] bg-[rgba(255,250,246,0.94)] px-3 backdrop-blur">
            <button
              aria-label="글 닫기"
              onClick={() => router.push("/")}
              className="grid size-10 place-items-center rounded-[8px] border border-[var(--line)] bg-white text-[var(--foreground)]"
            >
              <X className="size-5" />
            </button>
            <p className="text-sm font-extrabold">글 보기</p>
            <div className="flex items-center gap-1">
              <button
                aria-label="이전 글"
                disabled={!canGoPrevious}
                onClick={() => moveSelectedPost(-1)}
                className="grid size-10 place-items-center rounded-[8px] border border-[var(--line)] bg-white text-[var(--foreground)] disabled:opacity-32"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="다음 글"
                disabled={!canGoNext}
                onClick={() => moveSelectedPost(1)}
                className="grid size-10 place-items-center rounded-[8px] border border-[var(--line)] bg-white text-[var(--foreground)] disabled:opacity-32"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <MobilePostDetail
              post={selectedPost}
              commentDraft={commentDrafts[selectedPost.id] ?? ""}
              onCommentDraftChange={(value) =>
                setCommentDrafts((current) => ({
                  ...current,
                  [selectedPost.id]: value,
                }))
              }
              canUseName={Boolean(session?.user)}
              commentAsMe={commentAsMe}
              onCommentIdentityChange={setCommentAsMe}
              onSubmitComment={(event) => submitComment(selectedPost.id, event)}
              onReact={(type) => reactToPost(selectedPost.id, type)}
              onVerdict={(choice) => voteVerdict(selectedPost.id, choice)}
            />
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}

function visibleCategoryForPost(
  category: Exclude<CategoryKey, "all">,
): Exclude<CategoryKey, "all"> {
  if (category === "tips" || category === "together") return "tips";
  return "talk";
}

function MobilePostDetail({
  post,
  commentDraft,
  onCommentDraftChange,
  canUseName,
  commentAsMe,
  onCommentIdentityChange,
  onSubmitComment,
  onReact,
  onVerdict,
}: {
  post: CommunityPost;
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  canUseName: boolean;
  commentAsMe: boolean;
  onCommentIdentityChange: (value: boolean) => void;
  onSubmitComment: (event: FormEvent<HTMLFormElement>) => void;
  onReact: (type: keyof CommunityPost["reactions"]) => void;
  onVerdict: (choice: keyof VerdictState) => void;
}) {
  return (
    <article className="rounded-[8px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(75,54,38,0.08)]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-[6px] bg-[#f4ebe3] px-2 py-1 text-xs font-bold text-[var(--plum)]">
          {categoryLabels[post.category]}
        </span>
      </div>
      <h3 className="mt-4 font-serif text-3xl font-bold leading-tight">
        {post.title}
      </h3>
      <div className="mt-3">
        <VerifiedName
          name={post.author}
          verifiedCount={post.authorVerifiedPersonaCount ?? 0}
          compact
        />
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--ink-soft)]">
        {post.body}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[6px] border border-[var(--line)] px-2 py-1 text-xs font-bold text-[var(--ink-soft)]"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <ReactionButton
          icon={Heart}
          label="나도 그래요"
          value={post.reactions.meToo}
          onClick={() => onReact("meToo")}
        />
        <ReactionButton
          icon={Smile}
          label="응원해요"
          value={post.reactions.hug}
          onClick={() => onReact("hug")}
        />
        <ReactionButton
          icon={Bookmark}
          label="저장"
          value={post.reactions.saved}
          onClick={() => onReact("saved")}
        />
        <ReactionButton
          icon={ThumbsUp}
          label="도움돼요"
          value={post.reactions.helpful}
          onClick={() => onReact("helpful")}
        />
      </div>

      <section className="mt-5 rounded-[8px] border border-[var(--line)] bg-[#fbf6f0] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-extrabold">누가 더 잘못했나요?</h4>
          <span className="text-xs font-bold text-[var(--ink-soft)]">
            총{" "}
            {Object.values(post.verdicts ?? emptyVerdicts).reduce(
              (sum, count) => sum + count,
              0,
            )}
            표
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {verdictOptions.map((option) => {
            const value = (post.verdicts ?? emptyVerdicts)[option.key] ?? 0;

            return (
              <button
                key={option.key}
                onClick={() => onVerdict(option.key)}
                className="rounded-[8px] border border-[var(--line)] bg-white p-3 text-left transition hover:border-[var(--plum)] hover:bg-white"
              >
                <span className="flex items-center justify-between gap-3">
                  <strong className="text-sm">{option.label}</strong>
                  <span className="font-serif text-xl font-bold">{value}</span>
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--ink-soft)]">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-6 border-t border-[var(--line)] pt-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold">댓글 {post.comments.length}</h4>
          <span className="text-xs text-[var(--ink-soft)]">
            따뜻한 댓글 바래요
          </span>
        </div>
        <div className="mt-3 space-y-3">
          {post.comments.map((comment) => (
            <div key={comment.id} className="rounded-[8px] bg-[#fbf6f0] p-3">
              <div className="flex items-center justify-between gap-3">
                <VerifiedName
                  name={comment.author}
                  verifiedCount={comment.authorVerifiedPersonaCount ?? 0}
                  compact
                />
                <span className="text-xs text-[var(--ink-soft)]">
                  {comment.createdAt}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={onSubmitComment} className="mt-3">
          {canUseName ? (
            <CommentIdentityControl
              asMe={commentAsMe}
              onChange={onCommentIdentityChange}
            />
          ) : null}
          <div className="mt-2 flex gap-2">
            <input
              value={commentDraft}
              onChange={(event) => onCommentDraftChange(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-[8px] border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--plum)]"
              placeholder="따뜻한 댓글 남기기"
            />
            <button
              aria-label="댓글 등록"
              className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[var(--plum)] text-white"
            >
              <Send className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </article>
  );
}

function CommentIdentityControl({
  asMe,
  onChange,
}: {
  asMe: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-[var(--ink-soft)]">댓글 이름</span>
      <div className="flex rounded-[8px] border border-[var(--line)] bg-[#faf7f4] p-0.5">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "h-7 rounded-[6px] px-2.5 text-[11px]",
            !asMe
              ? "bg-white font-bold text-[var(--plum)] shadow-sm"
              : "text-[var(--ink-soft)]",
          )}
        >
          익명
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "h-7 rounded-[6px] px-2.5 text-[11px]",
            asMe
              ? "bg-white font-bold text-[var(--plum)] shadow-sm"
              : "text-[var(--ink-soft)]",
          )}
        >
          내 이름
        </button>
      </div>
    </div>
  );
}

function ReactionButton({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-12 items-center justify-between rounded-[8px] border border-[var(--line)] px-3 text-sm font-bold transition hover:border-[var(--coral)] hover:bg-[#fff6f2]"
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="size-4 text-[var(--coral)]" />
        {label}
      </span>
      <span>{value}</span>
    </button>
  );
}
