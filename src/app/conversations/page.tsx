"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { COUNTRIES } from "@/data/config";
import { AppShell, DailyCounter, TopBar } from "@/components/shell";
import { Avatar, PurposeBadge } from "@/components/profile";
import { BlockDialog } from "@/components/safety";
import { ButtonLink, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn, relativeTime } from "@/lib/utils";
import { translate } from "@/services/translation";
import type { Conversation, UserProfile } from "@/types";

export default function ConversationsPage() {
  return (
    <AppShell nav>
      <Suspense>
        <Conversations />
      </Suspense>
    </AppShell>
  );
}

function Conversations() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab") === "past" ? "past" : "active";
  const { state, partnerOf, messagesOf, me, canSeePhoto } = useStore();
  const [blockTarget, setBlockTarget] = useState<UserProfile | null>(null);

  const sorted = [...state.conversations].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  const active = sorted.filter((c) => c.status === "ACTIVE" || c.status === "CONNECTED");
  const past = sorted.filter((c) => c.status === "ENDED" || c.status === "BLOCKED");
  const list = tab === "active" ? active : past;

  const preview = (c: Conversation) => {
    const msgs = messagesOf(c.id).filter((m) => m.kind !== "system");
    const last = msgs[msgs.length - 1];
    if (!last) return "아직 메시지가 없어요. 먼저 인사해보세요!";
    if (last.senderId === me?.id) return `나: ${last.originalText}`;
    const translated =
      me && c.memberSettings[me.id]?.translationEnabled
        ? translate(last.originalText, last.originalLanguage, me.nativeLanguage)?.translatedText
        : undefined;
    return translated ?? last.originalText;
  };

  return (
    <>
      <TopBar title="대화" right={<DailyCounter compact />} />
      <div role="tablist" aria-label="대화 구분" className="flex gap-1 px-4 pt-3">
        {[
          { id: "active", label: `대화 중 ${active.length}` },
          { id: "past", label: `지난 대화 ${past.length}` },
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => router.replace(t.id === "past" ? "/conversations?tab=past" : "/conversations")}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-semibold transition",
              tab === t.id ? "bg-ink text-white" : "text-muted hover:bg-black/5",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        tab === "active" ? (
          <EmptyState
            icon="💬"
            title="아직 진행 중인 대화가 없어요."
            description="오늘 이야기하고 싶은 주제를 골라보세요."
            action={<ButtonLink href="/home" block>오늘의 주제 보기</ButtonLink>}
          />
        ) : (
          <EmptyState icon="🗂️" title="아직 지난 대화가 없습니다." description="오늘 새로운 대화를 시작해보세요." />
        )
      ) : (
        <ul className="space-y-2 px-4 py-4">
          {list.map((c) => {
            const p = partnerOf(c);
            if (!p) return null;
            const revealed = c.status === "CONNECTED";
            return (
              <li key={c.id} className="rounded-3xl bg-paper">
                <Link href={`/chat?id=${c.id}`} className="flex items-center gap-3 p-4">
                  <Avatar user={p} revealed={canSeePhoto(p.id)} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold">
                        {p.nickname} <span aria-label={COUNTRIES[p.country].name}>{COUNTRIES[p.country].flag}</span>
                      </p>
                      {revealed && <span className="text-xs text-brand">💛 Connect</span>}
                      {c.status === "BLOCKED" && <span className="rounded-full bg-danger-soft px-2 text-[10px] text-danger">차단됨</span>}
                      {c.status === "ENDED" && <span className="rounded-full bg-cream px-2 text-[10px] text-muted">종료</span>}
                    </div>
                    <p className="truncate text-sm text-muted">{preview(c)}</p>
                  </div>
                  <span className="shrink-0 self-start text-[11px] text-muted">
                    {tab === "past" ? "마지막 대화 " : ""}
                    {relativeTime(c.lastMessageAt)}
                  </span>
                </Link>
                {tab === "past" && (
                  <div className="flex border-t border-line text-xs font-semibold">
                    <Link href={`/profile?id=${p.id}`} className="flex-1 py-2.5 text-center text-ink-soft hover:bg-cream">
                      프로필 보기
                    </Link>
                    <Link href={`/report?user=${p.id}&conv=${c.id}`} className="flex-1 border-x border-line py-2.5 text-center text-ink-soft hover:bg-cream">
                      🚩 신고하기
                    </Link>
                    {c.status === "BLOCKED" ? (
                      <span className="flex-1 py-2.5 text-center text-muted">차단됨</span>
                    ) : (
                      <button onClick={() => setBlockTarget(p)} className="flex-1 py-2.5 text-ink-soft hover:bg-cream">
                        ⛔ 차단하기
                      </button>
                    )}
                  </div>
                )}
                {tab === "active" && <PurposeRow user={p} />}
              </li>
            );
          })}
        </ul>
      )}

      {tab === "past" && list.length > 0 && (
        <p className="px-6 pb-6 text-center text-xs text-muted">대화가 종료되어도 신고 권한은 사라지지 않아요.</p>
      )}

      {blockTarget && <BlockDialog user={blockTarget} open onClose={() => setBlockTarget(null)} />}
    </>
  );
}

function PurposeRow({ user }: { user: UserProfile }) {
  return (
    <div className="-mt-2 px-4 pb-3 pl-[76px]">
      <PurposeBadge purpose={user.purpose} className="!py-0.5 text-[11px]" />
    </div>
  );
}
