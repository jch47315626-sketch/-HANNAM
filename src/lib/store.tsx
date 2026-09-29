"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import {
  COUNTRY_PAIR,
  DAILY_NEW_CHAT_LIMIT,
  REPORT_LIMIT_PER_DAY,
  REPORT_LIMIT_PER_MONTH,
} from "@/data/config";
import { buildSeed } from "@/data/seed";
import { GENERIC_REPLIES, REPLY_SCRIPTS } from "@/data/scripts";
import { getMockUser, USERS } from "@/data/users";
import { recommend, type Recommendation } from "@/services/matching";
import type {
  Block,
  Conversation,
  ConversationMemberSettings,
  DailyUsage,
  DemoSettings,
  LanguageCode,
  Localized,
  Message,
  MessageKind,
  Report,
  ReportReason,
  UserProfile,
} from "@/types";
import { monthKey, todayKey, uid } from "@/lib/utils";

/**
 * 1단계 데모의 전역 상태.
 * 모든 데이터는 브라우저(localStorage)에만 저장된다. 서버로 전송되는 정보는 없다.
 * 2단계에서는 각 액션을 Supabase 호출로 교체한다.
 */

const STORAGE_KEY = "hannam-ilnyeo:v1";

export const SERIOUS_REASONS: ReportReason[] = ["threat", "stalking", "minor", "sexual_photo_request"];

interface PersistedState {
  version: 1;
  me: UserProfile | null;
  onboarded: boolean;
  conversations: Conversation[];
  messages: Message[];
  reports: Report[];
  blocks: Block[];
  usage: DailyUsage;
  demo: DemoSettings;
}

interface State extends PersistedState {
  hydrated: boolean;
  typing: Record<string, boolean>;
  celebrate: string | null;
}

const DEFAULT_DEMO: DemoSettings = {
  simulateDiscoverError: false,
  simulateTranslationError: false,
  defaultTranslation: true,
};

function emptyState(): PersistedState {
  return {
    version: 1,
    me: null,
    onboarded: false,
    conversations: [],
    messages: [],
    reports: [],
    blocks: [],
    usage: { date: todayKey(), partnerIds: [] },
    demo: DEFAULT_DEMO,
  };
}

type Action =
  | { type: "HYDRATE"; state: PersistedState }
  | { type: "RESET"; state: PersistedState }
  | { type: "UPDATE_PROFILE"; patch: Partial<UserProfile> }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "START_CONVERSATION"; conversation: Conversation; countUsage: boolean }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "PARTNER_REPLY"; conversationId: string; messageId: string; at: string }
  | { type: "SET_TYPING"; conversationId: string; value: boolean }
  | { type: "SET_MEMBER_SETTING"; conversationId: string; userId: string; patch: Partial<ConversationMemberSettings> }
  | { type: "CONNECT"; conversationId: string; userId: string; at: string }
  | { type: "DISMISS_CONNECT_PROMPT"; conversationId: string }
  | { type: "END_CONVERSATION"; conversationId: string; at: string }
  | { type: "BLOCK"; block: Block }
  | { type: "UNBLOCK"; userId: string }
  | { type: "ADD_REPORT"; report: Report }
  | { type: "SET_USAGE"; usage: DailyUsage }
  | { type: "SET_DEMO"; patch: Partial<DemoSettings> }
  | { type: "CLEAR_CELEBRATE" };

function updateConv(state: State, id: string, fn: (c: Conversation) => Conversation): Conversation[] {
  return state.conversations.map((c) => (c.id === id ? fn(c) : c));
}

function pickReply(partner: UserProfile, topicId: string, cursor: number): Localized | undefined {
  const lines = REPLY_SCRIPTS[topicId]?.[partner.country] ?? [];
  if (cursor < lines.length) return lines[cursor];
  const generic = GENERIC_REPLIES[partner.country] ?? [];
  if (generic.length === 0) return undefined;
  return generic[(cursor - lines.length) % generic.length];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.state, hydrated: true };
    case "RESET":
      return { ...state, ...action.state, typing: {}, celebrate: null, hydrated: true };
    case "UPDATE_PROFILE":
      return state.me ? { ...state, me: { ...state.me, ...action.patch } } : state;
    case "COMPLETE_ONBOARDING":
      return { ...state, onboarded: true };
    case "START_CONVERSATION": {
      const today = todayKey();
      const usage = state.usage.date === today ? state.usage : { date: today, partnerIds: [] };
      const partnerId = action.conversation.memberIds[1];
      return {
        ...state,
        conversations: [action.conversation, ...state.conversations],
        usage:
          action.countUsage && !usage.partnerIds.includes(partnerId)
            ? { date: today, partnerIds: [...usage.partnerIds, partnerId] }
            : usage,
      };
    }
    case "ADD_MESSAGE": {
      const m = action.message;
      return {
        ...state,
        messages: [...state.messages, m],
        conversations: updateConv(state, m.conversationId, (c) => ({
          ...c,
          lastMessageAt: m.createdAt,
          pendingQuestionId: m.kind === "question" ? undefined : c.pendingQuestionId,
        })),
      };
    }
    case "PARTNER_REPLY": {
      const conv = state.conversations.find((c) => c.id === action.conversationId);
      const typing = { ...state.typing, [action.conversationId]: false };
      if (!conv || (conv.status !== "ACTIVE" && conv.status !== "CONNECTED")) return { ...state, typing };
      const partner = getMockUser(conv.memberIds[1]);
      if (!partner) return { ...state, typing };
      const entry = pickReply(partner, conv.topicId, conv.scriptCursor);
      if (!entry) return { ...state, typing };
      const lang = partner.nativeLanguage;
      const message: Message = {
        id: action.messageId,
        conversationId: conv.id,
        senderId: partner.id,
        originalText: (entry as Record<string, string>)[lang] ?? entry.ko,
        originalLanguage: lang,
        kind: "text",
        createdAt: action.at,
      };
      return {
        ...state,
        typing,
        messages: [...state.messages, message],
        conversations: updateConv(state, conv.id, (c) => ({
          ...c,
          lastMessageAt: action.at,
          scriptCursor: c.scriptCursor + 1,
        })),
      };
    }
    case "SET_TYPING":
      return { ...state, typing: { ...state.typing, [action.conversationId]: action.value } };
    case "SET_MEMBER_SETTING":
      return {
        ...state,
        conversations: updateConv(state, action.conversationId, (c) => ({
          ...c,
          memberSettings: {
            ...c.memberSettings,
            [action.userId]: { ...c.memberSettings[action.userId], ...action.patch },
          },
        })),
      };
    case "CONNECT": {
      const conv = state.conversations.find((c) => c.id === action.conversationId);
      if (!conv || conv.status === "BLOCKED" || conv.status === "ENDED") return state;
      const connect = { ...conv.connect, [action.userId]: true };
      const both = conv.memberIds.every((id) => connect[id]);
      const messages = both
        ? [
            ...state.messages,
            {
              id: uid("msg"),
              conversationId: conv.id,
              senderId: "system",
              originalText: "🎉 서로 Connect했어요! 이제 서로의 프로필과 사진을 볼 수 있어요.",
              originalLanguage: "ko" as LanguageCode,
              kind: "system" as MessageKind,
              createdAt: action.at,
            },
          ]
        : state.messages;
      return {
        ...state,
        messages,
        celebrate: both ? conv.id : state.celebrate,
        conversations: updateConv(state, conv.id, (c) => ({
          ...c,
          connect,
          status: both ? "CONNECTED" : c.status,
        })),
      };
    }
    case "DISMISS_CONNECT_PROMPT":
      return {
        ...state,
        conversations: updateConv(state, action.conversationId, (c) => ({ ...c, connectPromptDismissed: true })),
      };
    case "END_CONVERSATION":
      return {
        ...state,
        conversations: updateConv(state, action.conversationId, (c) =>
          c.status === "BLOCKED" ? c : { ...c, status: "ENDED", endedAt: action.at },
        ),
      };
    case "BLOCK": {
      if (state.blocks.some((b) => b.blockedUserId === action.block.blockedUserId)) return state;
      return {
        ...state,
        blocks: [...state.blocks, action.block],
        conversations: state.conversations.map((c) =>
          c.memberIds.includes(action.block.blockedUserId)
            ? { ...c, status: "BLOCKED", endedAt: c.endedAt ?? action.block.createdAt }
            : c,
        ),
      };
    }
    case "UNBLOCK":
      return {
        ...state,
        blocks: state.blocks.filter((b) => b.blockedUserId !== action.userId),
        conversations: state.conversations.map((c) =>
          c.memberIds.includes(action.userId) && c.status === "BLOCKED" ? { ...c, status: "ENDED" } : c,
        ),
      };
    case "ADD_REPORT":
      return { ...state, reports: [...state.reports, action.report] };
    case "SET_USAGE":
      return { ...state, usage: action.usage };
    case "SET_DEMO":
      return { ...state, demo: { ...state.demo, ...action.patch } };
    case "CLEAR_CELEBRATE":
      return { ...state, celebrate: null };
  }
}

export type StartResult =
  | { ok: true; conversationId: string; isNew: boolean }
  | { ok: false; reason: "limit" | "blocked" | "no-user" };

export type ReportResult = { ok: true; id: string } | { ok: false; reason: "day" | "month" };

export interface ReportInput {
  reportedUserId: string;
  conversationId?: string;
  messageIds: string[];
  reason: ReportReason;
  description: string;
}

interface Store {
  state: State;
  me: UserProfile | null;
  getUser: (id: string) => UserProfile | undefined;
  partnerOf: (c: Conversation) => UserProfile | undefined;
  usedToday: string[];
  remainingToday: number;
  isBlocked: (userId: string) => boolean;
  conversationWith: (userId: string) => Conversation | undefined;
  messagesOf: (conversationId: string) => Message[];
  recommendations: (topicId?: string) => Recommendation[];
  reportQuota: { today: number; month: number };

  startDemo: (userId: string) => void;
  startCustom: () => void;
  resetAll: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  startConversation: (partnerId: string, topicId: string, questionId?: string) => StartResult;
  sendMessage: (conversationId: string, text: string, kind?: MessageKind) => void;
  setTranslation: (conversationId: string, enabled: boolean) => void;
  requestConnect: (conversationId: string) => void;
  dismissConnectPrompt: (conversationId: string) => void;
  endConversation: (conversationId: string) => void;
  block: (userId: string) => void;
  unblock: (userId: string) => void;
  submitReport: (input: ReportInput) => ReportResult;
  setDemo: (patch: Partial<DemoSettings>) => void;
  setUsageCount: (n: number) => void;
  clearCelebrate: () => void;
}

const StoreContext = createContext<Store | null>(null);

function newCustomProfile(): UserProfile {
  return {
    id: "me",
    nickname: "",
    age: 25,
    gender: "male",
    country: COUNTRY_PAIR.source,
    city: "",
    nativeLanguage: "ko",
    languages: ["ko"],
    learningLanguages: [],
    partnerLanguageLevel: "none",
    mbti: "UNKNOWN",
    interests: [],
    reasons: [],
    purpose: "both",
    styles: [],
    speed: "normal",
    bio: "",
    photoLocked: true,
    avatar: { emoji: "🙂", from: "#E2E8F0", to: "#94A3B8" },
    verification: { email: false, age: false, identity: false, photo: false },
    status: "ACTIVE",
    riskLevel: "low",
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...emptyState(),
    hydrated: false,
    typing: {},
    celebrate: null,
  }));
  const timers = useRef<number[]>([]);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const scheduleConnectResponse = useCallback(
    (conversationId: string, partnerId: string) => {
      const partner = getMockUser(partnerId);
      if (partner?.mockConnect !== "accept") return;
      later(2500, () =>
        dispatch({ type: "CONNECT", conversationId, userId: partnerId, at: new Date().toISOString() }),
      );
    },
    [later],
  );

  // 불러오기
  useEffect(() => {
    let loaded = emptyState();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.version === 1) loaded = { ...loaded, ...parsed, demo: { ...DEFAULT_DEMO, ...parsed.demo } };
      }
    } catch {
      // 저장소를 쓸 수 없는 환경(시크릿 모드 등)에서는 메모리로만 동작
    }
    dispatch({ type: "HYDRATE", state: loaded });
    // 새로고침으로 끊긴 Connect 응답 다시 예약
    const meId = loaded.me?.id;
    if (meId) {
      loaded.conversations.forEach((c) => {
        const partnerId = c.memberIds[1];
        if (c.connect[meId] && !c.connect[partnerId] && c.status === "ACTIVE") scheduleConnectResponse(c.id, partnerId);
      });
    }
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, [scheduleConnectResponse]);

  // 저장
  useEffect(() => {
    if (!state.hydrated) return;
    const persisted: PersistedState = {
      version: 1,
      me: state.me,
      onboarded: state.onboarded,
      conversations: state.conversations,
      messages: state.messages,
      reports: state.reports,
      blocks: state.blocks,
      usage: state.usage,
      demo: state.demo,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // 무시
    }
  }, [state]);

  const me = state.me;

  const getUser = useCallback(
    (id: string) => (me && id === me.id ? me : getMockUser(id)),
    [me],
  );

  const today = todayKey();
  const usedToday = useMemo(
    () => (state.usage.date === today ? state.usage.partnerIds : []),
    [state.usage, today],
  );

  const blockedIds = useMemo(() => new Set(state.blocks.map((b) => b.blockedUserId)), [state.blocks]);

  const reportQuota = useMemo(() => {
    const mine = state.reports.filter((r) => r.reporterId === me?.id && r.severity === "normal");
    return {
      today: mine.filter((r) => todayKey(new Date(r.createdAt)) === today).length,
      month: mine.filter((r) => monthKey(new Date(r.createdAt)) === monthKey()).length,
    };
  }, [state.reports, me, today]);

  const store: Store = useMemo(() => {
    const conversationWith = (userId: string) =>
      state.conversations.find((c) => c.memberIds.includes(userId));

    return {
      state,
      me,
      getUser,
      partnerOf: (c) => getUser(c.memberIds[1]),
      usedToday,
      remainingToday: Math.max(0, DAILY_NEW_CHAT_LIMIT - usedToday.length),
      isBlocked: (userId) => blockedIds.has(userId),
      conversationWith,
      messagesOf: (conversationId) => state.messages.filter((m) => m.conversationId === conversationId),
      recommendations: (topicId) =>
        me
          ? recommend(me, USERS, topicId, {
              blockedIds,
              talkedIds: new Set(state.conversations.map((c) => c.memberIds[1])),
            })
          : [],
      reportQuota,

      startDemo: (userId) => {
        const profile = getMockUser(userId);
        if (!profile) return;
        const base = emptyState();
        const seed = buildSeed(profile, base.demo.defaultTranslation);
        const startedToday = seed.conversations
          .filter((c) => todayKey(new Date(c.startedAt)) === todayKey())
          .map((c) => c.memberIds[1]);
        dispatch({
          type: "RESET",
          state: {
            ...base,
            me: { ...profile },
            onboarded: true,
            ...seed,
            usage: { date: todayKey(), partnerIds: startedToday },
          },
        });
      },
      startCustom: () => dispatch({ type: "RESET", state: { ...emptyState(), me: newCustomProfile() } }),
      resetAll: () => {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
        dispatch({ type: "RESET", state: emptyState() });
      },
      updateProfile: (patch) => dispatch({ type: "UPDATE_PROFILE", patch }),
      completeOnboarding: () => dispatch({ type: "COMPLETE_ONBOARDING" }),

      startConversation: (partnerId, topicId, questionId) => {
        if (!me) return { ok: false, reason: "no-user" };
        if (blockedIds.has(partnerId)) return { ok: false, reason: "blocked" };
        const existing = conversationWith(partnerId);
        // 이미 대화한 상대와는 제한 횟수를 차감하지 않는다
        if (existing) return { ok: true, conversationId: existing.id, isNew: false };
        if (usedToday.length >= DAILY_NEW_CHAT_LIMIT) return { ok: false, reason: "limit" };
        const now = new Date().toISOString();
        const conversation: Conversation = {
          id: uid("conv"),
          memberIds: [me.id, partnerId],
          topicId,
          questionId,
          status: "ACTIVE",
          startedAt: now,
          lastMessageAt: now,
          connect: { [me.id]: false, [partnerId]: false },
          memberSettings: {
            [me.id]: { translationEnabled: state.demo.defaultTranslation, learningMode: false },
            [partnerId]: { translationEnabled: true, learningMode: false },
          },
          pendingQuestionId: questionId,
          scriptCursor: 0,
        };
        dispatch({ type: "START_CONVERSATION", conversation, countUsage: true });
        return { ok: true, conversationId: conversation.id, isNew: true };
      },

      sendMessage: (conversationId, text, kind = "text") => {
        const conv = stateRef.current.conversations.find((c) => c.id === conversationId);
        const trimmed = text.trim();
        if (!me || !conv || !trimmed) return;
        if (conv.status !== "ACTIVE" && conv.status !== "CONNECTED") return;
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: uid("msg"),
            conversationId,
            senderId: me.id,
            originalText: trimmed,
            originalLanguage: me.nativeLanguage,
            kind,
            createdAt: new Date().toISOString(),
          },
        });
        later(600, () => dispatch({ type: "SET_TYPING", conversationId, value: true }));
        later(1900, () =>
          dispatch({
            type: "PARTNER_REPLY",
            conversationId,
            messageId: uid("msg"),
            at: new Date().toISOString(),
          }),
        );
      },

      setTranslation: (conversationId, enabled) => {
        if (!me) return;
        dispatch({ type: "SET_MEMBER_SETTING", conversationId, userId: me.id, patch: { translationEnabled: enabled } });
      },

      requestConnect: (conversationId) => {
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (!me || !conv) return;
        dispatch({ type: "CONNECT", conversationId, userId: me.id, at: new Date().toISOString() });
        scheduleConnectResponse(conversationId, conv.memberIds[1]);
      },
      dismissConnectPrompt: (conversationId) => dispatch({ type: "DISMISS_CONNECT_PROMPT", conversationId }),
      endConversation: (conversationId) =>
        dispatch({ type: "END_CONVERSATION", conversationId, at: new Date().toISOString() }),

      block: (userId) => {
        if (!me) return;
        dispatch({
          type: "BLOCK",
          block: { id: uid("blk"), blockerId: me.id, blockedUserId: userId, createdAt: new Date().toISOString() },
        });
      },
      unblock: (userId) => dispatch({ type: "UNBLOCK", userId }),

      submitReport: (input) => {
        const severity = SERIOUS_REASONS.includes(input.reason) ? "serious" : "normal";
        // 심각한 안전 문제는 신고 횟수 제한과 관계없이 접수한다
        if (severity === "normal") {
          if (reportQuota.today >= REPORT_LIMIT_PER_DAY) return { ok: false, reason: "day" };
          if (reportQuota.month >= REPORT_LIMIT_PER_MONTH) return { ok: false, reason: "month" };
        }
        const report: Report = {
          id: uid("rpt"),
          reporterId: me?.id ?? "unknown",
          ...input,
          severity,
          status: "SUBMITTED",
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: "ADD_REPORT", report });
        return { ok: true, id: report.id };
      },

      setDemo: (patch) => dispatch({ type: "SET_DEMO", patch }),
      setUsageCount: (n) => {
        const real = usedToday.filter((id) => !id.startsWith("demo_filler"));
        const ids = real.slice(0, n);
        for (let i = ids.length; i < n; i++) ids.push(`demo_filler_${i}`);
        dispatch({ type: "SET_USAGE", usage: { date: todayKey(), partnerIds: ids } });
      },
      clearCelebrate: () => dispatch({ type: "CLEAR_CELEBRATE" }),
    };
  }, [state, me, getUser, usedToday, blockedIds, reportQuota, later, scheduleConnectResponse]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
