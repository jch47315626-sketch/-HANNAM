"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { COUNTRIES, PURPOSES } from "@/data/config";
import { getTopic } from "@/data/topics";
import { AppShell, DailyCounter, TopBar } from "@/components/shell";
import { Avatar, InterestChips, LanguageLine, NameLine } from "@/components/profile";
import { DailyLimitModal } from "@/components/safety";
import { Button, ButtonLink, EmptyState, Loading } from "@/components/ui";
import type { Recommendation } from "@/services/matching";
import { useStore } from "@/lib/store";

export default function DiscoverPage() {
  return (
    <AppShell>
      <Suspense>
        <Discover />
      </Suspense>
    </AppShell>
  );
}

type Phase = "loading" | "error" | "ready";

function Discover() {
  const params = useSearchParams();
  const router = useRouter();
  const store = useStore();
  const { me, state, startConversation } = store;
  const topicId = params.get("topic") ?? undefined;
  const topic = getTopic(topicId);

  const [phase, setPhase] = useState<Phase>("loading");
  const [attempt, setAttempt] = useState(0);
  const [list, setList] = useState<Recommendation[]>([]);
  const [index, setIndex] = useState(0);
  const [limitOpen, setLimitOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (store.state.demo.simulateDiscoverError && attempt === 0) {
        setPhase("error");
        return;
      }
      setList(store.recommendations(topicId));
      setIndex(0);
      setPhase("ready");
    }, 900);
    return () => window.clearTimeout(t);
    // 추천 목록은 화면 진입 시점 기준으로 고정한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, attempt]);

  if (!me) return null;
  const rec = list[index];
  const partnerCountry = rec ? COUNTRIES[rec.user.country] : undefined;

  const start = () => {
    if (!rec || !topicId) return;
    const result = startConversation(rec.user.id, topicId);
    if (result.ok) router.push(`/chat?id=${result.conversationId}`);
    else if (result.reason === "limit") setLimitOpen(true);
  };

  return (
    <>
      <TopBar
        title={topic ? `${topic.icon} ${topic.name.ko}` : "대화 상대"}
        back="/home"
        right={<DailyCounter compact />}
      />
      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        {phase === "loading" && <Loading label={"💬 이야기가 잘 맞을 사람을\n찾고 있어요..."} />}

        {phase === "error" && (
          <EmptyState
            icon="📡"
            title="대화 상대를 불러오지 못했어요."
            description="잠시 후 다시 시도해주세요."
            action={
              <Button
                block
                onClick={() => {
                  setPhase("loading");
                  setAttempt((a) => a + 1);
                }}
              >
                다시 시도
              </Button>
            }
          />
        )}

        {phase === "ready" && list.length === 0 && (
          <EmptyState
            icon="🌙"
            title="아직 새로운 대화 상대가 없어요."
            description={"오늘은 이 주제의 새로운 상대를\n모두 만나봤어요. 다른 주제를 선택해보세요."}
            action={<ButtonLink href="/home" block>다른 주제 보기</ButtonLink>}
          />
        )}

        {phase === "ready" && list.length > 0 && !rec && (
          <EmptyState
            icon="✨"
            title="추천된 사람을 모두 봤어요."
            description="처음부터 다시 보거나 다른 주제를 골라보세요."
            action={
              <div className="space-y-2">
                <Button block onClick={() => setIndex(0)}>
                  처음부터 다시 보기
                </Button>
                <ButtonLink href="/home" block variant="secondary">
                  다른 주제 보기
                </ButtonLink>
              </div>
            }
          />
        )}

        {phase === "ready" && rec && partnerCountry && (
          <>
            <p className="mb-3 text-center text-xs text-muted">
              {index + 1} / {list.length} · 이 주제로 이야기하기 좋은 사람
            </p>
            <article key={rec.user.id} className="animate-fade-up rounded-[28px] border border-line bg-paper p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <Avatar user={rec.user} size={64} />
                <div>
                  <h2 className="text-xl font-bold">
                    <NameLine user={rec.user} />
                  </h2>
                  <p className="text-sm text-muted">
                    {rec.user.city} · {rec.user.mbti === "UNKNOWN" ? "MBTI 비공개" : rec.user.mbti}
                  </p>
                </div>
              </div>

              {!rec.purposeMatch && (
                <p className="mt-3 text-xs text-muted">나와 만남 목적이 달라요 (나: {PURPOSES[me.purpose].icon} {PURPOSES[me.purpose].label})</p>
              )}

              <p className="mt-4 leading-relaxed text-ink">“{rec.user.bio}”</p>

              <div className="mt-4">
                <InterestChips ids={rec.user.interests} highlight={rec.commonInterests} />
              </div>

              <div className="mt-4">
                <LanguageLine user={rec.user} />
              </div>

              {rec.reasons.length > 0 && (
                <ul className="mt-4 space-y-1 rounded-2xl bg-sea-soft/60 p-3 text-sm text-sea">
                  {rec.reasons.map((r) => (
                    <li key={r}>✓ {r}</li>
                  ))}
                </ul>
              )}


              <p className="mt-4 text-center text-xs text-muted">🔒 사진은 첫 채팅 후 3일 동안 매일 대화하면 공개돼요</p>
            </article>

            <div className="mt-auto space-y-2 pt-6">
              <Button block size="lg" onClick={start}>
                이 사람과 이야기하기
              </Button>
              <Button block variant="ghost" onClick={() => setIndex((i) => i + 1)}>
                다른 사람 보기
              </Button>
              <p className="text-center text-[11px] text-muted">
                새로운 사람과 대화를 시작하면 오늘의 대화가 1 차감돼요. (남은 횟수 {store.remainingToday})
              </p>
            </div>
          </>
        )}
      </div>
      <DailyLimitModal open={limitOpen} onClose={() => setLimitOpen(false)} />
      {state.demo.simulateDiscoverError && phase === "error" && (
        <p className="pb-4 text-center text-[11px] text-muted">설정 › 데모 도구에서 오류 시뮬레이션을 켜둔 상태예요.</p>
      )}
    </>
  );
}
