"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/profile";
import { Button, Modal } from "@/components/ui";

/** 서로 Connect 되었을 때 어디서든 뜨는 축하 모달 */
export function ConnectCelebration() {
  const { state, me, partnerOf, clearCelebrate, canSeePhoto } = useStore();
  const router = useRouter();
  const conv = state.conversations.find((c) => c.id === state.celebrate);
  const partner = conv ? partnerOf(conv) : undefined;
  if (!conv || !partner || !me) return null;

  return (
    <Modal open onClose={clearCelebrate} hideClose>
      <div className="animate-pop text-center">
        <div className="mb-4 flex items-center justify-center -space-x-3">
          <Avatar user={me} revealed size={72} className="ring-4 ring-paper" />
          <Avatar user={partner} revealed={canSeePhoto(partner.id)} size={72} className="ring-4 ring-paper" />
        </div>
        <p className="text-3xl" aria-hidden>
          🎉
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">Connect!</h2>
        <p className="mt-3 leading-relaxed text-ink-soft">
          두 분 모두 더 이야기하고 싶어해요.
          <br />
          이제 서로의 상세 프로필을
          <br />
          확인할 수 있습니다.
          <span className="mt-2 block text-sm text-muted">📷 사진은 첫 채팅 후 3일 동안 매일 대화하면 공개돼요.</span>
        </p>
        <div className="mt-6 space-y-2">
          <Button
            block
            size="lg"
            onClick={() => {
              clearCelebrate();
              router.push(`/profile?id=${partner.id}`);
            }}
          >
            {partner.nickname}의 프로필 보기
          </Button>
          <Button block variant="ghost" onClick={clearCelebrate}>
            계속 대화하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
