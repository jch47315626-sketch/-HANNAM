"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CHAT_STYLES, COUNTRIES, LANGUAGES, REASONS } from "@/data/config";
import { AppShell, TopBar } from "@/components/shell";
import { InterestChips, LockedPhoto, PurposeBadge, VerificationBadges } from "@/components/profile";
import { BlockDialog } from "@/components/safety";
import { Button, ButtonLink, Card, EmptyState, SectionLabel } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  return (
    <AppShell>
      <Suspense>
        <PublicProfile />
      </Suspense>
    </AppShell>
  );
}

function PublicProfile() {
  const params = useSearchParams();
  const { me, getUser, conversationWith, isBlocked, unblock } = useStore();
  const [blockOpen, setBlockOpen] = useState(false);
  const user = getUser(params.get("id") ?? "");

  if (!me || !user || user.id === me.id) {
    return (
      <>
        <TopBar title="프로필" back={true} />
        <EmptyState icon="👤" title="프로필을 찾을 수 없어요." />
      </>
    );
  }

  const conv = conversationWith(user.id);
  const revealed = conv?.status === "CONNECTED";
  const blocked = isBlocked(user.id);
  const country = COUNTRIES[user.country];
  const myCountryName = COUNTRIES[me.country].name;

  return (
    <>
      <TopBar title={`${user.nickname}의 프로필`} back={true} />
      <div className="space-y-4 px-5 py-5">
        <LockedPhoto user={user} revealed={revealed} />

        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {user.nickname} · {user.age}
          </h1>
          <p className="text-sm text-muted">
            {country.flag} {user.city} · {user.mbti === "UNKNOWN" ? "MBTI 비공개" : user.mbti}
          </p>
          <PurposeBadge purpose={user.purpose} className="mt-2" />
        </div>

        {revealed && (
          <p className="rounded-2xl bg-sun-soft p-3 text-center text-sm text-[#7a5200]">
            ✨ 서로 Connect해서 프로필과 사진이 공개됐어요.
          </p>
        )}

        <Card>
          <SectionLabel>소개</SectionLabel>
          <p className="leading-relaxed">{user.bio}</p>
          {revealed ? (
            user.detailedBio && <p className="mt-3 leading-relaxed text-ink-soft">{user.detailedBio}</p>
          ) : (
            <p className="mt-3 rounded-2xl bg-cream p-3 text-xs text-muted">🔒 상세 소개는 서로 Connect하면 볼 수 있어요.</p>
          )}
        </Card>

        <Card>
          <SectionLabel>관심사</SectionLabel>
          <InterestChips ids={user.interests} highlight={user.interests.filter((i) => me.interests.includes(i))} />
          <div className="mt-4">
            <SectionLabel>{myCountryName}에 관심을 갖게 된 이유</SectionLabel>
            <p className="text-sm text-ink-soft">
              {user.reasons
                .map((r) => REASONS.find((x) => x.id === r)?.label(myCountryName))
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="mt-4">
            <SectionLabel>좋아하는 대화</SectionLabel>
            <p className="text-sm text-ink-soft">
              {user.styles
                .map((s) => CHAT_STYLES.find((x) => x.id === s))
                .map((s) => s && `${s.icon} ${s.label}`)
                .join(" · ")}
            </p>
          </div>
        </Card>

        <Card>
          <SectionLabel>언어</SectionLabel>
          <p className="text-sm">
            모국어 {LANGUAGES[user.nativeLanguage].flag} {LANGUAGES[user.nativeLanguage].name}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            사용 언어: {user.languages.map((l) => LANGUAGES[l].name).join(", ")}
          </p>
          {user.learningLanguages.length > 0 && (
            <p className="mt-1 text-sm text-ink-soft">
              배우는 중: {user.learningLanguages.map((l) => `${LANGUAGES[l].flag} ${LANGUAGES[l].name}`).join(", ")}
            </p>
          )}
        </Card>

        {revealed && (
          <Card>
            <SectionLabel>인증 (데모)</SectionLabel>
            <VerificationBadges v={user.verification} />
          </Card>
        )}

        <div className="space-y-2 pt-2">
          {conv && !blocked && (
            <ButtonLink href={`/chat?id=${conv.id}`} block>
              💬 대화로 돌아가기
            </ButtonLink>
          )}
          <div className="grid grid-cols-2 gap-2">
            <ButtonLink href={`/report?user=${user.id}${conv ? `&conv=${conv.id}` : ""}`} variant="secondary">
              🚩 신고하기
            </ButtonLink>
            {blocked ? (
              <Button variant="secondary" onClick={() => unblock(user.id)}>
                차단 해제
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setBlockOpen(true)}>
                ⛔ 차단하기
              </Button>
            )}
          </div>
        </div>
      </div>
      <BlockDialog user={user} open={blockOpen} onClose={() => setBlockOpen(false)} />
    </>
  );
}
