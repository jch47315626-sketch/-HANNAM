import { expect, test, type Page } from "@playwright/test";

/**
 * 1단계 완료 기준 시나리오 (MASTER SPEC §51, K-MATCH §112~114, §124)
 */

async function startAs(page: Page, name: RegExp) {
  await page.goto("/");
  await page.getByRole("link", { name: "대화 시작하기" }).click();
  await page.getByRole("button", { name }).click();
  await expect(page.getByRole("heading", { name: "프로필 확인" })).toBeVisible();
  await page.getByRole("button", { name: "이 프로필로 시작하기" }).click();
  await expect(page.getByRole("heading", { name: "오늘, 무슨 얘기할래?" })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  (page as unknown as { __errors: string[] }).__errors = errors;
});

test.afterEach(async ({ page }) => {
  const errors = (page as unknown as { __errors: string[] }).__errors.filter(
    (e) => !e.includes("pretendard") && !e.includes("net::ERR"),
  );
  expect(errors, "콘솔 오류 없음").toEqual([]);
});

test("Happy path: 주제 → 추천 → 채팅 → 번역 → Connect → 사진 공개", async ({ page }) => {
  await startAs(page, /민준/);
  await expect(page.getByText("0 / 10").first()).toBeVisible();

  // 주제 → 바로 추천 (추천 질문 없음)
  await page.getByRole("link", { name: /여행/ }).first().click();

  // 추천: 사진 잠금, Yuki 추천
  await expect(page.getByText("이야기가 잘 맞을 사람을")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Yuki · 28/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "Yuki의 사진 (잠김)" })).toBeVisible();
  await page.getByRole("button", { name: "이 사람과 이야기하기" }).click();

  // 채팅: 추천 질문 없이 빈 방에서 시작
  await expect(page.getByText("오늘의 질문")).toHaveCount(0);
  await page.getByRole("button", { name: "준비된 문장" }).click();
  await page.getByRole("button", { name: "안녕하세요! 반가워요 😊" }).click();
  // 번역 ON: 번역만 보이고 일본어 원문은 숨김
  await expect(page.getByText("서울의 경복궁에 가보고 싶어요! 한복도 입어보고 싶어요.")).toBeVisible();
  await expect(page.getByText("ソウルの景福宮に行ってみたいです！韓服も着てみたいです。")).toBeHidden();
  await page.getByRole("button", { name: /원문 보기/ }).first().click();
  await expect(page.getByText("ソウルの景福宮に行ってみたいです！韓服も着てみたいです。")).toBeVisible();

  // 번역 OFF: 원문만 + 번역 보기
  await page.getByRole("switch", { name: "번역" }).click();
  await expect(page.getByText("ソウルの景福宮に行ってみたいです！韓服も着てみたいです。")).toBeVisible();
  await expect(page.getByText("서울의 경복궁에 가보고 싶어요! 한복도 입어보고 싶어요.")).toBeHidden();
  await page.getByRole("button", { name: "🌐 번역 보기" }).first().click();
  await expect(page.getByText("서울의 경복궁에 가보고 싶어요! 한복도 입어보고 싶어요.")).toBeVisible();

  // 이어가기 제안도 나오지 않음
  await page.getByRole("button", { name: "준비된 문장" }).click();
  await page.getByRole("button", { name: "저도 정말 좋아해요!" }).click();
  await expect(page.getByText("去年、釜山に行きました。海がとてもきれいでした！")).toBeVisible();
  await page.waitForTimeout(5000);
  await expect(page.getByText("이야기를 계속해볼까요?")).toHaveCount(0);
  await expect(page.getByText("사진 공개까지")).toHaveCount(0);

  // 준비된 문장으로 대화 더 나누기
  await page.getByRole("button", { name: "준비된 문장" }).click();
  await page.getByRole("button", { name: "우와, 재미있네요!" }).click();
  await expect(page.getByText("私は海派です！夏になると海に行きたくなります。")).toBeVisible();

  // Connect: 메시지 100개 전에는 제안도, 남은 개수 안내도 없음
  await expect(page.getByText(/더 이야기하고 싶나요/)).toHaveCount(0);
  await expect(page.getByText(/개 더 나누면/)).toHaveCount(0);
  await page.getByRole("link", { name: /Yuki · 28/ }).click();
  await page.getByRole("button", { name: /메시지 100개를 주고받은 것으로/ }).click();
  await page.goBack();
  await expect(page.getByText(/더 이야기하고 싶나요/)).toBeVisible();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText(/Connect를 보냈어요/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Connect!" })).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: "Yuki의 프로필 보기" }).click();

  // Connect만으로는 사진이 공개되지 않음 (상세 프로필만 공개)
  await expect(page.getByRole("img", { name: "사진 비공개" })).toBeVisible();
  await expect(page.getByText("✓ 사진 인증")).toBeVisible();

  // 3일 동안 매일 대화 + 72시간 경과 → 사진 공개 (진행 상황은 프로필 화면에서 확인)
  await expect(page.getByText("✓ 1일차")).toBeVisible();
  for (const [phrase, day] of [["오늘 하루는 어땠어요?", "2일차"], ["천천히 이야기해도 괜찮아요.", "3일차"]] as const) {
    await page.getByRole("button", { name: /하루 지난 것으로 만들기/ }).click();
    await page.goBack();
    await page.getByRole("button", { name: "준비된 문장" }).click();
    await page.getByRole("button", { name: phrase }).click();
    await expect(page.getByLabel("Yuki이(가) 입력 중")).toBeHidden({ timeout: 5000 });
    await page.waitForTimeout(2500);
    await page.getByRole("link", { name: /Yuki · 28/ }).click();
    await expect(page.getByText(`✓ ${day}`)).toBeVisible();
  }
  await page.getByRole("button", { name: /하루 지난 것으로 만들기/ }).click();
  await expect(page.getByRole("img", { name: "Yuki의 사진 (가상 일러스트)" })).toBeVisible();
  await expect(page.getByText("사진 공개까지")).toHaveCount(0);

  // 대화 목록
  await page.goto("/conversations");
  await expect(page.getByText("🤝 Connect").first()).toBeVisible();
  await expect(page.getByText("1 / 10")).toBeVisible();
});

test("사진 공개 조건: 3일 매일 대화한 상대(Rina)는 사진이 보이고, 1일차 상대(Mio)는 잠김", async ({ page }) => {
  await startAs(page, /민준/);
  await page.goto("/profile?id=jp_004");
  await expect(page.getByRole("img", { name: "Rina의 사진 (가상 일러스트)" })).toBeVisible();
  await page.goto("/profile?id=jp_003");
  await expect(page.getByRole("img", { name: "사진 비공개" })).toBeVisible();
});

test("안전: 지난 대화 → 신고 → 접수 완료 → 차단", async ({ page }) => {
  await startAs(page, /민준/);
  await page.goto("/conversations?tab=past");
  await expect(page.getByText("Aiko")).toBeVisible();
  await page.getByRole("link", { name: "🚩 신고하기" }).first().click();
  await expect(page.getByRole("heading", { name: /신고하는 이유/ })).toBeVisible();
  await page.getByLabel("외부 메신저 이동 강요").check();
  await page.getByPlaceholder("어떤 일이 있었는지 알려주세요.").fill("라인 아이디를 계속 요구했어요.");
  await page.getByRole("button", { name: "신고 제출" }).click();
  await expect(page.getByText("신고가 접수되었습니다.")).toBeVisible();

  await page.getByRole("button", { name: /차단하기/ }).click();
  await page.getByRole("button", { name: "차단", exact: true }).click();
  await page.getByRole("button", { name: "확인" }).click();
  await expect(page.getByText("차단됨").first()).toBeVisible();
});

test("제한: 9/10 → 10/10 → Daily Limit → Premium", async ({ page }) => {
  await startAs(page, /민준/);
  await page.goto("/settings");
  await page.getByRole("button", { name: "9/10" }).click();
  await page.goto("/discover?topic=food");
  await page.getByRole("button", { name: "이 사람과 이야기하기" }).click();
  await expect(page.getByText("먼저 인사해보세요")).toBeVisible();

  await page.goto("/discover?topic=music");
  await expect(page.getByText("10 / 10")).toBeVisible();
  await page.getByRole("button", { name: "이 사람과 이야기하기" }).click();
  await expect(page.getByText("오늘의 새로운 대화가 모두 사용됐어요.")).toBeVisible();
  await page.getByRole("button", { name: "더 많은 대화 알아보기" }).click();
  await expect(page.getByRole("heading", { name: "한남일녀 Premium" })).toBeVisible();
});

test("차단한 상대와는 다시 대화할 수 없음", async ({ page }) => {
  await startAs(page, /민준/);
  await page.goto("/conversations");
  await page.getByText("Mio").click();
  await page.getByRole("button", { name: "대화 메뉴" }).click();
  await page.getByRole("button", { name: "⛔ 차단하기" }).click();
  await page.getByRole("button", { name: "차단", exact: true }).click();
  await expect(page.getByText("차단한 상대예요. 메시지를 주고받을 수 없어요.")).toBeVisible();
  await expect(page.getByPlaceholder("메시지를 입력하세요...")).toHaveCount(0);
});

test("일본 사용자(Yuki)로 시작: 한국어 메시지가 일본어로 번역", async ({ page }) => {
  await startAs(page, /Yuki/);
  await page.getByRole("link", { name: /음식 & 카페/ }).click();
  await page.getByRole("button", { name: "이 사람과 이야기하기" }).click();
  await page.getByRole("button", { name: "준비된 문장" }).click();
  await page.getByRole("button", { name: "こんにちは！よろしくお願いします😊" }).click();
  await expect(page.getByText("僕はラーメンが本当に好きです！日本に行ったら一番に食べたいです。")).toBeVisible();
  await expect(page.getByText("저는 라멘을 정말 좋아해요! 일본에 가면 제일 먼저 먹고 싶어요.")).toBeHidden();
});

test("직접 가입: 온보딩 7단계 → 빈 대화 목록", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /직접 만들어보기/ }).click();
  await page.getByPlaceholder("예: 민준").fill("테스터");
  await page.getByLabel(/19세 이상 성인입니다/).check();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "다음" }).click(); // 기본, 언어, MBTI
  await page.getByRole("button", { name: /맛집$/ }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "다음" }).click(); // 관심사, 이유, 목적
  await page.getByRole("button", { name: /일상적인 이야기/ }).click();
  await page.getByRole("button", { name: "오늘의 대화 주제 보러 가기" }).click();
  await expect(page.getByRole("heading", { name: "오늘, 무슨 얘기할래?" })).toBeVisible();
  await page.goto("/conversations?tab=past");
  await expect(page.getByText("아직 지난 대화가 없습니다.")).toBeVisible();
});
