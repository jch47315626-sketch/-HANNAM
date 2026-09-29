"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { REPORT_LIMIT_PER_DAY, REPORT_LIMIT_PER_MONTH } from "@/data/config";
import { AppShell, TopBar } from "@/components/shell";
import { BlockDialog } from "@/components/safety";
import { Button, EmptyState } from "@/components/ui";
import { SERIOUS_REASONS, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ReportReason } from "@/types";

const REASONS: { id: ReportReason; label: string }[] = [
  { id: "fraud", label: "금전 요구 / 사기" },
  { id: "fake_profile", label: "가짜 프로필" },
  { id: "stolen_photo", label: "다른 사람 사진 사용" },
  { id: "impersonation", label: "사칭" },
  { id: "sexual_message", label: "성적인 메시지" },
  { id: "sexual_photo_request", label: "성적인 사진 요구 / 전송" },
  { id: "harassment", label: "욕설 / 괴롭힘" },
  { id: "threat", label: "협박" },
  { id: "stalking", label: "스토킹 / 만남 강요" },
  { id: "external_messenger", label: "외부 메신저 이동 강요" },
  { id: "spam", label: "광고 / 스팸" },
  { id: "minor", label: "미성년자로 의심됨" },
  { id: "other", label: "기타" },
];

export default function ReportPage() {
  return (
    <AppShell>
      <Suspense>
        <ReportForm />
      </Suspense>
    </AppShell>
  );
}

function ReportForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { me, getUser, messagesOf, submitReport, reportQuota, isBlocked } = useStore();
  const user = getUser(params.get("user") ?? "");
  const convId = params.get("conv") ?? undefined;

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [attached, setAttached] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  if (!me || !user) {
    return (
      <>
        <TopBar title="신고" back={true} />
        <EmptyState icon="🚩" title="신고할 상대를 찾을 수 없어요." />
      </>
    );
  }

  if (done) {
    return (
      <>
        <TopBar title="신고 완료" />
        <div className="flex flex-1 flex-col px-6 py-10 text-center">
          <p className="text-5xl" aria-hidden>
            🛡️
          </p>
          <h1 className="mt-4 text-xl font-bold">신고가 접수되었습니다.</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            제출해주신 내용은
            <br />
            안전한 서비스 운영을 위해 검토됩니다.
            <br />
            필요한 경우 관련 대화가 검토될 수 있습니다.
          </p>
          <p className="mt-4 rounded-2xl bg-paper p-3 text-xs text-muted">
            신고만으로 제재가 확정되지는 않아요. 신고 누적 → 위험도 확인 → 관리자 검토 → 위반 확인 후 조치됩니다.
            (데모에서는 실제로 접수되지 않아요.)
          </p>
          <div className="mt-auto space-y-2 pt-8">
            {!isBlocked(user.id) && (
              <Button block variant="secondary" onClick={() => setBlockOpen(true)}>
                ⛔ {user.nickname} 차단하기
              </Button>
            )}
            <Button block onClick={() => router.push("/conversations?tab=past")}>
              확인
            </Button>
          </div>
        </div>
        <BlockDialog user={user} open={blockOpen} onClose={() => setBlockOpen(false)} />
      </>
    );
  }

  const theirMessages = convId ? messagesOf(convId).filter((m) => m.senderId === user.id) : [];
  const serious = reason ? SERIOUS_REASONS.includes(reason) : false;

  return (
    <>
      <TopBar title="신고하기" back={true} />
      <form
        className="flex flex-1 flex-col px-5 py-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason) return;
          const res = submitReport({ reportedUserId: user.id, conversationId: convId, messageIds: attached, reason, description });
          if (res.ok) setDone(true);
          else
            setError(
              res.reason === "day"
                ? `일반 신고는 하루 ${REPORT_LIMIT_PER_DAY}건까지 가능해요. 심각한 안전 문제는 제한 없이 신고할 수 있어요.`
                : `일반 신고는 한 달에 ${REPORT_LIMIT_PER_MONTH}건까지 가능해요.`,
            );
        }}
      >
        <h1 className="text-xl font-bold">{user.nickname}을(를) 신고하는 이유</h1>
        <p className="mt-1 text-xs text-muted">
          지난 대화 상대도 신고할 수 있어요. 오늘 일반 신고 {reportQuota.today}/{REPORT_LIMIT_PER_DAY} · 이번 달{" "}
          {reportQuota.month}/{REPORT_LIMIT_PER_MONTH}
        </p>

        <fieldset className="mt-5 space-y-2">
          <legend className="sr-only">신고 사유</legend>
          {REASONS.map((r) => (
            <label
              key={r.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-paper px-4 py-3 text-sm",
                reason === r.id ? "border-danger" : "border-line",
              )}
            >
              <input
                type="radio"
                name="reason"
                className="accent-[var(--color-danger)]"
                checked={reason === r.id}
                onChange={() => {
                  setReason(r.id);
                  setError(null);
                }}
              />
              <span className="flex-1">{r.label}</span>
              {SERIOUS_REASONS.includes(r.id) && <span className="text-[10px] text-danger">긴급</span>}
            </label>
          ))}
        </fieldset>

        {serious && (
          <p className="mt-3 rounded-2xl bg-danger-soft p-3 text-xs text-danger">
            심각한 안전 문제로 분류되어 우선 검토됩니다. 즉각적인 위험이 있다면 현지 경찰(한국 112 / 일본 110)에 먼저 연락하세요.
          </p>
        )}

        {theirMessages.length > 0 && (
          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold">
              관련 메시지 첨부 <span className="font-normal text-muted">(선택)</span>
            </legend>
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {theirMessages.map((m) => (
                <label key={m.id} className="flex items-start gap-2 rounded-xl bg-paper px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={attached.includes(m.id)}
                    onChange={() => setAttached((a) => (a.includes(m.id) ? a.filter((x) => x !== m.id) : [...a, m.id]))}
                  />
                  <span lang={m.originalLanguage}>{m.originalText}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-semibold">
            추가 설명 <span className="font-normal text-muted">(선택)</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-sea"
            placeholder="어떤 일이 있었는지 알려주세요."
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-auto pt-6">
          <Button type="submit" block size="lg" variant="danger" disabled={!reason}>
            신고 제출
          </Button>
        </div>
      </form>
    </>
  );
}
