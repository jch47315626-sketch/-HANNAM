import type { ChatSpeed, CountryCode, LanguageCode, LanguageLevel, Mbti, Purpose } from "@/types";

/**
 * 서비스 국가 쌍. 화면 문구에 "일본"을 하드코딩하지 않고 여기서 파생한다.
 * 향후 KR → MN, KR → UZ, KR → KZ 등으로 확장.
 */
export const COUNTRY_PAIR: { source: CountryCode; target: CountryCode } = {
  source: "KR",
  target: "JP",
};

export const DAILY_NEW_CHAT_LIMIT = 10;
/** Connect를 제안하기까지 필요한 메시지 수 */
export const CONNECT_MESSAGE_THRESHOLD = 6;
export const REPORT_LIMIT_PER_DAY = 3;
export const REPORT_LIMIT_PER_MONTH = 10;
export const MIN_AGE = 19;

export interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
  language: LanguageCode;
  /** 1단계에서 가입 가능 여부 */
  enabled: boolean;
  cities: string[];
}

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  KR: { code: "KR", name: "한국", flag: "🇰🇷", language: "ko", enabled: true, cities: ["Seoul", "Busan", "Incheon", "Daejeon", "Daegu", "Gwangju"] },
  JP: { code: "JP", name: "일본", flag: "🇯🇵", language: "ja", enabled: true, cities: ["Tokyo", "Osaka", "Kyoto", "Fukuoka", "Nagoya", "Sapporo", "Yokohama"] },
  MN: { code: "MN", name: "몽골", flag: "🇲🇳", language: "mn", enabled: false, cities: ["Ulaanbaatar"] },
  KZ: { code: "KZ", name: "카자흐스탄", flag: "🇰🇿", language: "kk", enabled: false, cities: ["Almaty", "Astana"] },
  UZ: { code: "UZ", name: "우즈베키스탄", flag: "🇺🇿", language: "uz", enabled: false, cities: ["Tashkent", "Samarkand"] },
};

export const LANGUAGES: Record<LanguageCode, { name: string; flag: string }> = {
  ko: { name: "한국어", flag: "🇰🇷" },
  ja: { name: "일본어", flag: "🇯🇵" },
  en: { name: "영어", flag: "🇬🇧" },
  mn: { name: "몽골어", flag: "🇲🇳" },
  ru: { name: "러시아어", flag: "🇷🇺" },
  uz: { name: "우즈베크어", flag: "🇺🇿" },
  kk: { name: "카자흐어", flag: "🇰🇿" },
};

export const LANGUAGE_LEVELS: { id: LanguageLevel; label: string }[] = [
  { id: "none", label: "처음이에요" },
  { id: "basic", label: "간단한 표현은 알아요" },
  { id: "conversational", label: "일상 대화가 가능해요" },
  { id: "fluent", label: "유창해요" },
];

export const PURPOSES: Record<Purpose, { icon: string; label: string; description: string }> = {
  language: { icon: "🗣️", label: "언어교류", description: "새로운 언어와 문화를 배우며 이야기하고 싶어요." },
  romance: { icon: "💛", label: "좋은 인연", description: "대화가 잘 맞는 사람을 만나고 싶어요." },
  both: { icon: "🌏", label: "둘 다", description: "편하게 이야기하다가 좋은 인연도 만나고 싶어요." },
};

export const MBTI_TYPES: Exclude<Mbti, "UNKNOWN">[] = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

export const CHAT_STYLES: { id: string; icon: string; label: string }[] = [
  { id: "light", icon: "😆", label: "재미있고 가벼운 이야기" },
  { id: "daily", icon: "☕", label: "일상적인 이야기" },
  { id: "deep", icon: "🧠", label: "깊은 이야기" },
  { id: "playful", icon: "😂", label: "장난치는 대화" },
  { id: "travel", icon: "✈️", label: "여행 이야기" },
  { id: "love", icon: "❤️", label: "연애 이야기" },
  { id: "taste", icon: "🎵", label: "취향 이야기" },
  { id: "culture", icon: "🌏", label: "서로의 문화 이야기" },
];

export const CHAT_SPEEDS: { id: ChatSpeed; icon: string; label: string }[] = [
  { id: "slow", icon: "🐢", label: "천천히 답하는 편" },
  { id: "relaxed", icon: "🙂", label: "여유롭게 대화" },
  { id: "normal", icon: "💬", label: "보통" },
  { id: "fast", icon: "⚡", label: "답장이 빠른 편" },
  { id: "nonstop", icon: "🔥", label: "계속 이야기하는 걸 좋아해요" },
];

/** 상대 국가에 관심을 갖게 된 이유. 국가명은 화면에서 동적으로 붙인다. */
export const REASONS: { id: string; label: (country: string) => string }[] = [
  { id: "music", label: (c) => (c === "한국" ? "K-pop" : `${c} 음악`) },
  { id: "drama", label: (c) => `${c} 드라마` },
  { id: "movie", label: (c) => `${c} 영화` },
  { id: "food", label: (c) => `${c} 음식` },
  { id: "travel", label: (c) => `${c} 여행` },
  { id: "language", label: (c) => `${c}어 공부` },
  { id: "beauty", label: (c) => (c === "한국" ? "K-beauty" : `${c} 뷰티`) },
  { id: "fashion", label: (c) => (c === "한국" ? "K-fashion" : `${c} 패션`) },
  { id: "game", label: (c) => `${c} 게임` },
  { id: "anime", label: (c) => (c === "한국" ? "웹툰" : `${c} 애니메이션`) },
  { id: "culture", label: (c) => `${c} 문화` },
  { id: "people", label: (c) => `${c} 사람과 이야기해보고 싶어서` },
  { id: "just_like", label: (c) => `그냥 ${c}이(가) 좋아서` },
];

export function partnerCountryOf(country: CountryCode): CountryCode {
  return country === COUNTRY_PAIR.source ? COUNTRY_PAIR.target : COUNTRY_PAIR.source;
}
