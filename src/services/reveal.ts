import { PHOTO_REVEAL_DAYS } from "@/data/config";
import { todayKey } from "@/lib/utils";
import type { Conversation, Message } from "@/types";

/**
 * 사진 공개 조건
 * - 첫 채팅 후 72시간(PHOTO_REVEAL_DAYS × 24시간)이 지났고
 * - 첫 채팅한 날부터 3일(PHOTO_REVEAL_DAYS) 동안 매일 대화했을 것
 *   (하루 = 두 사람이 모두 메시지를 1개 이상 보낸 날)
 */

export interface PhotoRevealStatus {
  unlocked: boolean;
  /** 1일차, 2일차, 3일차 대화 여부 */
  days: boolean[];
  hoursElapsed: number;
  hoursRequired: number;
  started: boolean;
  /** 매일 대화가 끊겨 조건을 더 이상 채울 수 없음 */
  broken: boolean;
}

const HOUR = 3_600_000;

function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return todayKey(new Date(y, m - 1, d + n));
}

export function photoRevealStatus(conv: Conversation, messages: Message[], now = Date.now()): PhotoRevealStatus {
  const chat = messages
    .filter((m) => m.conversationId === conv.id && m.kind !== "system")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const hoursRequired = PHOTO_REVEAL_DAYS * 24;

  if (chat.length === 0) {
    return { unlocked: false, days: Array(PHOTO_REVEAL_DAYS).fill(false), hoursElapsed: 0, hoursRequired, started: false, broken: false };
  }

  const firstAt = new Date(chat[0].createdAt).getTime();
  const firstDay = todayKey(new Date(firstAt));
  const [a, b] = conv.memberIds;

  const days = Array.from({ length: PHOTO_REVEAL_DAYS }, (_, i) => {
    const key = addDays(firstDay, i);
    const onDay = chat.filter((m) => todayKey(new Date(m.createdAt)) === key);
    return onDay.some((m) => m.senderId === a) && onDay.some((m) => m.senderId === b);
  });

  const hoursElapsed = Math.max(0, (now - firstAt) / HOUR);
  const today = todayKey(new Date(now));
  // 이미 지나간 날 중 대화하지 않은 날이 있으면 조건 실패
  const broken = days.some((done, i) => !done && addDays(firstDay, i) < today);

  return {
    unlocked: hoursElapsed >= hoursRequired && days.every(Boolean),
    days,
    hoursElapsed,
    hoursRequired,
    started: true,
    broken,
  };
}
