"use client";

import { useRouter } from "next/navigation";
import { DAILY_NEW_CHAT_LIMIT } from "@/data/config";
import { useStore } from "@/lib/store";
import { Button, Modal } from "@/components/ui";
import type { UserProfile } from "@/types";

export function BlockDialog({
  user,
  open,
  onClose,
  onDone,
}: {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
}) {
  const { block } = useStore();
  return (
    <Modal open={open} onClose={onClose} title={`${user.nickname}을(를) 차단할까요?`}>
      <p className="text-sm text-ink-soft">차단하면:</p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
        <li>• 새로운 메시지를 받을 수 없습니다.</li>
        <li>• 새로운 대화를 시작할 수 없습니다.</li>
        <li>• 서로의 추천 목록에서 제외됩니다.</li>
        <li>• 상대에게 차단 사실을 알리지 않습니다.</li>
      </ul>
      <p className="mt-3 rounded-2xl bg-cream p-3 text-xs text-muted">차단은 신고와 별개예요. 차단한 뒤에도 신고할 수 있어요.</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            block(user.id);
            onClose();
            onDone?.();
          }}
        >
          차단
        </Button>
      </div>
    </Modal>
  );
}

export function DailyLimitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <p className="text-4xl" aria-hidden>
          🌙
        </p>
        <h2 className="mt-3 text-xl font-bold">오늘의 새로운 대화가 모두 사용됐어요.</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          오늘은 {DAILY_NEW_CHAT_LIMIT}명의 새로운 사람과 이야기를 나눴습니다.
          <br />
          내일 다시 {DAILY_NEW_CHAT_LIMIT}명과 대화할 수 있어요.
        </p>
        <p className="mt-2 text-xs text-muted">이미 대화 중인 상대와는 계속 이야기할 수 있어요.</p>
        <div className="mt-6 space-y-2">
          <Button block onClick={() => router.push("/conversations")}>
            내 대화 보기
          </Button>
          <Button block variant="secondary" onClick={() => router.push("/premium")}>
            더 많은 대화 알아보기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
