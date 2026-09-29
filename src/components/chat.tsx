"use client";

import { useState } from "react";
import { LANGUAGES } from "@/data/config";
import { translate } from "@/services/translation";
import { cn, clockTime } from "@/lib/utils";
import type { LanguageCode, Message, UserProfile } from "@/types";

/**
 * 채팅 메시지.
 * - 원문은 항상 기준 데이터로 보존/표시한다.
 * - 번역 ON: 번역만 표시 (원문은 [원문 보기])
 * - 번역 OFF: 원문 + [번역 보기]
 */
export function MessageBubble({
  message,
  mine,
  sender,
  viewerLanguage,
  partnerLanguage,
  translationEnabled,
  simulateError,
}: {
  message: Message;
  mine: boolean;
  sender?: UserProfile;
  viewerLanguage: LanguageCode;
  partnerLanguage: LanguageCode;
  translationEnabled: boolean;
  simulateError: boolean;
}) {
  const [reveal, setReveal] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [retried, setRetried] = useState(false);
  const [showOutgoing, setShowOutgoing] = useState(false);

  if (message.kind === "system") {
    return (
      <div className="my-3 flex justify-center">
        <p className="rounded-full bg-sun-soft px-4 py-2 text-center text-xs font-semibold text-[#8a5d00]">
          {message.originalText}
        </p>
      </div>
    );
  }

  const time = <span className="shrink-0 self-end text-[10px] text-muted">{clockTime(message.createdAt)}</span>;

  if (mine) {
    const outgoing = translate(message.originalText, message.originalLanguage, partnerLanguage);
    return (
      <div className="flex flex-col items-end">
        <div className="flex max-w-[85%] items-end gap-1.5">
          {time}
          <div className="rounded-3xl rounded-br-md bg-sea px-4 py-2.5 text-white">
            <p className="whitespace-pre-wrap break-words" lang={message.originalLanguage}>
              {message.originalText}
            </p>
          </div>
        </div>
        {message.originalLanguage !== partnerLanguage && (
          <button
            onClick={() => setShowOutgoing((v) => !v)}
            className="mr-1 mt-1 text-[11px] text-muted underline-offset-2 hover:underline"
            aria-expanded={showOutgoing}
          >
            {LANGUAGES[partnerLanguage].flag} 상대에게 보이는 번역 {showOutgoing ? "닫기" : "보기"}
          </button>
        )}
        {showOutgoing && (
          <p className="mr-1 mt-1 max-w-[80%] rounded-2xl bg-paper px-3 py-2 text-right text-xs text-ink-soft" lang={partnerLanguage}>
            {outgoing ? outgoing.translatedText : "데모에서는 준비된 문장만 번역돼요. 실제 서비스에서는 번역 API가 자동으로 번역해요."}
          </p>
        )}
      </div>
    );
  }

  const tr = translate(message.originalText, message.originalLanguage, viewerLanguage);
  const failed = !!tr && simulateError && !retried;
  // 번역 ON: 번역만 보여준다 (원문은 [원문 보기]로 확인)
  const translatedOnly = !!tr && !failed && translationEnabled;

  return (
    <div className="flex items-end gap-1.5">
      <div className="max-w-[80%] rounded-3xl rounded-bl-md bg-paper px-4 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        {sender && <p className="mb-0.5 text-[11px] font-semibold text-muted">{sender.nickname}</p>}

        {translatedOnly ? (
          <>
            <p className="whitespace-pre-wrap break-words" lang={viewerLanguage}>
              {tr.translatedText}
            </p>
            {showOriginal && (
              <p className="mt-2 border-t border-line pt-2 text-sm text-muted" lang={message.originalLanguage}>
                <span className="sr-only">원문: </span>
                {message.originalText}
              </p>
            )}
            <button
              onClick={() => setShowOriginal((v) => !v)}
              aria-expanded={showOriginal}
              className="mt-1 text-[11px] text-muted underline-offset-2 hover:underline"
            >
              🌐 번역됨 · 원문 {showOriginal ? "숨기기" : "보기"}
            </button>
          </>
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words" lang={message.originalLanguage}>
              {message.originalText}
            </p>

            {failed && (
              <div className="mt-2 border-t border-line pt-2 text-xs text-danger">
                번역하지 못했습니다.
                <button onClick={() => setRetried(true)} className="ml-2 font-semibold underline">
                  다시 번역
                </button>
              </div>
            )}

            {tr && !failed && reveal && (
              <div className="mt-2 border-t border-line pt-2">
                <p className="text-[15px] font-medium text-sea" lang={viewerLanguage}>
                  <span className="sr-only">번역: </span>
                  {tr.translatedText}
                </p>
                <button onClick={() => setReveal(false)} className="mt-1 text-[11px] text-muted underline-offset-2 hover:underline">
                  번역 숨기기
                </button>
              </div>
            )}

            {tr && !failed && !reveal && (
              <button
                onClick={() => setReveal(true)}
                className="mt-2 rounded-full border border-sea/30 px-3 py-1 text-xs font-semibold text-sea hover:bg-sea-soft"
              >
                🌐 번역 보기
              </button>
            )}
          </>
        )}
      </div>
      {time}
    </div>
  );
}

export function TypingBubble({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2" role="status" aria-label={`${name}이(가) 입력 중`}>
      <div className="flex gap-1 rounded-3xl rounded-bl-md bg-paper px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-typing rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

export function Banner({ tone = "neutral", children }: { tone?: "neutral" | "warn" | "love"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-sm",
        tone === "warn" && "bg-danger-soft text-danger",
        tone === "love" && "bg-sun-soft text-[#7a5200]",
        tone === "neutral" && "bg-paper text-ink-soft",
      )}
    >
      {children}
    </div>
  );
}
