import { REPLY_SCRIPTS } from "@/data/scripts";
import { getTopic } from "@/data/topics";
import { getMockUser } from "@/data/users";
import type { Conversation, Localized, Message, UserProfile } from "@/types";

/**
 * 데모 사용자별 초기 대화 기록.
 * 지난 대화 / 신고 / 차단 흐름을 바로 확인할 수 있도록 준비한다.
 */

interface SeedPlan {
  partnerId: string;
  topicId: string;
  questionId: string;
  status: Conversation["status"];
  daysAgo: number;
  /** 상대 답장 개수 */
  replies: number;
}

const PLANS: Record<string, SeedPlan[]> = {
  kr_001: [
    { partnerId: "jp_003", topicId: "travel", questionId: "travel_2", status: "ACTIVE", daysAgo: 1, replies: 2 },
    { partnerId: "jp_002", topicId: "music", questionId: "music_2", status: "ENDED", daysAgo: 2, replies: 2 },
    { partnerId: "jp_005", topicId: "drama", questionId: "drama_1", status: "ENDED", daysAgo: 12, replies: 1 },
  ],
  jp_001: [
    { partnerId: "kr_002", topicId: "culture_JP", questionId: "culture_JP_1", status: "ACTIVE", daysAgo: 1, replies: 2 },
    { partnerId: "kr_003", topicId: "hobby", questionId: "hobby_1", status: "ENDED", daysAgo: 5, replies: 2 },
    { partnerId: "kr_005", topicId: "animal", questionId: "animal_1", status: "ENDED", daysAgo: 12, replies: 1 },
  ],
};

function text(entry: Localized, lang: string): string {
  return (entry as Record<string, string>)[lang] ?? entry.ko;
}

export function buildSeed(me: UserProfile, defaultTranslation: boolean) {
  const conversations: Conversation[] = [];
  const messages: Message[] = [];
  const plans = PLANS[me.id] ?? [];
  const now = Date.now();

  plans.forEach((plan, idx) => {
    const partner = getMockUser(plan.partnerId);
    const topic = getTopic(plan.topicId);
    const question = topic?.questions.find((q) => q.id === plan.questionId);
    if (!partner || !topic || !question) return;

    const convId = `conv_seed_${idx}`;
    const start = now - plan.daysAgo * 86_400_000 - 3_600_000;
    let t = start;
    const push = (senderId: string, entry: Localized, lang: string, kind: Message["kind"] = "text") => {
      t += 4 * 60_000;
      messages.push({
        id: `msg_seed_${idx}_${messages.length}`,
        conversationId: convId,
        senderId,
        originalText: text(entry, lang),
        originalLanguage: lang as Message["originalLanguage"],
        kind,
        createdAt: new Date(t).toISOString(),
      });
    };

    push(me.id, question.text, me.nativeLanguage, "question");
    const script = REPLY_SCRIPTS[plan.topicId]?.[partner.country] ?? [];
    for (let i = 0; i < plan.replies && i < script.length; i++) {
      push(partner.id, script[i], partner.nativeLanguage);
    }

    conversations.push({
      id: convId,
      memberIds: [me.id, partner.id],
      topicId: plan.topicId,
      questionId: plan.questionId,
      status: plan.status,
      startedAt: new Date(start).toISOString(),
      lastMessageAt: new Date(t).toISOString(),
      endedAt: plan.status === "ENDED" ? new Date(t + 60_000).toISOString() : undefined,
      connect: { [me.id]: false, [partner.id]: false },
      memberSettings: {
        [me.id]: { translationEnabled: defaultTranslation, learningMode: false },
        [partner.id]: { translationEnabled: true, learningMode: false },
      },
      scriptCursor: plan.replies,
    });
  });

  return { conversations, messages };
}
