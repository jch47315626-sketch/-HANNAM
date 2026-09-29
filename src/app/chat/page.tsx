"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { CONNECT_MESSAGE_THRESHOLD, COUNTRIES } from "@/data/config";
import { FOLLOW_UPS, INTEREST_HINTS, QUICK_PHRASES } from "@/data/scripts";
import { getQuestion, getTopic } from "@/data/topics";
import { AppShell } from "@/components/shell";
import { Banner, MessageBubble, TypingBubble } from "@/components/chat";
import { Avatar, PurposeBadge } from "@/components/profile";
import { BlockDialog } from "@/components/safety";
import { Button, ButtonLink, EmptyState, Modal, Switch } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Localized } from "@/types";

export default function ChatPage() {
  return (
    <AppShell>
      <Suspense>
        <Chat />
      </Suspense>
    </AppShell>
  );
}

function Chat() {
  const params = useSearchParams();
  const router = useRouter();
  const store = useStore();
  const { me, state } = store;
  const conv = state.conversations.find((c) => c.id === params.get("id"));
  const partner = conv ? store.partnerOf(conv) : undefined;
  const messages = conv ? store.messagesOf(conv.id) : [];
  const typing = conv ? state.typing[conv.id] : false;

  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [phrasesOpen, setPhrasesOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(0);
  const [tipSeen, setTipSeen] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const last = messages[messages.length - 1];
  const lastFromPartner = !!last && !!partner && last.senderId === partner.id;

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing, suggestOpen]);

  // 대화가 잠시 멈추면 '대화 이어가기' 제안
  useEffect(() => {
    if (!lastFromPartner || typing) return;
    const t = window.setTimeout(() => setSuggestOpen(true), 4500);
    return () => window.clearTimeout(t);
  }, [lastFromPartner, typing, messages.length]);

  if (!me) return null;
  if (!conv || !partner) {
    return <EmptyState icon="💬" title="대화를 찾을 수 없어요." action={<ButtonLink href="/conversations" block>대화 목록</ButtonLink>} />;
  }

  const topic = getTopic(conv.topicId);
  const pendingQuestion = getQuestion(conv.pendingQuestionId)?.question;
  const mySettings = conv.memberSettings[me.id] ?? { translationEnabled: true, learningMode: false };
  const open = conv.status === "ACTIVE" || conv.status === "CONNECTED";
  const connected = conv.status === "CONNECTED";
  const iConnected = !!conv.connect[me.id];
  const chatCount = messages.filter((m) => m.kind !== "system").length;
  const connectReady = chatCount >= CONNECT_MESSAGE_THRESHOLD;
  const showConnectPrompt = open && !connected && !iConnected && connectReady && !conv.connectPromptDismissed;
  const country = COUNTRIES[partner.country];

  const followUps: Localized[] = [
    ...(FOLLOW_UPS[conv.topicId] ?? []),
    ...Object.entries(FOLLOW_UPS)
      .filter(([k]) => k !== conv.topicId)
      .flatMap(([, v]) => v),
  ];
  const suggestion = followUps[suggestIndex % followUps.length];

  const send = (value: string, kind: "text" | "question" = "text") => {
    store.sendMessage(conv.id, value, kind);
    setText("");
    setSuggestOpen(false);
    setPhrasesOpen(false);
  };
  const local = (l: Localized) => l[me.nativeLanguage] ?? l.ko;

  return (
    <div className="flex h-dvh flex-col">
      {/* 상단 */}
      <header className="z-30 border-b border-line/70 bg-cream/95 px-2 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/conversations")} aria-label="뒤로" className="rounded-full p-2 text-xl leading-none hover:bg-black/5">
            ←
          </button>
          <Link href={`/profile?id=${partner.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar user={partner} revealed={connected} size={40} />
            <div className="min-w-0">
              <p className="truncate font-bold leading-tight">
                {partner.nickname} · {partner.age}
              </p>
              <p className="flex items-center gap-1.5 truncate text-xs text-muted">
                {country.flag} {partner.city}
                <PurposeBadge purpose={partner.purpose} className="!px-1.5 !py-0 text-[10px]" />
              </p>
            </div>
          </Link>
          <div className="flex flex-col items-center">
            <Switch
              checked={mySettings.translationEnabled}
              onChange={(v) => {
                store.setTranslation(conv.id, v);
                setTipSeen(false);
              }}
              label="번역"
            />
            <span className="mt-0.5 text-[10px] text-muted">번역 {mySettings.translationEnabled ? "ON" : "OFF"}</span>
          </div>
          <button onClick={() => setMenuOpen(true)} aria-label="대화 메뉴" className="rounded-full p-2 text-xl leading-none hover:bg-black/5">
            ⋯
          </button>
        </div>
      </header>

      {/* 메시지 */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {topic && (
          <p className="text-center text-xs text-muted">
            {topic.icon} {topic.name.ko} 이야기로 시작한 대화 · 1:1 대화
          </p>
        )}

        {!tipSeen && (
          <Banner>
            <div className="flex items-start gap-2">
              <span aria-hidden>🌐</span>
              <p className="flex-1 text-xs leading-relaxed">
                {mySettings.translationEnabled
                  ? "번역 ON: 원문과 번역을 함께 보여줘요."
                  : "번역 OFF: 원문만 보여줘요. 필요할 때 [번역 보기]를 눌러보세요."}{" "}
                번역 설정은 나에게만 적용되고, 상대의 설정은 바뀌지 않아요.
              </p>
              <button onClick={() => setTipSeen(true)} className="text-xs text-muted" aria-label="안내 닫기">
                ✕
              </button>
            </div>
          </Banner>
        )}

        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            mine={m.senderId === me.id}
            sender={m.senderId === partner.id ? partner : undefined}
            viewerLanguage={me.nativeLanguage}
            partnerLanguage={partner.nativeLanguage}
            translationEnabled={mySettings.translationEnabled}
            simulateError={state.demo.simulateTranslationError}
          />
        ))}

        {pendingQuestion && open && messages.length === 0 && (
          <div className="animate-fade-up rounded-3xl border border-sea/30 bg-paper p-5 text-center">
            <p className="text-xs font-semibold text-sea">오늘의 질문</p>
            <p className="mt-2 text-lg font-bold">“{local(pendingQuestion.text)}”</p>
            <p className="mt-1 text-xs text-muted">{partner.nickname}에게는 {country.flag} 번역되어 전달돼요.</p>
            <Button block className="mt-4" onClick={() => send(local(pendingQuestion.text), "question")}>
              질문 보내기
            </Button>
          </div>
        )}

        {typing && <TypingBubble name={partner.nickname} />}

        {open && suggestOpen && !typing && (
          <div className="animate-fade-up rounded-3xl bg-sun-soft p-4">
            <p className="text-sm font-bold">💡 이야기를 계속해볼까요?</p>
            <p className="mt-1 text-xs text-ink-soft">
              {partner.nickname}은(는) {INTEREST_HINTS[conv.topicId] ?? "이야기"}를 좋아한다고 했어요.
            </p>
            <button
              onClick={() => send(local(suggestion))}
              className="mt-3 w-full rounded-2xl bg-paper px-4 py-3 text-left text-sm font-semibold hover:shadow-sm"
            >
              “{local(suggestion)}”
            </button>
            <div className="mt-2 flex justify-between">
              <button onClick={() => setSuggestIndex((i) => i + 1)} className="text-xs font-semibold text-ink-soft">
                ↻ 다른 질문
              </button>
              <button onClick={() => setSuggestOpen(false)} className="text-xs text-muted">
                닫기
              </button>
            </div>
          </div>
        )}

        {showConnectPrompt && (
          <div className="animate-fade-up rounded-3xl border border-sun/50 bg-paper p-5 text-center">
            <p className="text-lg font-bold">💛 {partner.nickname}와(과) 더 이야기하고 싶나요?</p>
            <p className="mt-1 text-sm text-muted">
              서로 Connect하면
              <br />
              프로필과 사진을 확인할 수 있어요.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => store.dismissConnectPrompt(conv.id)}>
                아직은 괜찮아요
              </Button>
              <Button onClick={() => store.requestConnect(conv.id)}>Connect</Button>
            </div>
          </div>
        )}

        {open && iConnected && !connected && (
          <Banner tone="love">
            💛 Connect를 보냈어요. {partner.nickname}도 Connect하면 프로필과 사진이 공개돼요.
            <span className="mt-1 block text-xs opacity-80">상대에게는 내가 먼저 보냈다는 사실이 바로 알려지지 않아요.</span>
          </Banner>
        )}

        {connected && (
          <Banner tone="love">
            <div className="flex items-center justify-between gap-2">
              <span>💛 서로 Connect한 사이예요.</span>
              <Link href={`/profile?id=${partner.id}`} className="font-semibold underline">
                프로필 보기
              </Link>
            </div>
          </Banner>
        )}

        {conv.status === "ENDED" && (
          <Banner>
            종료된 대화예요. 메시지를 보낼 수는 없지만 <b>신고와 차단은 계속 가능</b>해요.
          </Banner>
        )}
        {conv.status === "BLOCKED" && <Banner tone="warn">차단한 상대예요. 메시지를 주고받을 수 없어요.</Banner>}
        <div ref={bottom} />
      </div>

      {/* 입력 */}
      <div className="border-t border-line bg-paper px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
        {open ? (
          <>
            {phrasesOpen && (
              <div className="no-scrollbar -mx-3 mb-2 flex gap-2 overflow-x-auto px-3">
                {QUICK_PHRASES.map((p) => (
                  <button
                    key={p.ko}
                    onClick={() => send(local(p))}
                    className="shrink-0 rounded-full border border-line bg-cream px-3 py-1.5 text-xs text-ink-soft hover:border-sea/40"
                  >
                    {local(p)}
                  </button>
                ))}
              </div>
            )}
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (text.trim()) send(text);
              }}
            >
              <button
                type="button"
                onClick={() => setSuggestOpen((v) => !v)}
                aria-label="대화 이어가기 질문 보기"
                className={cn("rounded-full p-2 text-lg", suggestOpen && "bg-sun-soft")}
              >
                💡
              </button>
              <button
                type="button"
                onClick={() => setPhrasesOpen((v) => !v)}
                aria-label="준비된 문장"
                aria-expanded={phrasesOpen}
                className={cn("rounded-full px-2 py-1.5 text-xs font-semibold text-ink-soft", phrasesOpen && "bg-cream")}
              >
                문장
              </button>
              <label className="sr-only" htmlFor="chat-input">
                메시지 입력
              </label>
              <input
                id="chat-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="메시지를 입력하세요..."
                autoComplete="off"
                className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2.5 text-[15px] outline-none focus:border-sea"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="rounded-full bg-sea px-4 py-2.5 text-sm font-bold text-white disabled:bg-sea/30"
              >
                전송
              </button>
            </form>
            {!connected && !iConnected && connectReady && conv.connectPromptDismissed && (
              <button onClick={() => store.requestConnect(conv.id)} className="mt-2 w-full text-center text-xs font-semibold text-brand">
                💛 Connect 보내기
              </button>
            )}
            {!connectReady && !connected && (
              <p className="mt-1.5 text-center text-[11px] text-muted">
                메시지를 {CONNECT_MESSAGE_THRESHOLD - chatCount}개 더 나누면 Connect할 수 있어요.
              </p>
            )}
          </>
        ) : (
          <div className="flex gap-2 py-1">
            <ButtonLink href={`/report?user=${partner.id}&conv=${conv.id}`} variant="secondary" className="flex-1" size="sm">
              🚩 신고하기
            </ButtonLink>
            {conv.status !== "BLOCKED" && (
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setBlockOpen(true)}>
                ⛔ 차단하기
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 메뉴 */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="대화 메뉴">
        <div className="space-y-1">
          <MenuItem onClick={() => router.push(`/profile?id=${partner.id}`)}>👤 프로필 보기</MenuItem>
          <MenuItem onClick={() => router.push(`/report?user=${partner.id}&conv=${conv.id}`)}>🚩 신고하기</MenuItem>
          {conv.status !== "BLOCKED" && (
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                setBlockOpen(true);
              }}
            >
              ⛔ 차단하기
            </MenuItem>
          )}
          {open && (
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                setEndOpen(true);
              }}
            >
              👋 대화 종료
            </MenuItem>
          )}
        </div>
      </Modal>

      <Modal open={endOpen} onClose={() => setEndOpen(false)} title="대화를 종료할까요?">
        <p className="text-sm text-ink-soft">
          대화를 종료한 뒤에도
          <br />
          일정 기간 동안 신고할 수 있습니다.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setEndOpen(false)}>
            계속 대화
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              store.endConversation(conv.id);
              setEndOpen(false);
            }}
          >
            대화 종료
          </Button>
        </div>
      </Modal>

      <BlockDialog user={partner} open={blockOpen} onClose={() => setBlockOpen(false)} />
    </div>
  );
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-2xl px-4 py-3.5 text-left font-medium hover:bg-cream">
      {children}
    </button>
  );
}
