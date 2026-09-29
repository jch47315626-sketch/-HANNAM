"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COUNTRIES, LANGUAGES, PURPOSES } from "@/data/config";
import { DEMO_USER_IDS, getMockUser } from "@/data/users";
import { AppShell, TopBar } from "@/components/shell";
import { Avatar, InterestChips, NameLine, PurposeBadge } from "@/components/profile";
import { Button, Card } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function DemoPage() {
  const { startDemo, startCustom } = useStore();
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);
  const user = picked ? getMockUser(picked) : undefined;

  if (user) {
    return (
      <AppShell guard="none">
        <TopBar title="프로필 확인" back={true} />
        <div className="flex flex-1 flex-col px-5 py-6">
          <Card className="text-center">
            <Avatar user={user} revealed size={88} className="mx-auto" />
            <p className="mt-3 text-xl font-bold">
              <NameLine user={user} />
            </p>
            <p className="text-sm text-muted">
              {COUNTRIES[user.country].flag} {user.city} · {user.mbti}
            </p>
            <div className="mt-3 flex justify-center">
              <PurposeBadge purpose={user.purpose} />
            </div>
            <p className="mt-4 text-sm text-ink-soft">{user.bio}</p>
            <div className="mt-4 flex justify-center">
              <InterestChips ids={user.interests} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-2 text-left text-sm">
              <div className="rounded-2xl bg-cream p-3">
                <dt className="text-xs text-muted">모국어</dt>
                <dd className="font-semibold">
                  {LANGUAGES[user.nativeLanguage].flag} {LANGUAGES[user.nativeLanguage].name}
                </dd>
              </div>
              <div className="rounded-2xl bg-cream p-3">
                <dt className="text-xs text-muted">배우는 언어</dt>
                <dd className="font-semibold">
                  {user.learningLanguages.map((l) => `${LANGUAGES[l].flag} ${LANGUAGES[l].name}`).join(", ")}
                </dd>
              </div>
            </dl>
          </Card>
          <p className="mt-4 text-center text-xs text-muted">
            다른 사람에게는 사진이 잠긴 상태로 보여요. 🔒
            <br />
            {PURPOSES[user.purpose].icon} 만남 목적은 상대가 확인할 수 있어요.
          </p>
          <div className="mt-auto space-y-2 pt-6">
            <Button
              block
              size="lg"
              onClick={() => {
                startDemo(user.id);
                router.push("/home");
              }}
            >
              이 프로필로 시작하기
            </Button>
            <Button
              block
              variant="secondary"
              onClick={() => {
                startDemo(user.id);
                router.push("/onboarding?step=0&from=demo");
              }}
            >
              가입 과정도 둘러보기
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell guard="none">
      <TopBar title="데모 시작" back="/" />
      <div className="flex flex-1 flex-col px-5 py-6">
        <h2 className="text-2xl font-bold">누구로 시작할까요?</h2>
        <p className="mt-1 text-sm text-muted">로그인 없이 가상 사용자로 바로 체험할 수 있어요.</p>

        <ul className="mt-6 space-y-3">
          {DEMO_USER_IDS.map((id) => {
            const u = getMockUser(id)!;
            return (
              <li key={id}>
                <button
                  onClick={() => setPicked(id)}
                  className="flex w-full items-center gap-4 rounded-3xl border border-line bg-paper p-4 text-left transition hover:border-sea/40 hover:shadow-sm"
                >
                  <Avatar user={u} revealed size={56} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      <NameLine user={u} />
                    </p>
                    <p className="truncate text-sm text-muted">{u.bio}</p>
                    <PurposeBadge purpose={u.purpose} className="mt-1.5" />
                  </div>
                  <span aria-hidden className="text-muted">
                    ›
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" /> 또는 <span className="h-px flex-1 bg-line" />
        </div>

        <Button
          block
          variant="secondary"
          onClick={() => {
            startCustom();
            router.push("/onboarding?step=0");
          }}
        >
          ✏️ 내 프로필 직접 만들어보기
        </Button>
        <p className="mt-2 text-center text-xs text-muted">새 프로필은 지난 대화 없이 시작해요.</p>
      </div>
    </AppShell>
  );
}
