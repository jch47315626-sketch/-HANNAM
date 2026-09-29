import type { UserProfile, Verification } from "@/types";

/**
 * 가상 사용자 (Mock). 실제 인물의 이름/얼굴/연락처를 사용하지 않는다.
 * 사진은 실제 사진 대신 일러스트 아바타(emoji + gradient)로 표현한다.
 */

const allVerified: Verification = { email: true, age: true, identity: true, photo: true };
const partlyVerified: Verification = { email: true, age: true, identity: false, photo: true };
const basicVerified: Verification = { email: true, age: true, identity: false, photo: false };

const base = {
  photoLocked: true,
  status: "ACTIVE" as const,
  riskLevel: "low" as const,
  mockConnect: "accept" as const,
};

export const USERS: UserProfile[] = [
  // ─── 🇯🇵 일본 ───
  {
    ...base,
    id: "jp_001", nickname: "Yuki", age: 28, gender: "female", country: "JP", city: "Tokyo",
    nativeLanguage: "ja", languages: ["ja", "en", "ko"], learningLanguages: ["ko"], partnerLanguageLevel: "basic",
    mbti: "INFP", interests: ["cafe", "dessert", "travel_kr", "kpop", "restaurant"],
    reasons: ["music", "food", "travel", "language"], purpose: "language", styles: ["daily", "travel", "culture"], speed: "relaxed",
    bio: "한국의 작은 카페와 디저트를 찾아다니는 것을 좋아해요.",
    detailedBio: "도쿄에서 디자이너로 일하고 있어요. 주말마다 새로운 카페를 찾아다니고, 언젠가 서울 성수동 카페 투어를 하는 게 꿈이에요. 한국어는 드라마로 공부 중이에요!",
    avatar: { emoji: "🌷", from: "#FDE2C8", to: "#F7A072" }, verification: allVerified,
  },
  {
    ...base,
    id: "jp_002", nickname: "Aiko", age: 26, gender: "female", country: "JP", city: "Osaka",
    nativeLanguage: "ja", languages: ["ja", "ko"], learningLanguages: ["ko"], partnerLanguageLevel: "conversational",
    mbti: "ENFP", interests: ["kdrama", "kpop", "concert", "travel_kr", "restaurant"],
    reasons: ["drama", "music", "people"], purpose: "both", styles: ["light", "playful", "taste"], speed: "fast",
    bio: "한국 드라마와 음악을 좋아합니다. 오사카 맛집은 제게 물어보세요!",
    detailedBio: "오사카 토박이예요. 좋아하는 드라마 OST는 다 외워요. 언젠가 한국 콘서트에 가는 게 목표예요.",
    avatar: { emoji: "🎤", from: "#E0E7FF", to: "#8B9CF7" }, verification: partlyVerified,
  },
  {
    ...base,
    id: "jp_003", nickname: "Mio", age: 29, gender: "female", country: "JP", city: "Kyoto",
    nativeLanguage: "ja", languages: ["ja", "en"], learningLanguages: ["ko"], partnerLanguageLevel: "none",
    mbti: "ISFP", interests: ["dog", "walk", "photo", "travel_abroad", "nature"],
    reasons: ["travel", "culture"], purpose: "romance", styles: ["daily", "deep"], speed: "slow",
    bio: "여행과 강아지를 좋아해요. 천천히 이야기하는 편이에요.",
    detailedBio: "교토에서 강아지 '모치'와 살고 있어요. 필름 카메라로 산책길을 찍는 걸 좋아해요.",
    avatar: { emoji: "🐕", from: "#DCFCE7", to: "#6BCB9B" }, verification: allVerified,
  },
  {
    ...base,
    id: "jp_004", nickname: "Rina", age: 25, gender: "female", country: "JP", city: "Fukuoka",
    nativeLanguage: "ja", languages: ["ja", "en"], learningLanguages: ["ko", "en"], partnerLanguageLevel: "basic",
    mbti: "ESFJ", interests: ["restaurant", "game", "spicy", "kpop", "food_travel"],
    reasons: ["food", "game", "music"], purpose: "language", styles: ["light", "playful"], speed: "fast",
    bio: "맛있는 음식과 게임을 좋아합니다. 매운 음식 도전 중!",
    detailedBio: "후쿠오카는 부산이랑 가까워서 배 타고 자주 놀러 가요. 매운 라면 챌린지 좋아해요.",
    avatar: { emoji: "🌶️", from: "#FEE2E2", to: "#F87171" }, verification: partlyVerified,
  },
  {
    ...base,
    id: "jp_005", nickname: "Hana", age: 30, gender: "female", country: "JP", city: "Tokyo",
    nativeLanguage: "ja", languages: ["ja", "en", "ko"], learningLanguages: ["ko"], partnerLanguageLevel: "conversational",
    mbti: "INFJ", interests: ["reading", "movie", "cafe", "culture_exchange", "language_study"],
    reasons: ["language", "movie", "culture"], purpose: "both", styles: ["deep", "culture", "taste"], speed: "normal",
    bio: "한국 영화와 책을 좋아해요. 깊은 이야기를 나누고 싶어요.",
    detailedBio: "출판사에서 일해요. 한국 소설 번역본을 모으는 게 취미예요.",
    avatar: { emoji: "📖", from: "#FEF3C7", to: "#F4B942" }, verification: allVerified,
  },
  {
    ...base,
    id: "jp_006", nickname: "Saki", age: 27, gender: "female", country: "JP", city: "Nagoya",
    nativeLanguage: "ja", languages: ["ja"], learningLanguages: ["ko"], partnerLanguageLevel: "basic",
    mbti: "ENFP", interests: ["travel_kr", "fashion", "beauty", "cafe", "kdrama"],
    reasons: ["beauty", "fashion", "travel"], purpose: "romance", styles: ["light", "love", "travel"], speed: "normal",
    bio: "한국 패션과 뷰티에 관심이 많아요. 서울 여행 계획 중!",
    detailedBio: "나고야에서 네일 아티스트로 일해요. 명동과 성수에 꼭 가보고 싶어요.",
    avatar: { emoji: "💅", from: "#FCE7F3", to: "#E48CB4" }, verification: basicVerified,
    mockConnect: "wait",
  },
  {
    ...base,
    id: "jp_007", nickname: "Emi", age: 25, gender: "female", country: "JP", city: "Sapporo",
    nativeLanguage: "ja", languages: ["ja", "en"], learningLanguages: ["ko"], partnerLanguageLevel: "none",
    mbti: "ISTP", interests: ["camping", "nature", "photo", "travel_abroad", "workout"],
    reasons: ["travel", "people"], purpose: "language", styles: ["travel", "daily"], speed: "slow",
    bio: "홋카이도에서 캠핑과 사진을 즐겨요.",
    detailedBio: "겨울엔 스노보드, 여름엔 캠핑! 한국의 산도 올라가 보고 싶어요.",
    avatar: { emoji: "🏔️", from: "#E0F2FE", to: "#60A5FA" }, verification: partlyVerified,
  },
  {
    ...base,
    id: "jp_008", nickname: "Sakura", age: 27, gender: "female", country: "JP", city: "Yokohama",
    nativeLanguage: "ja", languages: ["ja", "en"], learningLanguages: ["ko"], partnerLanguageLevel: "basic",
    mbti: "ESFP", interests: ["kpop", "concert", "dessert", "fashion", "travel_kr"],
    reasons: ["music", "fashion"], purpose: "both", styles: ["light", "taste", "playful"], speed: "nonstop",
    bio: "콘서트와 디저트가 인생의 낙이에요!",
    detailedBio: "요코하마에 살아요. 한국 아이돌 콘서트를 보러 서울에 두 번 가봤어요.",
    avatar: { emoji: "🌸", from: "#FFE4E6", to: "#FB7185" }, verification: allVerified,
  },
  {
    ...base,
    id: "jp_009", nickname: "Nana", age: 31, gender: "female", country: "JP", city: "Tokyo",
    nativeLanguage: "ja", languages: ["ja", "en"], learningLanguages: ["ko"], partnerLanguageLevel: "basic",
    mbti: "ENTJ", interests: ["self_dev", "study", "language_study", "travel_abroad", "cafe"],
    reasons: ["language", "culture"], purpose: "language", styles: ["deep", "culture"], speed: "normal",
    bio: "IT 회사에 다녀요. 한국어 공부를 제대로 해보고 싶어요.",
    detailedBio: "한국 지사와 일할 기회가 많아서 한국어를 배우기 시작했어요.",
    avatar: { emoji: "💻", from: "#EDE9FE", to: "#A78BFA" }, verification: allVerified,
  },
  {
    ...base,
    id: "jp_010", nickname: "Kaho", age: 24, gender: "female", country: "JP", city: "Osaka",
    nativeLanguage: "ja", languages: ["ja"], learningLanguages: ["ko"], partnerLanguageLevel: "none",
    mbti: "ISFJ", interests: ["cat", "cooking", "anime", "webtoon", "dessert"],
    reasons: ["anime", "food"], purpose: "both", styles: ["daily", "taste"], speed: "relaxed",
    bio: "고양이 두 마리와 살고 있어요. 웹툰을 좋아해요.",
    detailedBio: "베이킹이 취미예요. 한국 웹툰을 번역본으로 다 읽었어요.",
    avatar: { emoji: "🐈", from: "#FFEDD5", to: "#FB923C" }, verification: partlyVerified,
  },
  {
    ...base,
    id: "jp_011", nickname: "Mei", age: 28, gender: "female", country: "JP", city: "Kyoto",
    nativeLanguage: "ja", languages: ["ja", "en", "ko"], learningLanguages: ["ko"], partnerLanguageLevel: "fluent",
    mbti: "INTP", interests: ["movie", "indie", "reading", "drawing", "culture_exchange"],
    reasons: ["movie", "culture", "language"], purpose: "language", styles: ["deep", "taste", "culture"], speed: "normal",
    bio: "한국 독립영화와 인디 음악을 좋아해요.",
    detailedBio: "교토에서 대학원에 다니고 있어요. 한국 인디 밴드 공연을 보러 홍대에 가보고 싶어요.",
    avatar: { emoji: "🎞️", from: "#F1F5F9", to: "#94A3B8" }, verification: allVerified,
  },
  {
    ...base,
    id: "jp_012", nickname: "Yui", age: 29, gender: "female", country: "JP", city: "Fukuoka",
    nativeLanguage: "ja", languages: ["ja", "en"], learningLanguages: ["ko"], partnerLanguageLevel: "basic",
    mbti: "ESTP", interests: ["workout", "spicy", "restaurant", "travel_kr", "game"],
    reasons: ["food", "travel", "just_like"], purpose: "romance", styles: ["light", "playful", "travel"], speed: "fast",
    bio: "운동하고 맛있는 거 먹는 게 최고예요!",
    detailedBio: "필라테스 강사예요. 부산 돼지국밥을 먹으러 또 가고 싶어요.",
    avatar: { emoji: "🏋️", from: "#CCFBF1", to: "#2DD4BF" }, verification: partlyVerified,
  },

  // ─── 🇰🇷 한국 ───
  {
    ...base,
    id: "kr_001", nickname: "민준", age: 31, gender: "male", country: "KR", city: "Seoul",
    nativeLanguage: "ko", languages: ["ko", "en"], learningLanguages: ["ja"], partnerLanguageLevel: "basic",
    mbti: "ENFP", interests: ["restaurant", "travel_jp", "cafe", "photo", "concert"],
    reasons: ["travel", "food", "anime", "people"], purpose: "both", styles: ["light", "travel", "culture"], speed: "normal",
    bio: "새로운 음식과 여행을 좋아해요. 서울 맛집은 제게 물어보세요.",
    detailedBio: "서울에서 마케터로 일해요. 일본은 다섯 번 여행했고, 다음엔 홋카이도에 가보고 싶어요.",
    avatar: { emoji: "📷", from: "#DBEAFE", to: "#3B82F6" }, verification: allVerified,
  },
  {
    ...base,
    id: "kr_002", nickname: "지훈", age: 29, gender: "male", country: "KR", city: "Busan",
    nativeLanguage: "ko", languages: ["ko", "ja"], learningLanguages: ["ja"], partnerLanguageLevel: "conversational",
    mbti: "INFP", interests: ["travel_jp", "movie", "game", "anime", "cafe"],
    reasons: ["anime", "game", "travel"], purpose: "language", styles: ["taste", "daily", "culture"], speed: "relaxed",
    bio: "여행과 영화를 좋아합니다. 부산 바다 근처에 살아요.",
    detailedBio: "부산에서 개발자로 일해요. 일본 애니메이션으로 일본어를 배웠어요.",
    avatar: { emoji: "🌊", from: "#CFFAFE", to: "#22B8CF" }, verification: allVerified,
  },
  {
    ...base,
    id: "kr_003", nickname: "현우", age: 30, gender: "male", country: "KR", city: "Seoul",
    nativeLanguage: "ko", languages: ["ko", "en"], learningLanguages: ["ja"], partnerLanguageLevel: "none",
    mbti: "ISTP", interests: ["camping", "workout", "photo", "nature", "cooking"],
    reasons: ["travel", "culture"], purpose: "romance", styles: ["daily", "travel"], speed: "slow",
    bio: "캠핑과 요리를 좋아해요. 조용한 대화를 좋아합니다.",
    detailedBio: "주말마다 캠핑을 가요. 캠핑 요리 자신 있어요.",
    avatar: { emoji: "🏕️", from: "#DCFCE7", to: "#4ADE80" }, verification: partlyVerified,
  },
  {
    ...base,
    id: "kr_004", nickname: "도윤", age: 27, gender: "male", country: "KR", city: "Incheon",
    nativeLanguage: "ko", languages: ["ko", "en"], learningLanguages: ["ja", "en"], partnerLanguageLevel: "basic",
    mbti: "ENFJ", interests: ["kpop", "concert", "fashion", "cafe", "culture_exchange"],
    reasons: ["music", "fashion", "people"], purpose: "both", styles: ["light", "culture", "taste"], speed: "fast",
    bio: "음악과 패션을 좋아하는 인천 사람이에요.",
    detailedBio: "공항 근처에 살아서 여행객 친구가 많아요. 한국을 소개하는 걸 좋아해요.",
    avatar: { emoji: "🎧", from: "#EDE9FE", to: "#8B5CF6" }, verification: basicVerified,
  },
  {
    ...base,
    id: "kr_005", nickname: "준호", age: 32, gender: "male", country: "KR", city: "Daejeon",
    nativeLanguage: "ko", languages: ["ko", "ja"], learningLanguages: ["ja"], partnerLanguageLevel: "conversational",
    mbti: "ISFJ", interests: ["reading", "cafe", "dog", "walk", "language_study"],
    reasons: ["language", "culture", "drama"], purpose: "romance", styles: ["deep", "daily"], speed: "normal",
    bio: "책과 강아지를 좋아해요. 일본어를 꾸준히 공부하고 있어요.",
    detailedBio: "대전에서 연구원으로 일해요. 강아지 '콩이'와 산책하는 게 하루의 낙이에요.",
    avatar: { emoji: "🐾", from: "#FEF3C7", to: "#F59E0B" }, verification: allVerified,
  },
  {
    ...base,
    id: "kr_006", nickname: "태현", age: 28, gender: "male", country: "KR", city: "Seoul",
    nativeLanguage: "ko", languages: ["ko", "en"], learningLanguages: ["ja"], partnerLanguageLevel: "basic",
    mbti: "ENTP", interests: ["game", "anime", "movie", "spicy", "restaurant"],
    reasons: ["game", "anime", "food"], purpose: "language", styles: ["playful", "light", "taste"], speed: "nonstop",
    bio: "게임과 애니메이션 이야기라면 밤새도록 할 수 있어요.",
    detailedBio: "게임 회사에 다녀요. 매운 음식 추천은 자신 있어요.",
    avatar: { emoji: "🕹️", from: "#FFE4E6", to: "#F43F5E" }, verification: partlyVerified,
  },
  {
    ...base,
    id: "kr_007", nickname: "도현", age: 34, gender: "male", country: "KR", city: "Incheon",
    nativeLanguage: "ko", languages: ["ko", "en"], learningLanguages: ["ja"], partnerLanguageLevel: "none",
    mbti: "ESTJ", interests: ["restaurant", "cooking", "culture_exchange", "travel_abroad", "workout"],
    reasons: ["food", "culture"], purpose: "both", styles: ["daily", "culture"], speed: "normal",
    bio: "요리와 한국 문화를 소개하는 걸 좋아해요.",
    detailedBio: "주말에는 요리 클래스를 다녀요. 한식 레시피를 알려드릴 수 있어요.",
    avatar: { emoji: "🍲", from: "#FFEDD5", to: "#EA580C" }, verification: basicVerified,
  },
  {
    ...base,
    id: "kr_008", nickname: "준서", age: 32, gender: "male", country: "KR", city: "Gwangju",
    nativeLanguage: "ko", languages: ["ko"], learningLanguages: ["ja"], partnerLanguageLevel: "basic",
    mbti: "INTJ", interests: ["study", "self_dev", "reading", "jdrama", "walk"],
    reasons: ["drama", "language"], purpose: "language", styles: ["deep", "culture"], speed: "slow",
    bio: "일본 드라마로 일본어를 공부하고 있어요.",
    detailedBio: "광주에서 선생님으로 일해요. 일본 드라마 대사를 따라 하는 게 공부법이에요.",
    avatar: { emoji: "📝", from: "#E0E7FF", to: "#6366F1" }, verification: allVerified,
  },
];

const byId = new Map(USERS.map((u) => [u.id, u]));

export function getMockUser(id: string): UserProfile | undefined {
  return byId.get(id);
}

/** 데모에서 바로 시작할 수 있는 사용자 */
export const DEMO_USER_IDS = ["kr_001", "jp_001"] as const;
