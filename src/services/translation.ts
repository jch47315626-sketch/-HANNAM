import { TOPICS } from "@/data/topics";
import { FOLLOW_UPS, GENERIC_REPLIES, QUICK_PHRASES, REPLY_SCRIPTS } from "@/data/scripts";
import type { LanguageCode, Localized, Translation } from "@/types";

/**
 * Mock 번역 제공자.
 *
 * 2단계에서는 이 모듈의 translate()만 서버 API 호출로 교체한다.
 * (API 키는 절대 클라이언트에 두지 않고, 서버 라우트에서 전문 번역 API를 호출)
 *
 * 원칙
 * - 메시지는 원문만 저장하고, 번역 결과는 별도 Translation 레코드로 다룬다.
 * - 같은 원문 + 같은 목표 언어의 번역은 캐시한다. (source + target + normalized_text)
 */

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

// 준비된 모든 문장을 언어별로 색인
const phraseIndex = new Map<string, Localized>();

function register(entry: Localized) {
  for (const [lang, text] of Object.entries(entry)) {
    if (text) phraseIndex.set(`${lang}:${normalize(text)}`, entry);
  }
}

TOPICS.forEach((t) => t.questions.forEach((q) => register(q.text)));
Object.values(REPLY_SCRIPTS).forEach((byCountry) => Object.values(byCountry).forEach((lines) => lines?.forEach(register)));
Object.values(GENERIC_REPLIES).forEach((lines) => lines?.forEach(register));
Object.values(FOLLOW_UPS).forEach((lines) => lines.forEach(register));
QUICK_PHRASES.forEach(register);

const cache = new Map<string, Translation | null>();
let seq = 0;

export function translate(
  text: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
): Translation | null {
  if (sourceLanguage === targetLanguage) return null;
  const key = `${sourceLanguage}|${targetLanguage}|${normalize(text)}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  const entry = phraseIndex.get(`${sourceLanguage}:${normalize(text)}`);
  const translated = entry?.[targetLanguage];
  const result: Translation | null = translated
    ? {
        id: `tr_${++seq}`,
        sourceLanguage,
        targetLanguage,
        translatedText: translated,
        translationProvider: "mock",
        createdAt: new Date().toISOString(),
      }
    : null;
  cache.set(key, result);
  return result;
}

/** 캐시 확인용 (설정 화면의 데모 정보) */
export function translationCacheSize(): number {
  return cache.size;
}
