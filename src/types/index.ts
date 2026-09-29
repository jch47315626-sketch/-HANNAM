// 도메인 타입 정의.
// 2단계에서 Supabase 테이블로 옮길 때 이 타입을 기준으로 스키마를 만든다.

export type LanguageCode = "ko" | "ja" | "en" | "mn" | "ru" | "uz" | "kk";
export type CountryCode = "KR" | "JP" | "MN" | "KZ" | "UZ";
export type Gender = "male" | "female" | "other";

/** 여러 언어로 준비된 문장 (Mock 번역 사전의 단위) */
export type Localized = Partial<Record<LanguageCode, string>> & { ko: string };

export type Purpose = "language" | "romance" | "both";
export type LanguageLevel = "none" | "basic" | "conversational" | "fluent";
export type ChatSpeed = "slow" | "relaxed" | "normal" | "fast" | "nonstop";

export type Mbti =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP"
  | "UNKNOWN";

export type AccountStatus = "ACTIVE" | "LIMITED" | "SUSPENDED" | "BANNED" | "DELETED";
export type RiskLevel = "low" | "medium" | "high";

export interface Verification {
  email: boolean;
  age: boolean;
  identity: boolean;
  photo: boolean;
}

export interface AvatarStyle {
  emoji: string;
  from: string;
  to: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  age: number;
  gender: Gender;
  country: CountryCode;
  city?: string;
  nativeLanguage: LanguageCode;
  languages: LanguageCode[];
  learningLanguages: LanguageCode[];
  /** 상대 국가 언어 수준 (한국 사용자는 일본어, 일본 사용자는 한국어) */
  partnerLanguageLevel: LanguageLevel;
  mbti: Mbti;
  interests: string[];
  /** 한국(또는 상대 국가)에 관심을 갖게 된 이유 */
  reasons: string[];
  purpose: Purpose;
  styles: string[];
  speed: ChatSpeed;
  bio: string;
  /** Connect 이후에만 보이는 상세 소개 */
  detailedBio?: string;
  photoLocked: boolean;
  avatar: AvatarStyle;
  verification: Verification;
  status: AccountStatus;
  riskLevel: RiskLevel;
  /** Mock 전용: 상대가 Connect에 어떻게 반응하는지 */
  mockConnect?: "accept" | "wait";
}

export interface TopicQuestion {
  id: string;
  text: Localized;
}

export interface Topic {
  id: string;
  icon: string;
  name: Localized;
  description: string;
  relatedInterests: string[];
  questions: TopicQuestion[];
}

export type ConversationStatus = "ACTIVE" | "CONNECTED" | "ENDED" | "BLOCKED";

export interface ConversationMemberSettings {
  translationEnabled: boolean;
  learningMode: boolean;
}

export interface Conversation {
  id: string;
  /** 항상 정확히 두 명 (1:1 전용) */
  memberIds: [string, string];
  topicId: string;
  questionId?: string;
  status: ConversationStatus;
  startedAt: string;
  lastMessageAt: string;
  endedAt?: string;
  connect: Record<string, boolean>;
  memberSettings: Record<string, ConversationMemberSettings>;
  /** 오늘의 질문을 아직 보내지 않은 상태 */
  pendingQuestionId?: string;
  connectPromptDismissed?: boolean;
  /** 데모 전용: 주고받은 메시지 수에 더해 계산할 가상 메시지 수 */
  demoExtraMessages?: number;
  /** Mock 대화 스크립트 진행 위치 */
  scriptCursor: number;
}

export type MessageKind = "text" | "question" | "system";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  originalText: string;
  originalLanguage: LanguageCode;
  kind: MessageKind;
  createdAt: string;
}

export interface Translation {
  id: string;
  messageId?: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  translatedText: string;
  translationProvider: "mock";
  createdAt: string;
}

export type ReportReason =
  | "fraud"
  | "fake_profile"
  | "stolen_photo"
  | "impersonation"
  | "sexual_message"
  | "sexual_photo_request"
  | "harassment"
  | "threat"
  | "stalking"
  | "external_messenger"
  | "spam"
  | "minor"
  | "other";

export type ReportSeverity = "normal" | "serious";

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  conversationId?: string;
  messageIds: string[];
  reason: ReportReason;
  description: string;
  severity: ReportSeverity;
  status: "SUBMITTED" | "IN_REVIEW" | "RESOLVED";
  createdAt: string;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface DailyUsage {
  /** YYYY-MM-DD (로컬 날짜) */
  date: string;
  /** 오늘 새로 대화를 시작한 상대 id (중복 없음) */
  partnerIds: string[];
}

export interface DemoSettings {
  simulateDiscoverError: boolean;
  simulateTranslationError: boolean;
  defaultTranslation: boolean;
}
