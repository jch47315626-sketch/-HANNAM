"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DAILY_NEW_CHAT_LIMIT } from "@/data/config";
import { AppShell, TopBar } from "@/components/shell";
import { Avatar } from "@/components/profile";
import { Button, Card, Modal, SectionLabel, Switch } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  return (
    <AppShell>
      <Settings />
    </AppShell>
  );
}

function Settings() {
  const router = useRouter();
  const { state, setDemo, setUsageCount, usedToday, getUser, unblock, resetAll } = useStore();
  const [resetOpen, setResetOpen] = useState(false);
  const { demo } = state;

  return (
    <>
      <TopBar title="설정" back="/me" />
      <div className="space-y-4 px-5 py-5">
        <Card className="space-y-4">
          <SectionLabel>번역</SectionLabel>
          <SettingRow
            title="새 대화에서 번역 켜기"
            desc="대화방마다 따로 바꿀 수 있어요. 내 설정은 상대에게 영향을 주지 않아요."
          >
            <Switch checked={demo.defaultTranslation} onChange={(v) => setDemo({ defaultTranslation: v })} label="새 대화 번역 기본값" />
          </SettingRow>
        </Card>

        <Card>
          <SectionLabel>차단 목록</SectionLabel>
          {state.blocks.length === 0 ? (
            <p className="text-sm text-muted">차단한 사람이 없어요.</p>
          ) : (
            <ul className="space-y-2">
              {state.blocks.map((b) => {
                const u = getUser(b.blockedUserId);
                if (!u) return null;
                return (
                  <li key={b.id} className="flex items-center gap-3">
                    <Avatar user={u} size={36} />
                    <span className="flex-1 text-sm font-semibold">{u.nickname}</span>
                    <Button size="sm" variant="secondary" onClick={() => unblock(u.id)}>
                      차단 해제
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <SectionLabel>신고 내역</SectionLabel>
          {state.reports.length === 0 ? (
            <p className="text-sm text-muted">신고 내역이 없어요.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {state.reports.map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{getUser(r.reportedUserId)?.nickname ?? "알 수 없음"}</span>
                  <span className="text-muted">
                    {r.severity === "serious" ? "긴급 · " : ""}접수됨
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="space-y-4 border-dashed">
          <SectionLabel>🧪 데모 도구</SectionLabel>
          <SettingRow title="오늘의 새 대화 사용량" desc={`현재 ${usedToday.length} / ${DAILY_NEW_CHAT_LIMIT}명`}>
            <div className="flex gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => setUsageCount(DAILY_NEW_CHAT_LIMIT - 1)}>
                9/10
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setUsageCount(0)}>
                초기화
              </Button>
            </div>
          </SettingRow>
          <SettingRow title="추천 오류 상태 보기" desc="상대 추천 화면에서 오류 → 다시 시도 흐름을 확인해요.">
            <Switch
              checked={demo.simulateDiscoverError}
              onChange={(v) => setDemo({ simulateDiscoverError: v })}
              label="추천 오류 시뮬레이션"
            />
          </SettingRow>
          <SettingRow title="번역 실패 상태 보기" desc="받은 메시지에 '번역하지 못했습니다 / 다시 번역'이 표시돼요.">
            <Switch
              checked={demo.simulateTranslationError}
              onChange={(v) => setDemo({ simulateTranslationError: v })}
              label="번역 실패 시뮬레이션"
            />
          </SettingRow>
          <Button block variant="secondary" onClick={() => setResetOpen(true)}>
            데모 초기화 (처음으로)
          </Button>
        </Card>

        <Card>
          <SectionLabel>안내</SectionLabel>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted">
            <li>• 한남일녀는 만 19세 이상 성인만 이용할 수 있어요.</li>
            <li>• 이 화면은 1단계 클릭 프로토타입이며, 실제 회원가입·결제·번역·인증 기능은 없습니다.</li>
            <li>• 모든 사용자, 사진, 대화는 가상 데이터입니다.</li>
            <li>• 이용약관 / 개인정보처리방침은 법률 검토 후 작성될 예정입니다.</li>
          </ul>
        </Card>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="데모를 초기화할까요?">
        <p className="text-sm text-ink-soft">이 브라우저에 저장된 대화, 신고, 차단 기록이 모두 지워지고 첫 화면으로 돌아가요.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            취소
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetAll();
              router.push("/");
            }}
          >
            초기화
          </Button>
        </div>
      </Modal>
    </>
  );
}

function SettingRow({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {desc && <p className="text-xs text-muted">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
