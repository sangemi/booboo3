"use client";

import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Lock,
  MessageCircle,
  Send,
  Smile,
  Sparkles,
  ThumbsDown,
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
  dailyMissionSelection,
  emptyVerdicts,
  Letter,
  letters,
  Mission,
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
  initialPosts?: CommunityPost[];
  initialLetters?: Letter[];
  initialMission?: Mission;
  initialCategory?: CategoryKey;
};

export function BoobooApp({
  initialPost,
  initialPosts,
  initialLetters,
  initialMission,
  initialCategory,
}: BoobooAppProps = {}) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [posts, setPosts] = useState<CommunityPost[]>(() =>
    initialPosts !== undefined
      ? initialPosts
      : initialPost
        ? [initialPost, ...seedPosts.filter((post) => post.id !== initialPost.id)]
        : seedPosts,
  );
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(
    initialCategory ?? "all",
  );
  const [query, setQuery] = useState("");
  const [todayMission, setTodayMission] = useState<Mission>(
    () => initialMission ?? dailyMissionSelection().mission,
  );
  const [missionOpen, setMissionOpen] = useState(false);
  const [missionReflectionDraft, setMissionReflectionDraft] = useState("");
  const [pendingMissionAction, setPendingMissionAction] = useState(false);
  const [communityLetters, setCommunityLetters] = useState(
    initialLetters !== undefined ? initialLetters : letters,
  );
  const [selectedPostId, setSelectedPostId] = useState(
    initialPost?.id ??
      initialPosts?.[0]?.id ??
      (initialPosts === undefined ? seedPosts[0]?.id : "") ??
      "",
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(Boolean(initialPost));
  const [composerOpen, setComposerOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    category: "talk" as Exclude<CategoryKey, "all">,
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentSubmitErrors, setCommentSubmitErrors] = useState<
    Record<string, string>
  >({});
  const [postAsMe, setPostAsMe] = useState(false);
  const [commentAsMe, setCommentAsMe] = useState(false);
  const [letterDraft, setLetterDraft] = useState("");
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [pendingLetterReaction, setPendingLetterReaction] = useState(false);
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

        if (!active || !payload.posts) return;
        const nextPosts =
          initialPost &&
          !payload.posts.some((post) => post.publicId === initialPost.publicId)
            ? [initialPost, ...payload.posts]
            : payload.posts;
        setPosts(nextPosts);
        const requestedPost = initialPost
          ? nextPosts.find((post) => post.publicId === initialPost.publicId)
          : undefined;
        setSelectedPostId(requestedPost?.id ?? nextPosts[0]?.id ?? "");
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
        if (!active || !payload.letters) return;
        setCommunityLetters(payload.letters);
      } catch {
        return;
      }
    }

    async function loadTodayMission() {
      try {
        const response = await fetch("/api/community/missions/today", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as { mission?: Mission };
        if (active && payload.mission) setTodayMission(payload.mission);
      } catch {
        return;
      }
    }

    loadPosts();
    loadLetters();
    loadTodayMission();

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
    filteredPosts.find((post) => post.id === selectedPostId) ?? filteredPosts[0];
  const selectedLetter = communityLetters.find(
    (letter) => letter.id === selectedLetterId,
  );
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

  useEffect(() => {
    if (!selectedLetterId) return;

    const originalOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedLetterId(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedLetterId]);

  useEffect(() => {
    if (!missionOpen) return;

    const originalOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMissionOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [missionOpen]);

  function selectPost(post: CommunityPost) {
    setSelectedPostId(post.id);
    setMobileDetailOpen(true);
  }

  function postHref(publicId: number) {
    const categoryQuery =
      activeCategory === "all" ? "" : `?category=${activeCategory}`;
    return `/talk/post/${publicId}${categoryQuery}`;
  }

  function homeHref(category: CategoryKey) {
    return category === "all" ? "/" : `/?category=${category}`;
  }

  function selectCategory(category: CategoryKey) {
    setActiveCategory(category);
    if (!initialPost) {
      router.replace(homeHref(category), { scroll: false });
    }
    if (category !== "all") {
      setNewPost((current) => ({ ...current, category }));
    }
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
    if (sessionStatus === "loading") return;
    if (!session?.user) {
      const callbackUrl = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    try {
      const response = await fetch(
        type === "saved"
          ? "/api/profile/scraps"
          : `/api/community/posts/${postId}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(type === "saved" ? { postId } : { type }),
        },
      );
      if (!response.ok) return;

      const payload = (await response.json()) as {
        reactions?: CommunityPost["reactions"];
        myReactions?: CommunityPost["myReactions"];
      };
      if (!payload.reactions || !payload.myReactions) return;

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                reactions: payload.reactions!,
                myReactions: payload.myReactions,
              }
            : post,
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
    if (!session?.user) {
      const callbackUrl = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}/verdicts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      if (!response.ok) return;

      const payload = (await response.json()) as {
        verdicts?: VerdictState;
        myVerdict?: keyof VerdictState;
      };
      if (!payload.verdicts || !payload.myVerdict) return;

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                verdicts: payload.verdicts!,
                myVerdict: payload.myVerdict,
              }
            : post,
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
    setCommentSubmitErrors((current) => ({ ...current, [postId]: "" }));

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
      // The error below keeps unsaved comments from looking published.
    }
    setCommentSubmitErrors((current) => ({
      ...current,
      [postId]:
        "댓글을 저장하지 못했습니다. 작성한 내용은 그대로 두었으니 다시 시도해 주세요.",
    }));
  }

  async function participateInMission() {
    if (pendingMissionAction || todayMission.participated) return;
    if (sessionStatus === "loading") return;
    if (!session?.user) {
      const callbackUrl = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    setPendingMissionAction(true);
    try {
      const response = await fetch(
        `/api/community/missions/${todayMission.id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      if (!response.ok) return;

      const payload = (await response.json()) as { mission?: Mission };
      if (payload.mission) setTodayMission(payload.mission);
    } catch {
      return;
    } finally {
      setPendingMissionAction(false);
    }
  }

  async function submitMissionReflection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = missionReflectionDraft.trim();
    if (!body || pendingMissionAction) return;
    if (sessionStatus === "loading") return;
    if (!session?.user) {
      const callbackUrl = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    setPendingMissionAction(true);
    try {
      const response = await fetch(
        `/api/community/missions/${todayMission.id}/reflections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        },
      );
      if (!response.ok) return;

      const payload = (await response.json()) as { mission?: Mission };
      if (!payload.mission) return;
      setTodayMission(payload.mission);
      setMissionReflectionDraft("");
    } catch {
      return;
    } finally {
      setPendingMissionAction(false);
    }
  }

  async function submitLetter() {
    const body = letterDraft.trim();
    if (!body) return;

    try {
      const response = await fetch("/api/community/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!response.ok) return;

      const payload = (await response.json()) as {
        letter?: (typeof letters)[number];
      };
      if (!payload.letter) return;

      setCommunityLetters((current) => [payload.letter!, ...current]);
      setLetterDraft("");
    } catch {
      return;
    }
  }

  async function reactToLetter(letterId: string, type: "up" | "down") {
    if (pendingLetterReaction) return;
    setPendingLetterReaction(true);

    try {
      const response = await fetch(
        `/api/community/letters/${letterId}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        },
      );
      if (!response.ok) return;

      const payload = (await response.json()) as {
        reaction?: Pick<Letter, "upvotes" | "downvotes" | "myReaction">;
      };
      if (!payload.reaction) return;

      setCommunityLetters((current) =>
        current.map((letter) =>
          letter.id === letterId ? { ...letter, ...payload.reaction } : letter,
        ),
      );
    } catch {
      return;
    } finally {
      setPendingLetterReaction(false);
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

          <nav className="flex gap-1 overflow-x-auto rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const active = activeCategory === category.key;

              return (
                <button
                  key={category.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectCategory(category.key)}
                  className={cn(
                    "h-10 shrink-0 rounded-[6px] px-3 text-sm font-bold transition sm:px-4",
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
              {filteredPosts.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-[var(--ink-soft)]">
                    {query.trim()
                      ? `"${query.trim()}"에 맞는 글을 찾지 못했습니다.`
                      : "이 게시판에는 아직 글이 없습니다."}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      query.trim() ? setQuery("") : setComposerOpen(true)
                    }
                    className="mt-3 text-sm font-bold text-[var(--plum)] hover:underline"
                  >
                    {query.trim() ? "검색어 지우기" : "첫 글 쓰기"}
                  </button>
                </div>
              ) : null}
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
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <VerifiedName
                    name={selectedPost.author}
                    verifiedCount={selectedPost.authorVerifiedPersonaCount ?? 0}
                    compact
                  />
                  <span className="text-xs text-[var(--ink-soft)]">
                    · {selectedPost.createdAt}
                  </span>
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

                <PostActions
                  post={selectedPost}
                  onReact={(type) => reactToPost(selectedPost.id, type)}
                />

                {selectedPost.category === "verdict" ? (
                  <VerdictPanel
                    post={selectedPost}
                    canVote={Boolean(session?.user)}
                    onVerdict={(choice) => voteVerdict(selectedPost.id, choice)}
                  />
                ) : null}

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
                    {selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((comment) => (
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
                      ))
                    ) : (
                      <p className="rounded-[8px] bg-[#fbf6f0] px-3 py-5 text-center text-sm text-[var(--ink-soft)]">
                        아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
                      </p>
                    )}
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
                    {commentSubmitErrors[selectedPost.id] ? (
                      <p role="alert" className="mt-2 text-xs text-[var(--coral)]">
                        {commentSubmitErrors[selectedPost.id]}
                      </p>
                    ) : null}
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
            <button
              type="button"
              aria-label={`오늘의 미션 보기: ${todayMission.title}`}
              onClick={() => setMissionOpen(true)}
              className="w-full rounded-[8px] border border-[var(--line)] bg-white p-3 text-left transition hover:border-[var(--leaf)] hover:bg-[#fbfdfb]"
            >
              <strong className="text-sm">{todayMission.title}</strong>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {todayMission.prompt}
              </p>
              <p className="mt-2 text-xs font-bold text-[var(--plum)]">
                {todayMission.difficulty} · {todayMission.completions}명 참여
              </p>
            </button>
          </section>

          <section className="rounded-[8px] border border-[var(--line)] bg-[#fff7dd] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">익명 편지함</h2>
              <Lock className="size-4 text-[#987000]" />
            </div>
            <p className="mb-3 text-xs leading-5 text-[#725d23]">
              작성한 편지는 이름 없이 공개됩니다.
            </p>
            <div className="space-y-3">
              {communityLetters.length === 0 ? (
                <p className="rounded-[8px] bg-white/72 px-3 py-6 text-center text-sm text-[#725d23]">
                  아직 공개된 편지가 없습니다.
                </p>
              ) : null}
              {communityLetters.map((letter) => (
                <button
                  key={letter.id}
                  type="button"
                  aria-label={`익명 편지 읽기: ${letter.body.slice(0, 30)}`}
                  onClick={() => setSelectedLetterId(letter.id)}
                  className="block w-full rounded-[8px] bg-white/72 p-3 text-left transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a84e]"
                >
                  <p
                    className={cn(
                      "line-clamp-4 whitespace-pre-line font-normal leading-6 text-[var(--ink-soft)]",
                      letterTextSize(letter, "list"),
                    )}
                  >
                    {letter.body}
                  </p>
                </button>
              ))}
            </div>
            <textarea
              value={letterDraft}
              onChange={(event) => setLetterDraft(event.target.value)}
              className="mt-3 min-h-20 w-full resize-none rounded-[8px] border border-[#ead18a] bg-white/80 p-3 text-sm outline-none focus:border-[#987000]"
              placeholder="이름 없이 나누고 싶은 말을 적어주세요"
            />
            <button
              onClick={submitLetter}
              disabled={!letterDraft.trim()}
              className="mt-2 h-10 w-full rounded-[8px] bg-[#7a5b00] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              편지 쓰기
            </button>
          </section>
        </aside>
      </section>

      {missionOpen ? (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-[rgba(44,41,38,0.5)] p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.currentTarget === event.target) setMissionOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mission-dialog-title"
            className="flex max-h-[min(86vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-[0_28px_80px_rgba(44,41,38,0.24)]"
          >
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--line)] px-4">
              <h2 id="mission-dialog-title" className="text-sm font-bold">
                오늘의 부부 미션
              </h2>
              <button
                type="button"
                aria-label="미션 닫기"
                onClick={() => setMissionOpen(false)}
                className="grid size-9 place-items-center rounded-[6px] text-[var(--ink-soft)] hover:bg-[#f4ebe3]"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="bg-[#fff9f3] px-5 py-6 md:px-7">
                <p className="text-xs font-bold text-[var(--plum)]">
                  AI가 고른 오늘의 미션
                </p>
                <h3 className="mt-2 font-serif text-2xl font-bold">
                  {todayMission.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  {todayMission.prompt}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[var(--ink-soft)]">
                    {todayMission.difficulty} · {todayMission.completions}명 참여
                  </span>
                  <button
                    type="button"
                    onClick={participateInMission}
                    disabled={
                      pendingMissionAction ||
                      todayMission.participated ||
                      sessionStatus === "loading"
                    }
                    className="h-10 rounded-[8px] bg-[var(--plum)] px-4 text-sm font-bold text-white disabled:cursor-default disabled:opacity-55"
                  >
                    {todayMission.participated ? "참여했어요" : "나도 참여"}
                  </button>
                </div>
              </div>

              <section className="px-5 py-5 md:px-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold">소감 나누기</h3>
                  <span className="text-xs text-[var(--ink-soft)]">
                    {todayMission.reflections.length}개
                  </span>
                </div>

                <div className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                  {todayMission.reflections.length > 0 ? (
                    todayMission.reflections.map((reflection) => (
                      <div key={reflection.id} className="py-3">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-xs">{reflection.author}</strong>
                          <span className="text-[11px] text-[var(--ink-soft)]">
                            {reflection.createdAt}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                          {reflection.body}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-sm text-[var(--ink-soft)]">
                      아직 나눈 소감이 없습니다.
                    </p>
                  )}
                </div>

                <form onSubmit={submitMissionReflection} className="mt-4">
                  <textarea
                    value={missionReflectionDraft}
                    onChange={(event) =>
                      setMissionReflectionDraft(event.target.value)
                    }
                    className="min-h-24 w-full resize-y rounded-[8px] border border-[var(--line)] p-3 text-sm leading-6 outline-none focus:border-[var(--plum)]"
                    placeholder="미션을 해본 소감을 적어주세요"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        !missionReflectionDraft.trim() || pendingMissionAction
                      }
                      className="h-10 rounded-[8px] bg-[var(--coral)] px-4 text-sm font-bold text-white disabled:opacity-45"
                    >
                      소감 나누기
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </section>
        </div>
      ) : null}

      {selectedPost && mobileDetailOpen ? (
        <section className="fixed inset-0 z-50 flex flex-col bg-[var(--background)] xl:hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--line)] bg-[rgba(255,250,246,0.94)] px-3 backdrop-blur">
            <button
              aria-label="글 닫기"
              onClick={() => router.push(homeHref(activeCategory))}
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
              commentError={commentSubmitErrors[selectedPost.id] ?? ""}
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

      {selectedLetter ? (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-[rgba(44,41,38,0.5)] p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.currentTarget === event.target) setSelectedLetterId(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-dialog-title"
            className="flex max-h-[min(78vh,640px)] w-full max-w-xl flex-col overflow-hidden rounded-[8px] border border-[#ead18a] bg-[#fffdf5] shadow-[0_28px_80px_rgba(44,41,38,0.24)]"
          >
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#ead18a] px-4">
              <h2 id="letter-dialog-title" className="text-sm font-bold text-[#5f4b16]">
                익명 편지
              </h2>
              <button
                type="button"
                aria-label="편지 닫기"
                onClick={() => setSelectedLetterId(null)}
                className="grid size-9 place-items-center rounded-[6px] text-[var(--ink-soft)] hover:bg-[#fff0b5]"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-7">
              <p
                className={cn(
                  "whitespace-pre-line font-normal leading-8 text-[var(--ink-soft)]",
                  letterTextSize(selectedLetter, "detail"),
                )}
              >
                {selectedLetter.body}
              </p>
            </div>

            <footer className="flex shrink-0 justify-center gap-2 border-t border-[#ead18a] bg-white/60 px-4 py-4">
              <LetterReactionButton
                label="공감"
                icon={ThumbsUp}
                value={selectedLetter.upvotes}
                selected={selectedLetter.myReaction === "up"}
                disabled={pendingLetterReaction}
                onClick={() => reactToLetter(selectedLetter.id, "up")}
              />
              <LetterReactionButton
                label="비공감"
                icon={ThumbsDown}
                value={selectedLetter.downvotes}
                selected={selectedLetter.myReaction === "down"}
                disabled={pendingLetterReaction}
                onClick={() => reactToLetter(selectedLetter.id, "down")}
              />
            </footer>
          </section>
        </div>
      ) : null}

      <SiteFooter />
    </main>
  );
}

function LetterReactionButton({
  icon: Icon,
  label,
  value,
  selected,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} ${value}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-[8px] border px-4 text-sm font-bold transition disabled:opacity-50",
        selected
          ? "border-[#7a5b00] bg-[#7a5b00] text-white"
          : "border-[#dac993] bg-white text-[#6d5a25] hover:border-[#9b8139]",
      )}
    >
      <Icon className="size-4" />
      <span>{value}</span>
    </button>
  );
}

function letterTextSize(letter: Letter, context: "list" | "detail") {
  if (letter.upvotes > letter.downvotes) {
    return context === "list" ? "text-base" : "text-lg";
  }
  if (letter.downvotes > letter.upvotes) {
    return context === "list" ? "text-xs" : "text-sm";
  }
  return context === "list" ? "text-sm" : "text-base";
}

function VerdictPanel({
  post,
  canVote,
  onVerdict,
}: {
  post: CommunityPost;
  canVote: boolean;
  onVerdict: (choice: keyof VerdictState) => void;
}) {
  const verdicts = post.verdicts ?? emptyVerdicts;
  const total = Object.values(verdicts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <section className="mt-5 rounded-[8px] border border-[var(--line)] bg-[#fbf6f0] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-extrabold">누가 더 잘못했나요?</h4>
        <span className="text-xs font-bold text-[var(--ink-soft)]">
          계정당 한 표 · 총 {total}표
        </span>
      </div>
      {!canVote ? (
        <p className="mt-2 text-xs text-[var(--ink-soft)]">
          투표하려면 로그인이 필요합니다.
        </p>
      ) : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {verdictOptions.map((option) => {
          const selected = post.myVerdict === option.key;

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onVerdict(option.key)}
              className={cn(
                "rounded-[8px] border bg-white p-3 text-left transition hover:border-[var(--plum)]",
                selected
                  ? "border-[var(--plum)] ring-2 ring-[rgba(111,61,91,0.12)]"
                  : "border-[var(--line)]",
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <strong className="text-sm">{option.label}</strong>
                <span className="font-serif text-xl font-bold">
                  {verdicts[option.key] ?? 0}
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
  );
}

function visibleCategoryForPost(
  category: Exclude<CategoryKey, "all">,
): Exclude<CategoryKey, "all"> {
  if (category === "verdict") return "verdict";
  if (category === "tips" || category === "together") return "tips";
  return "talk";
}

function MobilePostDetail({
  post,
  commentDraft,
  commentError,
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
  commentError: string;
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
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <VerifiedName
          name={post.author}
          verifiedCount={post.authorVerifiedPersonaCount ?? 0}
          compact
        />
        <span className="text-xs text-[var(--ink-soft)]">· {post.createdAt}</span>
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

      <PostActions post={post} onReact={onReact} />

      {post.category === "verdict" ? (
        <VerdictPanel
          post={post}
          canVote={canUseName}
          onVerdict={onVerdict}
        />
      ) : null}

      <div className="mt-6 border-t border-[var(--line)] pt-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold">댓글 {post.comments.length}</h4>
          <span className="text-xs text-[var(--ink-soft)]">
            따뜻한 댓글 바래요
          </span>
        </div>
        <div className="mt-3 space-y-3">
          {post.comments.length > 0 ? (
            post.comments.map((comment) => (
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
            ))
          ) : (
            <p className="rounded-[8px] bg-[#fbf6f0] px-3 py-5 text-center text-sm text-[var(--ink-soft)]">
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
            </p>
          )}
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
          {commentError ? (
            <p role="alert" className="mt-2 text-xs text-[var(--coral)]">
              {commentError}
            </p>
          ) : null}
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

function PostActions({
  post,
  onReact,
}: {
  post: CommunityPost;
  onReact: (type: keyof CommunityPost["reactions"]) => void;
}) {
  const bookmarked = post.myReactions?.saved ?? false;

  return (
    <div className="mt-5 flex items-stretch gap-2">
      <div className="grid min-w-0 flex-1 grid-cols-3 overflow-hidden rounded-[8px] border border-[var(--line)] bg-white">
        <ReactionButton
          icon={Heart}
          label="나도 그래요"
          value={post.reactions.meToo}
          selected={post.myReactions?.meToo ?? false}
          onClick={() => onReact("meToo")}
        />
        <ReactionButton
          icon={Smile}
          label="응원해요"
          value={post.reactions.hug}
          selected={post.myReactions?.hug ?? false}
          onClick={() => onReact("hug")}
        />
        <ReactionButton
          icon={ThumbsUp}
          label="도움돼요"
          value={post.reactions.helpful}
          selected={post.myReactions?.helpful ?? false}
          onClick={() => onReact("helpful")}
        />
      </div>
      <button
        type="button"
        aria-pressed={bookmarked}
        title={bookmarked ? "스크랩에서 삭제" : "내 스크랩에 저장"}
        onClick={() => onReact("saved")}
        className={cn(
          "flex w-[76px] shrink-0 flex-col items-center justify-center gap-1 rounded-[8px] border text-xs font-bold transition",
          bookmarked
            ? "border-[var(--plum)] bg-[#f4ebe3] text-[var(--plum)]"
            : "border-[var(--line)] bg-white text-[var(--ink-soft)] hover:border-[var(--plum)]",
        )}
      >
        <Bookmark className={cn("size-4", bookmarked ? "fill-current" : "")} />
        저장
      </button>
    </div>
  );
}

function ReactionButton({
  icon: Icon,
  label,
  value,
  selected,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-16 min-w-0 flex-col items-center justify-center gap-0.5 border-r border-[var(--line)] px-1 text-[11px] font-bold transition last:border-r-0",
        selected
          ? "bg-[#fff0eb] text-[var(--coral)]"
          : "text-[var(--ink-soft)] hover:bg-[#fff6f2] hover:text-[var(--foreground)]",
      )}
    >
      <Icon className="size-3.5 shrink-0 text-[var(--coral)]" />
      <span className="whitespace-nowrap leading-5">{label}</span>
      <span className="text-[11px] font-normal">{value}</span>
    </button>
  );
}
