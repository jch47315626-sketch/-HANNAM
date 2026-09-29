"use client";

import { useState } from "react";
import { DAILY_NEW_CHAT_LIMIT } from "@/data/config";
import { AppShell, TopBar } from "@/components/shell";
import { Button, Card } from "@/components/ui";
import { useStore } from "@/lib/store";

const FEATURES = [
  { icon: "💬", title: "하루 새로운 대화 늘리기", desc: `${DAILY_NEW_CHAT_LIMIT}명 → 30명` },
  { icon: "🎟️", title: "추가 신규 대화권", desc: "필요할 때 한 명씩 더" },
  { icon: "🔎", title: "고급 필터", desc: "언어 수준, 대화 스타일로 찾기" },
  { icon: "📘", title: "언어 학습 기능 강화", desc: "단어 뜻, 표현 저장, 학습 통계" },
  { icon: "🌐", title: "번역 고급화", desc: "자연스러운 표현 제안" },
];

export default function PremiumPage() {
  return (
    <AppShell>
      <Premium />
    </AppShell>
  );
}

function Premium() {
  const { usedToday } = useStore();
  const [notice, setNotice] = useState(false);
  return (
    <>
      <TopBar title="더 많은 대화" back={true} />
      <div className="space-y-4 px-5 py-6">
        <div className="text-center">
          <p className="text-4xl" aria-hidden>
            🌏
          </p>
          <h1 className="mt-2 text-2xl font-bold">한남일녀 Premium</h1>
          <p className="mt-1 text-sm text-muted">
            오늘의 새로운 대화 {usedToday.length} / {DAILY_NEW_CHAT_LIMIT}명 사용
          </p>
        </div>

        <Card className="space-y-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>
                {f.icon}
              </span>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </Card>

        <p className="rounded-2xl bg-paper p-3 text-center text-xs text-muted">
          가격과 기능은 실제 사용자 테스트 후 결정돼요. 무료 사용자도 이미 대화 중인 상대와는 제한 없이 이야기할 수 있어요.
        </p>

        <Button block size="lg" onClick={() => setNotice(true)}>
          준비 중이에요
        </Button>
        {notice && (
          <p role="status" className="text-center text-sm text-sea">
            ✓ 1단계 데모에서는 결제를 지원하지 않아요. 출시 알림을 받을 수 있게 준비할게요!
          </p>
        )}
      </div>
    </>
  );
}
