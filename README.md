# 한남일녀 (HAN-NAM IL-NYEO) — 1단계 클릭 프로토타입

> **얼굴보다 먼저, 대화.**
> 사진을 먼저 평가하지 않고, 오늘 이야기하고 싶은 **주제**를 골라 그 주제를 좋아하는 사람과 1:1로 대화한다.
> 번역이 도와주고, 대화가 잘 맞으면 **Connect**로 상세 프로필이 공개된다.
> 사진은 **첫 채팅 후 72시간이 지나고 3일 동안 매일 대화**해야 공개된다.

기준 문서: [`docs/MASTER_PROJECT_SPEC.md`](docs/MASTER_PROJECT_SPEC.md), [`docs/K_MATCH_PROJECT_SPEC.md`](docs/K_MATCH_PROJECT_SPEC.md)

## 실행

```bash
npm install
npm run dev          # http://localhost:3000
```

| 명령 | 설명 |
|---|---|
| `npm run build` / `npm start` | 프로덕션 빌드 / 실행 (모든 페이지 정적 생성) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 검사 |
| `npm run test:e2e` | Playwright로 핵심 시나리오 7개 브라우저 테스트 |
| `npm run build:artifact` | Claude 앱에서 열 수 있는 단일 HTML(`artifact/dist/`) 빌드 |

## 1단계 범위

**서버·실제 로그인·결제·번역 API·본인 인증·신고 서버 없음.** 모든 데이터는 Mock이며 브라우저 `localStorage`에만 저장된다.

| 기능 | 구현 |
|---|---|
| Welcome / 데모 사용자 선택 (민준 🇰🇷, Yuki 🇯🇵) / 직접 가입 | ✅ |
| 온보딩 7단계: 기본 프로필(성인 확인) · 언어 · MBTI · 관심사(최대 5) · 관심 이유 · 만남 목적 · 대화 스타일/속도 | ✅ |
| 오늘의 대화 주제(12) → 오늘의 질문 → 상대 추천 (사진 잠금, 추천 이유) | ✅ |
| 1:1 채팅, 입장 시 오늘의 질문 한 번 추천, Mock 상대 답장 + 입력 중 표시 | ✅ |
| 번역 ON(번역만, [원문 보기]) / OFF(원문+[번역 보기]), **사용자별 설정**, 내 메시지의 상대측 번역 미리보기 | ✅ |
| Connect (메시지 100개 이후 제안, 남은 개수는 표시하지 않음. 데모는 상대 프로필의 `🧪 메시지 100개…` 버튼 → 상대 응답 → 축하 → 상세 소개·인증 배지 공개) | ✅ |
| 사진 공개: 첫 채팅 후 72시간 경과 + 첫날부터 3일 동안 매일 대화(두 사람 모두 메시지). 진행 상황은 상대 프로필 화면에 표시, `🧪 하루 지난 것으로 만들기`로 데모 | ✅ |
| 대화 목록 (대화 중 / 지난 대화), 대화 종료 | ✅ |
| 신고 (13개 사유, 메시지 첨부, 추가 설명, 일반 신고 하루 3건·월 10건, 긴급 사유는 제한 없음) | ✅ |
| 차단 (추천 제외, 메시지·새 대화 불가, 차단 해제) | ✅ |
| 하루 새로운 대화 10명 (같은 상대는 추가 차감 없음) → Daily Limit → Premium Placeholder | ✅ |
| 로딩 / 빈 상태 / 오류 / 번역 실패 상태 (설정 › 데모 도구에서 재현) | ✅ |

### 데모 시나리오

1. **Happy path**: 대화 시작하기 → 민준 → 이 프로필로 시작 → ✈️ 여행 → 질문 선택 → Yuki 추천 → 이 사람과 이야기하기 → 질문 보내기 → 일본어 답장 + 번역 → 번역 OFF → 번역 보기 → (프로필의 `🧪 메시지 100개…`) → Connect → 상세 프로필 공개 → 프로필의 `🧪 하루 지난 것으로 만들기`로 3일 매일 대화 → 사진 공개
   (민준 데모의 Rina, Yuki 데모의 도윤은 이미 3일 대화를 마쳐 사진이 보이는 상태)
2. **안전**: 대화 탭 → 지난 대화 → Aiko 신고하기 → 사유 → 제출 → 차단
3. **제한**: 프로필 › ⚙️ 설정 › 데모 도구 `9/10` → 새 상대와 대화(10/10) → 다른 새 상대 → Daily Limit → Premium

## 구조

```
src/
  types/            도메인 타입 (Supabase 스키마의 기준)
  data/             Mock 데이터: config(국가쌍·제한값), users, topics, scripts(답장·번역문), interests, seed
  services/
    translation.ts  Mock 번역 제공자 + 캐시 (source|target|normalized_text)
    reveal.ts       사진 공개 조건 (72시간 + 3일 매일 대화)
    matching.ts     추천 점수 v1 (주제30·관심사25·스타일15·언어15·관심이유10·MBTI5, 목적 가중치)
  lib/store.tsx     전역 상태(React Context + reducer) · 모든 액션 · localStorage 저장
  components/       ui, shell(레이아웃·하단 메뉴·카운터), profile, chat, connect, safety
  app/              화면 (/, demo, onboarding, home, topic, discover, chat, conversations, connect, profile, report, me, settings, premium)
e2e/                Playwright 시나리오
```

- 국가는 `COUNTRY_PAIR = { source: "KR", target: "JP" }`로 관리하며 화면 문구("일본에 관심을 갖게 된 이유" 등)는 여기서 파생된다. 몽골·카자흐스탄·우즈베키스탄은 "준비 중"으로 표시.
- 메시지는 **원문만 저장**하고 번역은 `Translation` 레코드로 분리 (`services/translation.ts`만 서버 API 호출로 바꾸면 된다).
- 사진은 실제 인물 사진 대신 이모지·그라데이션 일러스트를 사용한다. 모든 인물은 가상이다.
- UI 언어는 1단계에서 한국어만 지원한다 (Yuki로 시작해도 UI는 한국어, 메시지 번역은 일본어로 표시).

## 2단계로 넘어갈 때

- `lib/store.tsx`의 액션을 Supabase(Auth · Postgres · Realtime · Storage) 호출로 교체
- 번역은 서버 라우트에서 전문 번역 API 호출 (API 키는 클라이언트에 두지 않음)
- 추천 제외·차단·신고 권한 확인은 서버(RLS)에서 수행
- 출시 전 법률 검토 체크리스트(MASTER SPEC §37)를 먼저 확인
