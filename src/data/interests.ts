export interface Interest {
  id: string;
  icon: string;
  label: string;
  category: "음식" | "여행" | "콘텐츠" | "취미" | "생활/문화";
}

export const MAX_INTERESTS = 5;

export const INTERESTS: Interest[] = [
  { id: "restaurant", icon: "🍜", label: "맛집", category: "음식" },
  { id: "cafe", icon: "☕", label: "카페", category: "음식" },
  { id: "dessert", icon: "🍰", label: "디저트", category: "음식" },
  { id: "cooking", icon: "🍳", label: "요리", category: "음식" },
  { id: "spicy", icon: "🌶️", label: "매운 음식", category: "음식" },

  { id: "travel_kr", icon: "🇰🇷", label: "한국 여행", category: "여행" },
  { id: "travel_jp", icon: "🗾", label: "일본 여행", category: "여행" },
  { id: "travel_abroad", icon: "✈️", label: "해외여행", category: "여행" },
  { id: "solo_travel", icon: "🎒", label: "혼자 여행", category: "여행" },
  { id: "food_travel", icon: "🍱", label: "맛집 여행", category: "여행" },

  { id: "kpop", icon: "🎤", label: "K-pop", category: "콘텐츠" },
  { id: "jpop", icon: "🎧", label: "J-pop", category: "콘텐츠" },
  { id: "pop", icon: "🎵", label: "팝", category: "콘텐츠" },
  { id: "indie", icon: "🎸", label: "인디 음악", category: "콘텐츠" },
  { id: "concert", icon: "🎫", label: "콘서트", category: "콘텐츠" },
  { id: "kdrama", icon: "📺", label: "한국 드라마", category: "콘텐츠" },
  { id: "jdrama", icon: "📼", label: "일본 드라마", category: "콘텐츠" },
  { id: "movie", icon: "🎬", label: "영화", category: "콘텐츠" },
  { id: "anime", icon: "✨", label: "애니메이션", category: "콘텐츠" },
  { id: "webtoon", icon: "📱", label: "웹툰", category: "콘텐츠" },

  { id: "game", icon: "🎮", label: "게임", category: "취미" },
  { id: "photo", icon: "📷", label: "사진", category: "취미" },
  { id: "workout", icon: "🏃", label: "운동", category: "취미" },
  { id: "walk", icon: "🚶", label: "산책", category: "취미" },
  { id: "camping", icon: "🏕️", label: "캠핑", category: "취미" },
  { id: "reading", icon: "📚", label: "독서", category: "취미" },
  { id: "drawing", icon: "🎨", label: "그림", category: "취미" },
  { id: "fashion", icon: "👗", label: "패션", category: "취미" },
  { id: "beauty", icon: "💄", label: "뷰티", category: "취미" },

  { id: "dog", icon: "🐶", label: "강아지", category: "생활/문화" },
  { id: "cat", icon: "🐱", label: "고양이", category: "생활/문화" },
  { id: "nature", icon: "🌿", label: "자연", category: "생활/문화" },
  { id: "study", icon: "✏️", label: "공부", category: "생활/문화" },
  { id: "self_dev", icon: "📈", label: "자기계발", category: "생활/문화" },
  { id: "language_study", icon: "🗣️", label: "언어 공부", category: "생활/문화" },
  { id: "culture_exchange", icon: "🌏", label: "문화교류", category: "생활/문화" },
];

const byId = new Map(INTERESTS.map((i) => [i.id, i]));

export function getInterest(id: string): Interest | undefined {
  return byId.get(id);
}

export const INTEREST_CATEGORIES = ["음식", "여행", "콘텐츠", "취미", "생활/문화"] as const;
