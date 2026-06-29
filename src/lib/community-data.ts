export type CategoryKey =
  | "all"
  | "talk"
  | "worry"
  | "tips"
  | "parenting"
  | "together"
  | "letters";

export type MoodKey = "warm" | "tired" | "need-talk" | "thankful";

export type CommunityPost = {
  id: string;
  category: Exclude<CategoryKey, "all">;
  title: string;
  body: string;
  author: string;
  coupleStage: string;
  mood: MoodKey;
  temperature: number;
  createdAt: string;
  readMinutes: number;
  comments: CommentItem[];
  reactions: ReactionState;
  tags: string[];
  pinned?: boolean;
};

export type CommentItem = {
  id: string;
  author: string;
  body: string;
  tone: "support" | "advice" | "question";
  createdAt: string;
};

export type ReactionState = {
  meToo: number;
  hug: number;
  saved: number;
  helpful: number;
};

export type Mission = {
  id: string;
  title: string;
  prompt: string;
  difficulty: "3분" | "10분" | "오늘 안에";
  completions: number;
};

export type Letter = {
  id: string;
  title: string;
  body: string;
  replies: number;
  tone: "고마움" | "미안함" | "서운함";
};

export const categories: Array<{
  key: CategoryKey;
  label: string;
  description: string;
}> = [
  { key: "all", label: "전체", description: "지금 오가는 모든 이야기" },
  { key: "talk", label: "부부톡", description: "일상, 칭찬, 소소한 사건" },
  { key: "worry", label: "고민상담", description: "소통, 돈, 가족, 갈등" },
  { key: "tips", label: "생활팁", description: "집안일, 기념일, 대화법" },
  { key: "parenting", label: "육아톡", description: "아이와 함께 사는 리듬" },
  { key: "together", label: "함께하는 시간", description: "데이트, 요리, 여행" },
  { key: "letters", label: "익명편지", description: "차마 못 한 말" },
];

export const missions: Mission[] = [
  {
    id: "m1",
    title: "고마움 세 문장",
    prompt: "오늘 고마웠던 장면을 세 문장으로 말해보기",
    difficulty: "3분",
    completions: 128,
  },
  {
    id: "m2",
    title: "집안일 교대권",
    prompt: "서로 제일 지친 일을 하나씩 바꿔 맡아보기",
    difficulty: "오늘 안에",
    completions: 47,
  },
  {
    id: "m3",
    title: "휴대폰 없는 차 한 잔",
    prompt: "알림을 끄고 10분 동안 오늘 하루만 묻기",
    difficulty: "10분",
    completions: 203,
  },
];

export const letters: Letter[] = [
  {
    id: "l1",
    title: "화낸 뒤에 바로 미안하다고 못 했어요",
    body: "사실은 내 말투가 더 날카로웠다는 걸 알아요. 오늘은 먼저 말을 걸어보고 싶어요.",
    replies: 18,
    tone: "미안함",
  },
  {
    id: "l2",
    title: "요즘 당신이 버텨주는 게 보여요",
    body: "큰 말은 못 했지만, 퇴근하고도 아이 목욕을 챙기는 모습을 계속 보고 있었어요.",
    replies: 31,
    tone: "고마움",
  },
  {
    id: "l3",
    title: "내 편이 아닌 것 같을 때가 있어요",
    body: "시댁 이야기가 나오면 내가 설명해야 하는 사람이 되는 느낌이 들어요.",
    replies: 42,
    tone: "서운함",
  },
];

export const temperatureTrend = [
  { day: "월", score: 68 },
  { day: "화", score: 72 },
  { day: "수", score: 61 },
  { day: "목", score: 75 },
  { day: "금", score: 79 },
  { day: "토", score: 83 },
  { day: "일", score: 77 },
];

export const badges = [
  { label: "처음 고백", count: 212 },
  { label: "댓글 온기", count: 584 },
  { label: "미션 7일", count: 93 },
  { label: "갈등 회복", count: 71 },
];

export const seedPosts: CommunityPost[] = [
  {
    id: "p1",
    category: "worry",
    title: "퇴근 후 첫 20분이 매번 싸움으로 시작돼요",
    body:
      "둘 다 지쳐 있는 건 아는데, 아이 저녁과 설거지 이야기가 나오면 바로 방어적으로 변합니다. 우리만의 전환 시간이 필요할까요?",
    author: "결혼 6년차",
    coupleStage: "맞벌이 + 5살 아이",
    mood: "need-talk",
    temperature: 48,
    createdAt: "방금 전",
    readMinutes: 3,
    tags: ["퇴근", "육아", "집안일"],
    pinned: true,
    reactions: { meToo: 84, hug: 39, saved: 22, helpful: 17 },
    comments: [
      {
        id: "c1",
        author: "주말엔산책",
        body: "저희는 현관 들어오고 15분 동안 서로 부탁 금지 시간을 만들었더니 꽤 줄었어요.",
        tone: "advice",
        createdAt: "12분 전",
      },
      {
        id: "c2",
        author: "둘이서천천히",
        body: "그 시간대가 문제라는 걸 발견한 것만으로도 이미 반은 해결한 것 같아요.",
        tone: "support",
        createdAt: "7분 전",
      },
    ],
  },
  {
    id: "p2",
    category: "talk",
    title: "오늘 남편이 말없이 도시락통을 씻어놨어요",
    body:
      "별일 아닌데 이상하게 마음이 풀렸습니다. 이런 작은 행동이 왜 이렇게 오래 남을까요.",
    author: "신혼 2년차",
    coupleStage: "맞벌이",
    mood: "thankful",
    temperature: 86,
    createdAt: "34분 전",
    readMinutes: 1,
    tags: ["칭찬", "일상"],
    reactions: { meToo: 152, hug: 24, saved: 11, helpful: 7 },
    comments: [
      {
        id: "c3",
        author: "커피둘",
        body: "작은 친절이 쌓이면 집 분위기가 바뀌더라고요. 오늘 꼭 말로도 전해주세요.",
        tone: "support",
        createdAt: "20분 전",
      },
    ],
  },
  {
    id: "p3",
    category: "tips",
    title: "집안일 분담표보다 효과 좋았던 건 피로도 점수였어요",
    body:
      "누가 뭘 했는지보다 오늘 누가 더 방전됐는지를 먼저 묻는 방식으로 바꿨습니다. 완벽하진 않지만 억울함은 줄었어요.",
    author: "결혼 9년차",
    coupleStage: "초등 부모",
    mood: "warm",
    temperature: 74,
    createdAt: "1시간 전",
    readMinutes: 4,
    tags: ["집안일", "대화법", "루틴"],
    reactions: { meToo: 97, hug: 18, saved: 64, helpful: 82 },
    comments: [
      {
        id: "c4",
        author: "균형찾기",
        body: "피로도를 숫자로 말하면 덜 비난처럼 들리겠네요. 오늘 써볼게요.",
        tone: "support",
        createdAt: "48분 전",
      },
    ],
  },
  {
    id: "p4",
    category: "together",
    title: "만원으로 만든 금요일 집 데이트",
    body:
      "편의점 재료로 타코 비슷한 걸 만들고, 각자 이번 주 좋았던 일 하나씩 말했습니다. 비싼 코스보다 오래 기억날 것 같아요.",
    author: "결혼 4년차",
    coupleStage: "둘이 사는 집",
    mood: "warm",
    temperature: 91,
    createdAt: "2시간 전",
    readMinutes: 2,
    tags: ["데이트", "요리", "기념일"],
    reactions: { meToo: 61, hug: 9, saved: 43, helpful: 25 },
    comments: [],
  },
  {
    id: "p5",
    category: "parenting",
    title: "아이 앞에서 사과하는 모습을 보여줘도 될까요",
    body:
      "싸운 모습을 숨기는 것보다, 화해하는 모습을 보여주는 게 더 낫다는 말을 들었어요. 실제로 해보신 분 있나요?",
    author: "초보 부모",
    coupleStage: "3살 아이",
    mood: "tired",
    temperature: 57,
    createdAt: "3시간 전",
    readMinutes: 3,
    tags: ["육아", "사과", "갈등"],
    reactions: { meToo: 73, hug: 36, saved: 29, helpful: 31 },
    comments: [
      {
        id: "c5",
        author: "말연습중",
        body: "저희는 짧게 '아까 말투가 미안했어' 정도만 해요. 아이가 오히려 안정감을 느끼는 것 같았어요.",
        tone: "advice",
        createdAt: "1시간 전",
      },
    ],
  },
];
