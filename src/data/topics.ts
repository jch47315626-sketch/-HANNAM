import type { Topic } from "@/types";

/**
 * 오늘의 대화 주제와 질문.
 * 질문은 ko/ja 두 언어로 준비되어 Mock 번역 사전에도 등록된다.
 */
export const TOPICS: Topic[] = [
  {
    id: "food",
    icon: "☕",
    name: { ko: "음식 & 카페", ja: "食べ物・カフェ" },
    description: "좋아하는 음식, 가보고 싶은 카페",
    relatedInterests: ["restaurant", "cafe", "dessert", "cooking", "spicy", "food_travel"],
    questions: [
      { id: "food_1", text: { ko: "한국에서 꼭 먹어보고 싶은 음식은 뭐예요?", ja: "韓国でぜひ食べてみたい料理は何ですか？" } },
      { id: "food_2", text: { ko: "가장 좋아하는 음식은 뭐예요?", ja: "一番好きな食べ物は何ですか？" } },
      { id: "food_3", text: { ko: "좋아하는 카페 스타일이 있어요?", ja: "好きなカフェのスタイルはありますか？" } },
      { id: "food_4", text: { ko: "매운 음식 좋아해요?", ja: "辛い食べ物は好きですか？" } },
    ],
  },
  {
    id: "travel",
    icon: "✈️",
    name: { ko: "여행", ja: "旅行" },
    description: "가보고 싶은 곳, 기억에 남는 여행",
    relatedInterests: ["travel_kr", "travel_jp", "travel_abroad", "solo_travel", "food_travel", "photo", "camping"],
    questions: [
      { id: "travel_1", text: { ko: "한국에 일주일 여행 간다면 어디부터 가고 싶어요?", ja: "韓国に一週間旅行するなら、まずどこに行きたいですか？" } },
      { id: "travel_2", text: { ko: "가장 기억에 남는 여행은 어디였어요?", ja: "一番思い出に残っている旅行はどこですか？" } },
      { id: "travel_3", text: { ko: "바다와 산 중에 어디를 더 좋아해요?", ja: "海と山、どちらが好きですか？" } },
    ],
  },
  {
    id: "music",
    icon: "🎵",
    name: { ko: "음악", ja: "音楽" },
    description: "요즘 듣는 노래, 좋아하는 가수",
    relatedInterests: ["kpop", "jpop", "pop", "indie", "concert"],
    questions: [
      { id: "music_1", text: { ko: "요즘 가장 많이 듣는 노래는 뭐예요?", ja: "最近一番よく聴いている曲は何ですか？" } },
      { id: "music_2", text: { ko: "좋아하는 한국 가수가 있어요?", ja: "好きな韓国の歌手はいますか？" } },
      { id: "music_3", text: { ko: "콘서트 가는 거 좋아해요?", ja: "コンサートに行くのは好きですか？" } },
    ],
  },
  {
    id: "drama",
    icon: "📺",
    name: { ko: "드라마 & 영화", ja: "ドラマ・映画" },
    description: "최근 재미있게 본 작품",
    relatedInterests: ["kdrama", "jdrama", "movie", "anime", "webtoon"],
    questions: [
      { id: "drama_1", text: { ko: "최근에 재미있게 본 작품이 있어요?", ja: "最近面白かった作品はありますか？" } },
      { id: "drama_2", text: { ko: "좋아하는 한국 드라마가 있어요?", ja: "好きな韓国ドラマはありますか？" } },
      { id: "drama_3", text: { ko: "영화는 혼자 보는 게 좋아요, 같이 보는 게 좋아요?", ja: "映画は一人で見るのと誰かと見るの、どちらが好きですか？" } },
    ],
  },
  {
    id: "game",
    icon: "🎮",
    name: { ko: "게임", ja: "ゲーム" },
    description: "요즘 하는 게임, 추억의 게임",
    relatedInterests: ["game", "anime"],
    questions: [
      { id: "game_1", text: { ko: "어떤 게임을 좋아해요?", ja: "どんなゲームが好きですか？" } },
      { id: "game_2", text: { ko: "모바일 게임이랑 PC 게임 중에 뭐가 더 좋아요?", ja: "スマホゲームとPCゲーム、どちらが好きですか？" } },
    ],
  },
  {
    id: "culture_KR",
    icon: "🌸",
    name: { ko: "한국 문화", ja: "韓国文化" },
    description: "궁금했던 한국의 모든 것",
    relatedInterests: ["travel_kr", "kpop", "kdrama", "webtoon", "culture_exchange", "language_study"],
    questions: [
      { id: "culture_KR_1", text: { ko: "한국에서 가장 궁금한 게 뭐예요?", ja: "韓国について一番気になることは何ですか？" } },
      { id: "culture_KR_2", text: { ko: "한국의 어떤 문화가 가장 재미있어요?", ja: "韓国のどんな文化が一番面白いですか？" } },
      { id: "culture_KR_3", text: { ko: "한국에 온다면 꼭 해보고 싶은 게 있어요?", ja: "韓国に来たら絶対にやってみたいことはありますか？" } },
    ],
  },
  {
    id: "culture_JP",
    icon: "🎌",
    name: { ko: "일본 문화", ja: "日本文化" },
    description: "일본에 대해 궁금한 것",
    relatedInterests: ["travel_jp", "jpop", "jdrama", "anime", "culture_exchange", "language_study"],
    questions: [
      { id: "culture_JP_1", text: { ko: "일본에서 꼭 가봐야 할 곳을 추천해줄 수 있어요?", ja: "日本で絶対に行くべき場所をおすすめしてくれますか？" } },
      { id: "culture_JP_2", text: { ko: "일본 사람들이 요즘 많이 하는 게 뭐예요?", ja: "最近日本で流行っていることは何ですか？" } },
    ],
  },
  {
    id: "animal",
    icon: "🐶",
    name: { ko: "동물", ja: "動物" },
    description: "강아지파? 고양이파?",
    relatedInterests: ["dog", "cat", "nature"],
    questions: [
      { id: "animal_1", text: { ko: "강아지파예요, 고양이파예요?", ja: "犬派ですか？猫派ですか？" } },
      { id: "animal_2", text: { ko: "반려동물 키워요?", ja: "ペットを飼っていますか？" } },
    ],
  },
  {
    id: "hobby",
    icon: "🏃",
    name: { ko: "취미 & 운동", ja: "趣味・運動" },
    description: "주말에 뭐 하세요?",
    relatedInterests: ["workout", "walk", "camping", "photo", "drawing", "reading", "fashion", "beauty"],
    questions: [
      { id: "hobby_1", text: { ko: "주말에는 보통 뭐 해요?", ja: "週末は普段何をしていますか？" } },
      { id: "hobby_2", text: { ko: "요즘 빠져 있는 취미가 있어요?", ja: "最近ハマっている趣味はありますか？" } },
    ],
  },
  {
    id: "study_work",
    icon: "📚",
    name: { ko: "공부 & 일", ja: "勉強・仕事" },
    description: "언어 공부, 일 이야기",
    relatedInterests: ["study", "self_dev", "language_study", "reading"],
    questions: [
      { id: "study_1", text: { ko: "언어 공부는 어떻게 하고 있어요?", ja: "語学の勉強はどうやっていますか？" } },
      { id: "study_2", text: { ko: "요즘 일은 어때요? 바빠요?", ja: "最近お仕事はどうですか？忙しいですか？" } },
    ],
  },
  {
    id: "mbti",
    icon: "🧠",
    name: { ko: "MBTI", ja: "MBTI" },
    description: "가볍게 성격 이야기",
    relatedInterests: ["self_dev", "reading"],
    questions: [
      { id: "mbti_1", text: { ko: "여행할 때 계획형이에요, 즉흥형이에요?", ja: "旅行するとき、計画派ですか？それとも気まぐれ派ですか？" } },
      { id: "mbti_2", text: { ko: "쉬는 날에는 밖에 나가요, 집에 있어요?", ja: "休みの日は出かけますか？家にいますか？" } },
    ],
  },
  {
    id: "daily",
    icon: "💬",
    name: { ko: "일상 이야기", ja: "日常の話" },
    description: "아무 이야기나 편하게",
    relatedInterests: ["cafe", "walk", "culture_exchange"],
    questions: [
      { id: "daily_1", text: { ko: "오늘 하루는 어땠어요?", ja: "今日はどんな一日でしたか？" } },
      { id: "daily_2", text: { ko: "요즘 소소하게 행복한 일이 있어요?", ja: "最近ちょっと幸せなことはありますか？" } },
    ],
  },
];

const byId = new Map(TOPICS.map((t) => [t.id, t]));

export function getTopic(id: string | undefined | null): Topic | undefined {
  return id ? byId.get(id) : undefined;
}

export function getQuestion(questionId: string | undefined | null) {
  if (!questionId) return undefined;
  for (const t of TOPICS) {
    const q = t.questions.find((x) => x.id === questionId);
    if (q) return { topic: t, question: q };
  }
  return undefined;
}
