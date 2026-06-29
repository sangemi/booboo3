"use client";

import {
  Baby,
  Bookmark,
  Check,
  Coffee,
  Flame,
  Heart,
  HeartHandshake,
  Home,
  Lock,
  MessageCircle,
  PenLine,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Thermometer,
  ThumbsUp,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  badges,
  categories,
  CategoryKey,
  CommunityPost,
  letters,
  missions,
  seedPosts,
  temperatureTrend,
} from "@/lib/community-data";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/booboo/site-footer";

const categoryIcons: Record<CategoryKey, React.ComponentType<{ className?: string }>> = {
  all: Home,
  talk: MessageCircle,
  worry: HeartHandshake,
  tips: Sparkles,
  parenting: Baby,
  together: Coffee,
  letters: PenLine,
};

const moodLabels = {
  warm: "따뜻함",
  tired: "지침",
  "need-talk": "대화 필요",
  thankful: "고마움",
};

export function BoobooApp() {
  const [posts, setPosts] = useState<CommunityPost[]>(seedPosts);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");
  const [temperature, setTemperature] = useState(72);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [selectedPostId, setSelectedPostId] = useState(seedPosts[0]?.id ?? "");
  const [composerOpen, setComposerOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    category: "talk" as Exclude<CategoryKey, "all">,
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [letterDraft, setLetterDraft] = useState("");
  const [dataSource, setDataSource] = useState<"seed" | "database" | "local">(
    "seed",
  );
  const [savingTemperature, setSavingTemperature] = useState(false);

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
        setSelectedPostId(payload.posts[0].id);
        setDataSource(payload.source ?? "database");
      } catch {
        setDataSource("local");
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return posts.filter((post) => {
      const inCategory =
        activeCategory === "all" || activeCategory === post.category;
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

  const weeklyAverage = Math.round(
    temperatureTrend.reduce((sum, item) => sum + item.score, 0) /
      temperatureTrend.length,
  );

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
      setDataSource("database");
    } catch {
      setDataSource("local");
    }
  }

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPost.title.trim() || !newPost.body.trim()) return;

    const post: CommunityPost = {
      id: crypto.randomUUID(),
      category: newPost.category,
      title: newPost.title.trim(),
      body: newPost.body.trim(),
      author: "익명의 부부",
      coupleStage: "새 이야기",
      mood: temperature >= 75 ? "warm" : temperature >= 55 ? "need-talk" : "tired",
      temperature,
      createdAt: "방금 전",
      readMinutes: Math.max(1, Math.ceil(newPost.body.length / 180)),
      comments: [],
      reactions: { meToo: 0, hug: 0, saved: 0, helpful: 0 },
      tags: ["새글"],
      pinned: false,
    };

    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newPost.category,
          title: newPost.title,
          body: newPost.body,
          temperature,
          tags: ["새글"],
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { post?: CommunityPost };
        if (payload.post) {
          setPosts((current) => [payload.post!, ...current]);
          setSelectedPostId(payload.post.id);
          setDataSource("database");
        }
      } else {
        setPosts((current) => [post, ...current]);
        setSelectedPostId(post.id);
        setDataSource("local");
      }
    } catch {
      setPosts((current) => [post, ...current]);
      setSelectedPostId(post.id);
      setDataSource("local");
    }

    setNewPost({ title: "", body: "", category: "talk" });
    setComposerOpen(false);
  }

  async function submitComment(postId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = commentDrafts[postId]?.trim();
    if (!draft) return;

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft, tone: "support" }),
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
          setDataSource("database");
          return;
        }
      }
    } catch {
      setDataSource("local");
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
                  author: "방문자",
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

  async function saveTemperature() {
    setSavingTemperature(true);
    try {
      const response = await fetch("/api/community/temperature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: temperature }),
      });
      setDataSource(response.ok ? "database" : "local");
    } catch {
      setDataSource("local");
    } finally {
      setSavingTemperature(false);
    }
  }

  function completeMission(id: string) {
    setCompletedMissions((current) =>
      current.includes(id)
        ? current.filter((missionId) => missionId !== id)
        : [...current, id],
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--line)] bg-[rgba(255,250,246,0.86)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-[8px] bg-[var(--plum)] text-white">
              <Heart className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--leaf)]">
                Booboo Life
              </p>
              <h1 className="font-serif text-2xl font-bold leading-tight">
                부부라이프
              </h1>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 lg:max-w-2xl lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--ink-soft)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded-[8px] border border-[var(--line)] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--plum)] focus:ring-4 focus:ring-[rgba(111,61,91,0.12)]"
                placeholder="퇴근, 집안일, 기념일, 사과..."
              />
            </label>
            <button
              onClick={() => setComposerOpen((value) => !value)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--coral)] px-4 text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,111,97,0.22)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[rgba(255,111,97,0.24)]"
            >
              <Plus className="size-4" />
              글쓰기
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1440px] gap-4 px-4 py-5 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)_360px]">
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <nav className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-2">
            {categories.map((category) => {
              const Icon = categoryIcons[category.key];
              const active = activeCategory === category.key;

              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[6px] px-3 py-3 text-left transition",
                    active
                      ? "bg-[var(--plum)] text-white"
                      : "text-[var(--foreground)] hover:bg-[#f7eee7]",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{category.label}</span>
                    <span
                      className={cn(
                        "block truncate text-xs",
                        active ? "text-white/72" : "text-[var(--ink-soft)]",
                      )}
                    >
                      {category.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="rounded-[8px] border border-[var(--line)] bg-[#263f37] p-4 text-white">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold">오늘 우리 온도</p>
              <Thermometer className="size-4 text-[#f7c948]" />
            </div>
            <div className="font-serif text-5xl font-bold">{temperature}</div>
            <input
              value={temperature}
              min={1}
              max={100}
              onChange={(event) => setTemperature(Number(event.target.value))}
              className="mt-5 w-full accent-[#f7c948]"
              type="range"
            />
            <p className="mt-3 text-sm leading-6 text-white/74">
              낮은 날은 조언보다 공감이 먼저 보이도록 피드가 조정됩니다.
            </p>
            <button
              onClick={saveTemperature}
              className="mt-4 h-10 w-full rounded-[8px] bg-white/12 text-sm font-bold text-white transition hover:bg-white/18"
            >
              {savingTemperature ? "저장 중" : "온도 저장"}
            </button>
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--paper)]">
            <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
              <div className="p-5 md:p-7">
                <p className="mb-3 inline-flex items-center gap-2 rounded-[6px] bg-[#f4ebe3] px-3 py-1 text-xs font-bold text-[var(--plum)]">
                  <Sparkles className="size-3.5" />
                  오늘의 커뮤니티
                </p>
                <h2 className="max-w-2xl font-serif text-4xl font-bold leading-tight md:text-5xl">
                  비난을 줄이고, 회복을 남기는 부부 대화장
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                  글마다 온도, 감정, 댓글 톤을 함께 기록합니다. 답을 강요하는
                  상담소가 아니라, 비슷한 하루를 사는 부부들이 자기 속도로
                  회복하는 커뮤니티입니다.
                </p>
              </div>
              <div className="border-t border-[var(--line)] bg-[#f7eee7] p-5 lg:border-l lg:border-t-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--leaf)]">
                  Weekly pulse
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <strong className="font-serif text-5xl">{weeklyAverage}</strong>
                  <span className="pb-2 text-sm text-[var(--ink-soft)]">
                    전국 평균
                  </span>
                </div>
                <div className="mt-5 flex h-24 items-end gap-2">
                  {temperatureTrend.map((item) => (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div
                        className="w-full rounded-t-[4px] bg-[var(--coral)]"
                        style={{ height: `${Math.max(12, item.score * 0.72)}px` }}
                      />
                      <span className="text-xs font-bold text-[var(--ink-soft)]">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-[var(--line)] px-5 py-3 text-xs font-bold text-[var(--ink-soft)] md:px-7">
              데이터 상태:{" "}
              {dataSource === "database"
                ? "PostgreSQL 연결"
                : dataSource === "local"
                  ? "로컬 임시 반영"
                  : "시드 데이터"}
            </div>
          </div>

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
                <p className="text-xs text-[var(--ink-soft)]">
                  현재 온도 {temperature}도와 함께 등록됩니다.
                </p>
                <button className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[var(--plum)] px-4 text-sm font-bold text-white">
                  <Send className="size-4" />
                  올리기
                </button>
              </div>
            </form>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.68fr)]">
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={cn(
                    "cursor-pointer rounded-[8px] border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(75,54,38,0.1)]",
                    selectedPost?.id === post.id
                      ? "border-[var(--plum)]"
                      : "border-[var(--line)]",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[6px] bg-[#f4ebe3] px-2 py-1 text-xs font-bold text-[var(--plum)]">
                      {categories.find((item) => item.key === post.category)?.label}
                    </span>
                    <span className="text-xs text-[var(--ink-soft)]">
                      {post.createdAt} · {post.readMinutes}분
                    </span>
                    {post.pinned ? (
                      <span className="rounded-[6px] bg-[#fff4bf] px-2 py-1 text-xs font-bold text-[#7a5b00]">
                        주목
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-lg font-extrabold leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ink-soft)]">
                    {post.body}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
                      <span className="font-bold text-[var(--foreground)]">
                        {post.author}
                      </span>
                      <span>{post.coupleStage}</span>
                      <span>{moodLabels[post.mood]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
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
                </article>
              ))}
            </div>

            {selectedPost ? (
              <article className="rounded-[8px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(75,54,38,0.08)] xl:sticky xl:top-4 xl:self-start">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-[6px] bg-[#f4ebe3] px-2 py-1 text-xs font-bold text-[var(--plum)]">
                    {categories.find((item) => item.key === selectedPost.category)?.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--coral)]">
                    <Thermometer className="size-3.5" />
                    {selectedPost.temperature}도
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-3xl font-bold leading-tight">
                  {selectedPost.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
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

                <div className="mt-6 border-t border-[var(--line)] pt-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold">
                      댓글 {selectedPost.comments.length}
                    </h4>
                    <span className="text-xs text-[var(--ink-soft)]">
                      조언보다 먼저 마음을 확인합니다
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {selectedPost.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-[8px] bg-[#fbf6f0] p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-sm">{comment.author}</strong>
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
                    className="mt-3 flex gap-2"
                  >
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
              {letters.map((letter) => (
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
            <textarea
              value={letterDraft}
              onChange={(event) => setLetterDraft(event.target.value)}
              className="mt-3 min-h-20 w-full resize-none rounded-[8px] border border-[#ead18a] bg-white/80 p-3 text-sm outline-none focus:border-[#987000]"
              placeholder="배우자에게 차마 못 한 말을 적어두기"
            />
            <button
              onClick={() => setLetterDraft("")}
              className="mt-2 h-10 w-full rounded-[8px] bg-[#7a5b00] text-sm font-bold text-white"
            >
              익명으로 접어두기
            </button>
          </section>

          <section className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">회복 배지</h2>
              <ShieldCheck className="size-4 text-[var(--leaf)]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((badge) => (
                <div key={badge.label} className="rounded-[8px] bg-[#f7eee7] p-3">
                  <p className="text-xs font-bold text-[var(--ink-soft)]">
                    {badge.label}
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold">
                    {badge.count}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--line)] bg-[#2d2930] p-4 text-white">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-[#f7c948]" />
              <h2 className="text-sm font-extrabold">운영 큐</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/78">
              <p>신고 2건 · 중재 필요 댓글 1건</p>
              <p>신규 가입 승인 7명 · OAuth 연결 대기</p>
              <p>booboo2 게시글 이관 매핑: 카테고리, 댓글, 배지 우선</p>
            </div>
          </section>
        </aside>
      </section>
      <SiteFooter />
    </main>
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
