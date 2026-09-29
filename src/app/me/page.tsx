"use client";

import Link from "next/link";
import { CHAT_SPEEDS, CHAT_STYLES, COUNTRIES, DAILY_NEW_CHAT_LIMIT, LANGUAGE_LEVELS, LANGUAGES, partnerCountryOf } from "@/data/config";
import { AppShell, TopBar } from "@/components/shell";
import { Avatar, InterestChips, NameLine, PurposeBadge, VerificationBadges } from "@/components/profile";
import { ButtonLink, Card, SectionLabel } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function MePage() {
  return (
    <AppShell nav>
      <Me />
    </AppShell>
  );
}

function Me() {
  const { me, usedToday, state } = useStore();
  if (!me) return null;
  const partnerLang = LANGUAGES[COUNTRIES[partnerCountryOf(me.country)].language];
  const connected = state.conversations.filter((c) => c.status === "CONNECTED").length;

  const edit = (step: number) => `/onboarding?step=${step}&from=edit`;

  return (
    <>
      <TopBar
        title="내 프로필"
        right={
          <Link href="/settings" aria-label="설정" className="rounded-full p-2 text-xl leading-none hover:bg-black/5">
            ⚙️
          </Link>
        }
      />
      <div className="space-y-4 px-5 py-5">
        <Card className="text-center">
          <Avatar user={me} revealed size={88} className="mx-auto" />
          <p className="mt-3 text-xl font-bold">
            <NameLine user={me} />
          </p>
          <p className="text-sm text-muted">
            {me.city || COUNTRIES[me.country].name} · {me.mbti === "UNKNOWN" ? "MBTI 모름" : me.mbti}
          </p>
          {me.bio && <p className="mt-3 text-sm text-ink-soft">{me.bio}</p>}
          <p className="mt-3 text-xs text-muted">🔒 내 사진은 3일 동안 매일 대화한 상대에게만 공개돼요.</p>
        </Card>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="오늘의 새 대화" value={`${usedToday.length}/${DAILY_NEW_CHAT_LIMIT}`} />
          <Stat label="전체 대화" value={String(state.conversations.length)} />
          <Stat label="Connect" value={String(connected)} />
        </div>

        <Card>
          <Row label="관심사" href={edit(3)}>
            {me.interests.length ? <InterestChips ids={me.interests} /> : <Empty />}
          </Row>
        </Card>

        <Card className="space-y-4">
          <Row label="언어" href={edit(1)}>
            <p className="text-sm">
              {LANGUAGES[me.nativeLanguage].flag} {LANGUAGES[me.nativeLanguage].name} (모국어)
              {me.learningLanguages.length > 0 &&
                ` · ${me.learningLanguages.map((l) => LANGUAGES[l].name).join(", ")} 공부 중`}
            </p>
            <p className="text-xs text-muted">
              {partnerLang.name} 수준: {LANGUAGE_LEVELS.find((l) => l.id === me.partnerLanguageLevel)?.label}
            </p>
          </Row>
          <Row label="대화 스타일" href={edit(6)}>
            <p className="text-sm text-ink-soft">
              {me.styles.map((s) => CHAT_STYLES.find((x) => x.id === s)?.icon).join(" ")}{" "}
              {CHAT_SPEEDS.find((s) => s.id === me.speed)?.label}
            </p>
          </Row>
          <Row label="만남 목적" href={edit(5)}>
            <PurposeBadge purpose={me.purpose} />
          </Row>
        </Card>

        <Card>
          <SectionLabel>인증 상태 (데모)</SectionLabel>
          <VerificationBadges v={me.verification} />
          <p className="mt-3 text-xs text-muted">본인·사진 인증은 3단계에서 전문 인증 서비스와 연동할 예정이에요.</p>
        </Card>

        <ButtonLink href={edit(0)} block variant="secondary">
          ✏️ 프로필 전체 수정
        </ButtonLink>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper p-3">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

function Row({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>{label}</SectionLabel>
        <Link href={href} className="text-xs font-semibold text-sea">
          수정
        </Link>
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted">아직 선택하지 않았어요.</p>;
}
