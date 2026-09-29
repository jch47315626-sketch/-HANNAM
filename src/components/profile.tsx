"use client";

import { COUNTRIES, LANGUAGES, PURPOSES } from "@/data/config";
import { getInterest } from "@/data/interests";
import { cn } from "@/lib/utils";
import type { Purpose, UserProfile, Verification } from "@/types";

/**
 * 프로필 사진. 기본은 잠금 상태이며 서로 Connect한 경우에만 공개된다.
 * 1단계에서는 실제 사진 대신 일러스트(가상 사진)를 사용한다.
 */
export function Avatar({
  user,
  revealed,
  size = 48,
  className,
}: {
  user: UserProfile;
  revealed?: boolean;
  size?: number;
  className?: string;
}) {
  const { from, to, emoji } = user.avatar;
  if (!revealed) {
    return (
      <div
        className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e9e3da]", className)}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${user.nickname}의 사진 (잠김)`}
      >
        <div
          className="absolute inset-0 opacity-50 blur-md"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        />
        <span className="relative" style={{ fontSize: size * 0.38 }} aria-hidden>
          🔒
        </span>
      </div>
    );
  }
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full", className)}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${from}, ${to})` }}
      role="img"
      aria-label={`${user.nickname}의 사진 (일러스트)`}
    >
      <span style={{ fontSize: size * 0.48 }} aria-hidden>
        {emoji}
      </span>
    </div>
  );
}

export function LockedPhoto({ user, revealed }: { user: UserProfile; revealed?: boolean }) {
  const { from, to, emoji } = user.avatar;
  return (
    <div
      className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl"
      style={{ background: revealed ? `linear-gradient(135deg, ${from}, ${to})` : "#ebe5dc" }}
      role="img"
      aria-label={revealed ? `${user.nickname}의 사진 (가상 일러스트)` : "사진 비공개"}
    >
      {revealed ? (
        <>
          <span className="text-[96px] drop-shadow-sm" aria-hidden>
            {emoji}
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-ink-soft">
            데모용 가상 사진
          </span>
        </>
      ) : (
        <>
          <div className="absolute inset-0 opacity-40 blur-2xl" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
          <div className="relative text-center">
            <div className="text-4xl" aria-hidden>
              🔒
            </div>
            <p className="mt-2 text-sm font-semibold text-ink-soft">사진 비공개</p>
            <p className="mt-1 text-xs text-muted">첫 채팅 후 3일 동안 매일 대화하면 공개돼요</p>
          </div>
        </>
      )}
    </div>
  );
}

export function PurposeBadge({ purpose, className }: { purpose: Purpose; className?: string }) {
  const p = PURPOSES[purpose];
  const tone =
    purpose === "language"
      ? "bg-sea-soft text-sea"
      : purpose === "romance"
        ? "bg-sun-soft text-[#9a6a06]"
        : "bg-brand-soft text-brand-strong";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tone, className)}>
      <span aria-hidden>{p.icon}</span>
      {p.label}
    </span>
  );
}

export function NameLine({ user, className }: { user: UserProfile; className?: string }) {
  const c = COUNTRIES[user.country];
  return (
    <span className={className}>
      <span aria-label={c.name}>{c.flag}</span> {user.nickname} · {user.age}
    </span>
  );
}

export function CityLine({ user }: { user: UserProfile }) {
  const c = COUNTRIES[user.country];
  return (
    <span className="text-sm text-muted">
      {c.flag} {user.city || c.name}
    </span>
  );
}

export function InterestChips({ ids, highlight }: { ids: string[]; highlight?: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="관심사">
      {ids.map((id) => {
        const i = getInterest(id);
        if (!i) return null;
        const hit = highlight?.includes(id);
        return (
          <li
            key={id}
            className={cn(
              "rounded-full px-2.5 py-1 text-[13px]",
              hit ? "bg-sea-soft font-semibold text-sea" : "bg-cream text-ink-soft",
            )}
          >
            {i.icon} {i.label}
            {hit && <span className="sr-only"> (공통 관심사)</span>}
          </li>
        );
      })}
    </ul>
  );
}

export function LanguageLine({ user }: { user: UserProfile }) {
  const learning = user.learningLanguages.map((l) => `${LANGUAGES[l].flag} ${LANGUAGES[l].name}`).join(", ");
  return (
    <p className="text-sm text-ink-soft">
      {learning ? <>{learning} 공부 중</> : <>{LANGUAGES[user.nativeLanguage].name} 사용</>}
    </p>
  );
}

export function VerificationBadges({ v }: { v: Verification }) {
  const items: [keyof Verification, string][] = [
    ["email", "이메일 인증"],
    ["age", "성인 인증"],
    ["identity", "본인 인증"],
    ["photo", "사진 인증"],
  ];
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="인증 상태 (데모)">
      {items.map(([k, label]) => (
        <li
          key={k}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs",
            v[k] ? "border-sea/30 bg-sea-soft text-sea" : "border-line text-muted line-through",
          )}
        >
          {v[k] ? "✓" : "·"} {label}
        </li>
      ))}
    </ul>
  );
}
