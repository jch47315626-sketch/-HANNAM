"use client";

import Link from "next/link";
import { AppShell, TopBar } from "@/components/shell";
import { Avatar, NameLine, PurposeBadge } from "@/components/profile";
import { ButtonLink, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ConnectPage() {
  return (
    <AppShell nav>
      <ConnectList />
    </AppShell>
  );
}

function ConnectList() {
  const { state, me, partnerOf, canSeePhoto } = useStore();
  if (!me) return null;
  const connected = state.conversations.filter((c) => c.status === "CONNECTED");
  const waiting = state.conversations.filter((c) => c.status === "ACTIVE" && c.connect[me.id]);

  return (
    <>
      <TopBar title="💛 Connect" />
      <div className="px-5 py-5">
        <p className="rounded-2xl bg-paper p-4 text-sm leading-relaxed text-ink-soft">
          Connect는 좋아요가 아니에요. 사진을 보고 고르는 대신, <b>대화를 해본 뒤</b> 더 알아가고 싶다는 표현이에요.
          서로 Connect하면 상세 프로필이 공개되고, 사진은 첫 채팅 후 3일 동안 매일 대화하면 공개돼요.
        </p>

        {connected.length === 0 && waiting.length === 0 && (
          <EmptyState
            icon="💛"
            title="아직 Connect한 사람이 없어요."
            description={"대화를 나누다 보면\nConnect 버튼이 나타나요."}
            action={<ButtonLink href="/home" block>대화 시작하기</ButtonLink>}
          />
        )}

        {connected.length > 0 && (
          <section className="mt-6" aria-labelledby="c1">
            <h2 id="c1" className="mb-3 font-bold">
              서로 Connect ({connected.length})
            </h2>
            <ul className="grid grid-cols-2 gap-3">
              {connected.map((c) => {
                const p = partnerOf(c)!;
                return (
                  <li key={c.id}>
                    <Link href={`/profile?id=${p.id}`} className="flex flex-col items-center rounded-3xl bg-paper p-4 text-center">
                      <Avatar user={p} revealed={canSeePhoto(p.id)} size={72} />
                      <p className="mt-2 font-bold">
                        <NameLine user={p} />
                      </p>
                      <PurposeBadge purpose={p.purpose} className="mt-1.5" />
                      {!canSeePhoto(p.id) && <p className="mt-1.5 text-[11px] text-muted">📷 사진은 3일 매일 대화 후 공개</p>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {waiting.length > 0 && (
          <section className="mt-6" aria-labelledby="c2">
            <h2 id="c2" className="mb-3 font-bold">
              응답 기다리는 중 ({waiting.length})
            </h2>
            <ul className="space-y-2">
              {waiting.map((c) => {
                const p = partnerOf(c)!;
                return (
                  <li key={c.id}>
                    <Link href={`/chat?id=${c.id}`} className="flex items-center gap-3 rounded-2xl bg-paper p-3">
                      <Avatar user={p} size={44} />
                      <div className="flex-1">
                        <p className="font-semibold">{p.nickname}</p>
                        <p className="text-xs text-muted">상대가 Connect하면 상세 프로필이 공개돼요</p>
                      </div>
                      <span className="text-xs text-muted">⏳</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
