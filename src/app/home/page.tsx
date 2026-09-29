"use client";

import Link from "next/link";
import { TOPICS } from "@/data/topics";
import { AppShell, DailyCounter } from "@/components/shell";
import { Avatar, NameLine } from "@/components/profile";
import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/utils";

export default function HomePage() {
  return (
    <AppShell nav>
      <Home />
    </AppShell>
  );
}

function Home() {
  const { me, state, partnerOf, canSeePhoto } = useStore();
  if (!me) return null;
  const active = state.conversations
    .filter((c) => c.status === "ACTIVE" || c.status === "CONNECTED")
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
    .slice(0, 3);

  const main = TOPICS.filter((t) => t.id !== "daily");
  const daily = TOPICS.find((t) => t.id === "daily")!;

  return (
    <div className="px-5 pb-6 pt-5">
      <header className="flex items-center justify-between">
        <p className="text-lg font-extrabold">
          한남일녀 <span aria-hidden>🌏</span>
        </p>
        <DailyCounter />
      </header>

      <h1 className="mt-7 text-[26px] font-extrabold leading-snug">
        오늘, 무슨 얘기할래?
      </h1>
      <p className="mt-1 text-sm text-muted">사람보다 먼저, 이야기를 골라보세요.</p>

      <ul className="mt-6 grid grid-cols-2 gap-3">
        {main.map((t) => (
          <li key={t.id}>
            <Link
              href={`/discover?topic=${t.id}`}
              className="flex h-full flex-col rounded-3xl border border-line bg-paper p-4 transition hover:-translate-y-0.5 hover:border-sea/40 hover:shadow-sm"
            >
              <span className="text-3xl" aria-hidden>
                {t.icon}
              </span>
              <span className="mt-3 font-bold">{t.name.ko}</span>
              <span className="mt-0.5 text-xs leading-snug text-muted">{t.description}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={`/discover?topic=${daily.id}`}
        className="mt-3 flex items-center justify-center gap-2 rounded-3xl bg-sea px-4 py-4 font-bold text-white shadow-sm transition hover:brightness-95"
      >
        <span aria-hidden>💬</span> 아무 이야기나
      </Link>

      {active.length > 0 && (
        <section className="mt-8" aria-labelledby="ongoing">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="ongoing" className="font-bold">
              이어서 이야기하기
            </h2>
            <Link href="/conversations" className="text-sm text-muted">
              전체 보기
            </Link>
          </div>
          <ul className="space-y-2">
            {active.map((c) => {
              const p = partnerOf(c);
              if (!p) return null;
              return (
                <li key={c.id}>
                  <Link href={`/chat?id=${c.id}`} className="flex items-center gap-3 rounded-2xl bg-paper p-3">
                    <Avatar user={p} revealed={canSeePhoto(p.id)} size={40} />
                    <span className="min-w-0 flex-1 font-semibold">
                      <NameLine user={p} age={false} />
                    </span>
                    <span className="text-xs text-muted">{relativeTime(c.lastMessageAt)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
