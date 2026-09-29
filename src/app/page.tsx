"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell";
import { Button, ButtonLink } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function WelcomePage() {
  const { state, me } = useStore();
  const router = useRouter();
  const canResume = state.hydrated && me && state.onboarded;

  return (
    <AppShell guard="none">
      <div className="relative flex flex-1 flex-col overflow-hidden px-6 pb-10 pt-16">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sun-soft" />
        <div aria-hidden className="pointer-events-none absolute -left-20 top-64 h-56 w-56 rounded-full bg-sea-soft" />

        <div className="relative">
          <p className="text-sm font-semibold tracking-widest text-sea">HAN-NAM IL-NYEO</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            한남일녀 <span aria-hidden>🌏</span>
          </h1>
        </div>

        <div className="relative mt-16 space-y-3" aria-hidden>
          <div className="w-fit animate-fade-up rounded-3xl rounded-bl-md bg-paper px-4 py-3 shadow-sm">
            <p lang="ja">今日はカフェに行きました！</p>
            <p className="mt-1 border-t border-line pt-1 text-sm text-sea">오늘 카페에 갔어요!</p>
          </div>
          <div className="ml-auto w-fit animate-fade-up rounded-3xl rounded-br-md bg-sea px-4 py-3 text-white shadow-sm [animation-delay:0.2s]">
            어떤 카페였어요? ☕
          </div>
        </div>

        <div className="relative mt-auto pt-16">
          <p className="text-[28px] font-extrabold leading-snug">
            오늘, 누구랑
            <br />
            무슨 얘기할래?
          </p>
          <p className="mt-3 text-lg font-semibold text-brand">얼굴보다 먼저, 대화.</p>
          <p className="mt-1 text-sm text-muted">언어가 달라도 이야기는 통할 수 있으니까.</p>

          <div className="mt-8 space-y-2">
            {canResume ? (
              <>
                <Button block size="lg" onClick={() => router.push("/home")}>
                  {me.nickname}(으)로 계속하기
                </Button>
                <ButtonLink href="/demo" block variant="secondary">
                  다른 데모로 시작하기
                </ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink href="/demo" block size="lg">
                  대화 시작하기
                </ButtonLink>
                <ButtonLink href="/demo" block variant="ghost">
                  이미 계정이 있어요
                </ButtonLink>
              </>
            )}
          </div>
          <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
            클릭 가능한 1단계 프로토타입입니다. 모든 사용자와 대화는 가상 데이터이며,
            <br />
            입력한 정보는 이 브라우저에만 저장됩니다.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
