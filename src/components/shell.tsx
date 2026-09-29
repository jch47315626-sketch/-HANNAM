"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DAILY_NEW_CHAT_LIMIT } from "@/data/config";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ConnectCelebration } from "@/components/connect";
import { Loading } from "@/components/ui";

/** 모바일 우선 레이아웃. 데스크톱에서는 가운데 모바일 프레임으로 보인다. */
export function AppShell({
  children,
  nav = false,
  guard = "onboarded",
  className,
}: {
  children: React.ReactNode;
  nav?: boolean;
  /** onboarded: 온보딩 완료 필요, user: 사용자만 있으면 됨, none: 누구나 */
  guard?: "onboarded" | "user" | "none";
  className?: string;
}) {
  const { state, me } = useStore();
  const router = useRouter();

  const blocked =
    guard !== "none" && state.hydrated && (!me || (guard === "onboarded" && !state.onboarded));

  useEffect(() => {
    if (!blocked) return;
    router.replace(me ? "/onboarding" : "/");
  }, [blocked, me, router]);

  const waiting = guard !== "none" && (!state.hydrated || blocked);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-cream shadow-[0_0_40px_rgba(0,0,0,0.06)]">
      <main className={cn("flex flex-1 flex-col", nav && "pb-20", className)}>
        {waiting ? <Loading label="불러오는 중..." /> : children}
      </main>
      {nav && !waiting && <BottomNav />}
      {!waiting && <ConnectCelebration />}
    </div>
  );
}

const NAV = [
  { href: "/conversations", icon: "💬", label: "대화" },
  { href: "/home", icon: "🌏", label: "이야기" },
  { href: "/connect", icon: "💛", label: "Connect" },
  { href: "/me", icon: "👤", label: "프로필" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="grid grid-cols-4">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href === "/home" && pathname.startsWith("/discover"));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[11px]",
                  active ? "font-bold text-ink" : "text-muted",
                )}
              >
                <span className={cn("text-xl transition", !active && "opacity-60 grayscale")} aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TopBar({
  title,
  back,
  right,
  sub,
}: {
  title?: React.ReactNode;
  back?: string | true;
  right?: React.ReactNode;
  sub?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line/70 bg-cream/95 px-3 py-2.5 backdrop-blur">
      {back && (
        <button
          onClick={() => (back === true ? router.back() : router.push(back))}
          aria-label="뒤로"
          className="rounded-full p-2 text-xl leading-none hover:bg-black/5"
        >
          ←
        </button>
      )}
      <div className={cn("min-w-0 flex-1", !back && "pl-2")}>
        {typeof title === "string" ? <h1 className="truncate text-[17px] font-bold">{title}</h1> : title}
        {sub}
      </div>
      {right}
    </header>
  );
}

export function DailyCounter({ compact }: { compact?: boolean }) {
  const { usedToday } = useStore();
  const used = usedToday.length;
  const full = used >= DAILY_NEW_CHAT_LIMIT;
  return (
    <Link
      href="/premium"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
        full ? "border-brand/40 bg-brand-soft text-brand-strong" : "border-line bg-paper text-ink-soft",
      )}
      aria-label={`오늘의 새로운 대화 ${used}명 / ${DAILY_NEW_CHAT_LIMIT}명`}
    >
      {!compact && <span className="font-normal text-muted">오늘의 대화</span>}
      <span>
        {used} / {DAILY_NEW_CHAT_LIMIT}
      </span>
    </Link>
  );
}
