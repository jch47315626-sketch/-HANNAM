import { MIN_AGE, partnerCountryOf } from "@/data/config";
import { getInterest } from "@/data/interests";
import { getTopic } from "@/data/topics";
import type { Purpose, UserProfile } from "@/types";

/**
 * 매칭 알고리즘 v1 (Mock 규칙 기반)
 *
 * | 요소                | 점수 |
 * | 오늘 선택한 대화 주제 | 30 |
 * | 공통 관심사          | 25 |
 * | 대화 스타일          | 15 |
 * | 언어 호환성          | 15 |
 * | 관심 이유(문화)      | 10 |
 * | MBTI                |  5 |
 *
 * 목적 호환성은 별도 가중치로 처리한다. MBTI는 궁합 판정이 아니라 낮은 비중의 참고값이다.
 */

export interface Recommendation {
  user: UserProfile;
  score: number;
  commonInterests: string[];
  topicMatch: boolean;
  purposeMatch: boolean;
  reasons: string[];
}

export function isPurposeCompatible(a: Purpose, b: Purpose): boolean {
  return a === "both" || b === "both" || a === b;
}

function overlap<T>(a: T[], b: T[]): T[] {
  const set = new Set(b);
  return a.filter((x) => set.has(x));
}

export function scoreCandidate(me: UserProfile, other: UserProfile, topicId?: string): Recommendation {
  const topic = getTopic(topicId);
  const reasons: string[] = [];

  // 주제 (30)
  const topicInterests = topic ? overlap(other.interests, topic.relatedInterests) : [];
  const topicScore = topic ? Math.min(1, topicInterests.length / 2) * 30 : 15;
  const topicMatch = topicInterests.length > 0;
  if (topic && topicMatch) reasons.push(`${topic.icon} ${topic.name.ko} 이야기를 좋아해요`);

  // 공통 관심사 (25)
  const common = overlap(me.interests, other.interests);
  const interestScore = Math.min(1, common.length / 3) * 25;
  if (common.length > 0) reasons.push(`공통 관심사 ${common.length}개`);

  // 대화 스타일 (15)
  const styleScore = Math.min(1, overlap(me.styles, other.styles).length / 2) * 15;

  // 언어 호환성 (15)
  let languageScore = 5; // 번역이 도와주므로 기본 점수
  if (other.learningLanguages.includes(me.nativeLanguage) || me.learningLanguages.includes(other.nativeLanguage)) {
    languageScore = 15;
    reasons.push("서로의 언어를 배우고 있어요");
  } else if (overlap(me.languages, other.languages).length > 0) {
    languageScore = 10;
  }

  // 관심 이유 (10)
  const reasonScore = Math.min(1, overlap(me.reasons, other.reasons).length / 2) * 10;

  // MBTI (5) - 낮은 비중
  let mbtiScore = 2;
  if (me.mbti !== "UNKNOWN" && other.mbti !== "UNKNOWN") {
    const same = [...me.mbti].filter((c, i) => other.mbti[i] === c).length;
    mbtiScore = same >= 2 ? 5 : 2;
  }

  const purposeMatch = isPurposeCompatible(me.purpose, other.purpose);
  const weight = purposeMatch ? 1 : 0.6;

  const score = Math.round(
    (topicScore + interestScore + styleScore + languageScore + reasonScore + mbtiScore) * weight,
  );

  return { user: other, score, commonInterests: common, topicMatch, purposeMatch, reasons };
}

export interface CandidateFilter {
  blockedIds: Set<string>;
  talkedIds: Set<string>;
}

/** 추천 제외: 차단 관계, 정지/탈퇴/고위험 계정, 이미 대화한 사람, 지원하지 않는 국가, 연령 정책 */
export function isEligible(me: UserProfile, other: UserProfile, filter: CandidateFilter): boolean {
  if (other.id === me.id) return false;
  if (other.country !== partnerCountryOf(me.country)) return false;
  if (other.status !== "ACTIVE" || other.riskLevel === "high") return false;
  if (other.age < MIN_AGE) return false;
  if (filter.blockedIds.has(other.id)) return false;
  if (filter.talkedIds.has(other.id)) return false;
  return true;
}

export function recommend(
  me: UserProfile,
  pool: UserProfile[],
  topicId: string | undefined,
  filter: CandidateFilter,
): Recommendation[] {
  return pool
    .filter((u) => isEligible(me, u, filter))
    .map((u) => scoreCandidate(me, u, topicId))
    .sort((a, b) => Number(b.purposeMatch) - Number(a.purposeMatch) || b.score - a.score);
}

export function interestLabels(ids: string[]): string[] {
  return ids.map((id) => {
    const i = getInterest(id);
    return i ? `${i.icon} ${i.label}` : id;
  });
}
