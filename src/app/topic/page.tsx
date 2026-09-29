"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getTopic } from "@/data/topics";
import { AppShell, DailyCounter, TopBar } from "@/components/shell";
import { Button, EmptyState, ButtonLink } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TopicPage() {
  return (
    <AppShell>
      <Suspense>
        <TopicQuestions />
      </Suspense>
    </AppShell>
  );
}

function TopicQuestions() {
  const params = useSearchParams();
  const router = useRouter();
  const { me } = useStore();
  const topic = getTopic(params.get("id"));
  const [selected, setSelected] = useState<string | null>(null);

  if (!topic || !me) {
    return (
      <>
        <TopBar title="오늘의 질문" back="/home" />
        <EmptyState icon="🧭" title="주제를 찾을 수 없어요." action={<ButtonLink href="/home" block>다른 주제 보기</ButtonLink>} />
      </>
    );
  }

  const chosen = selected ?? topic.questions[0].id;

  return (
    <>
      <TopBar title={`${topic.icon} ${topic.name.ko}`} back="/home" right={<DailyCounter compact />} />
      <div className="flex flex-1 flex-col px-5 pb-6 pt-6">
        <p className="text-sm font-semibold text-sea">오늘의 질문</p>
        <h1 className="mt-1 text-2xl font-bold">어떤 질문으로 시작할까요?</h1>
        <p className="mt-1 text-sm text-muted">고른 질문이 첫 메시지가 돼요. 상대에게는 번역되어 전달돼요.</p>

        <div className="mt-6 space-y-3" role="radiogroup" aria-label="오늘의 질문">
          {topic.questions.map((q) => {
            const sel = chosen === q.id;
            const mine = q.text[me.nativeLanguage] ?? q.text.ko;
            return (
              <button
                key={q.id}
                role="radio"
                aria-checked={sel}
                onClick={() => setSelected(q.id)}
                className={cn(
                  "w-full rounded-3xl border-2 bg-paper p-5 text-left transition",
                  sel ? "border-sea shadow-sm" : "border-transparent",
                )}
              >
                <p className="text-[17px] font-semibold leading-snug">“{mine}”</p>
                {sel && me.nativeLanguage !== "ja" && q.text.ja && (
                  <p className="mt-2 text-sm text-muted" lang="ja">
                    🇯🇵 {q.text.ja}
                  </p>
                )}
                {sel && me.nativeLanguage !== "ko" && (
                  <p className="mt-2 text-sm text-muted" lang="ko">
                    🇰🇷 {q.text.ko}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-8">
          <Button block size="lg" onClick={() => router.push(`/discover?topic=${topic.id}&q=${chosen}`)}>
            이 질문으로 대화 상대 찾기
          </Button>
        </div>
      </div>
    </>
  );
}
