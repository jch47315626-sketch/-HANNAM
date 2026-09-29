"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CHAT_SPEEDS,
  CHAT_STYLES,
  COUNTRIES,
  LANGUAGE_LEVELS,
  LANGUAGES,
  MBTI_TYPES,
  MIN_AGE,
  PURPOSES,
  REASONS,
  partnerCountryOf,
} from "@/data/config";
import { INTEREST_CATEGORIES, INTERESTS, MAX_INTERESTS } from "@/data/interests";
import { AppShell } from "@/components/shell";
import { Button, Chip } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { CountryCode, Gender, LanguageCode, Purpose, UserProfile } from "@/types";

const STEPS = ["기본 프로필", "언어", "MBTI", "관심사", "관심 이유", "만남 목적", "대화 스타일"] as const;

function toggle<T>(list: T[], item: T, max?: number): T[] {
  if (list.includes(item)) return list.filter((x) => x !== item);
  if (max && list.length >= max) return list;
  return [...list, item];
}

export default function OnboardingPage() {
  return (
    <AppShell guard="user">
      <Suspense>
        <Onboarding />
      </Suspense>
    </AppShell>
  );
}

function Onboarding() {
  const { me, updateProfile, completeOnboarding } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const step = Math.min(STEPS.length - 1, Math.max(0, Number(params.get("step") ?? 0)));
  const from = params.get("from");
  if (!me) return null;

  const go = (s: number) => router.push(`/onboarding?step=${s}${from ? `&from=${from}` : ""}`);
  const valid = isStepValid(step, me);
  const last = step === STEPS.length - 1;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 bg-cream/95 px-5 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step === 0 ? router.push(from === "edit" ? "/me" : "/demo") : go(step - 1))}
            className="rounded-full p-2 text-xl leading-none hover:bg-black/5"
            aria-label="이전"
          >
            ←
          </button>
          <div
            className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
            aria-label="가입 진행률"
          >
            <div className="bg-sea transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <span className="text-xs text-muted">
            {step + 1}/{STEPS.length}
          </span>
        </div>
      </header>

      <div className="flex-1 px-5 pb-6 pt-2">
        {step === 0 && <BasicStep me={me} update={updateProfile} />}
        {step === 1 && <LanguageStep me={me} update={updateProfile} />}
        {step === 2 && <MbtiStep me={me} update={updateProfile} />}
        {step === 3 && <InterestStep me={me} update={updateProfile} />}
        {step === 4 && <ReasonStep me={me} update={updateProfile} />}
        {step === 5 && <PurposeStep me={me} update={updateProfile} />}
        {step === 6 && <StyleStep me={me} update={updateProfile} />}
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-cream via-cream to-cream/0 px-5 pb-6 pt-4">
        <Button
          block
          size="lg"
          disabled={!valid}
          onClick={() => {
            if (!last) return go(step + 1);
            completeOnboarding();
            router.push(from === "edit" ? "/me" : "/home");
          }}
        >
          {last ? (from === "edit" ? "저장하기" : "오늘의 대화 주제 보러 가기") : "다음"}
        </Button>
      </div>
    </div>
  );
}

function isStepValid(step: number, me: UserProfile): boolean {
  switch (step) {
    case 0:
      return me.nickname.trim().length > 0 && me.age >= MIN_AGE && me.verification.age;
    case 1:
      return me.languages.length > 0;
    case 3:
      return me.interests.length > 0;
    case 6:
      return me.styles.length > 0;
    default:
      return true;
  }
}

interface StepProps {
  me: UserProfile;
  update: (patch: Partial<UserProfile>) => void;
}

function StepTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 mt-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-sea focus:ring-2 focus:ring-sea/20";

function BasicStep({ me, update }: StepProps) {
  const setCountry = (code: CountryCode) => {
    const lang = COUNTRIES[code].language;
    update({
      country: code,
      city: "",
      nativeLanguage: lang,
      languages: [lang],
      learningLanguages: [COUNTRIES[partnerCountryOf(code)].language],
    });
  };
  const underage = me.age < MIN_AGE;
  return (
    <>
      <StepTitle title="반가워요! 👋" sub="상대에게 보여질 기본 정보예요. 사진은 나중에, 대화 후에." />
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">닉네임</span>
          <input
            className={inputCls}
            value={me.nickname}
            maxLength={12}
            placeholder="예: 민준"
            onChange={(e) => update({ nickname: e.target.value })}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">나이</span>
            <input
              className={inputCls}
              type="number"
              inputMode="numeric"
              min={MIN_AGE}
              max={99}
              value={me.age}
              onChange={(e) => update({ age: Number(e.target.value) })}
              aria-invalid={underage}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">성별</span>
            <select
              className={inputCls}
              value={me.gender}
              onChange={(e) => update({ gender: e.target.value as Gender })}
            >
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타 / 밝히지 않음</option>
            </select>
          </label>
        </div>
        {underage && <p className="-mt-3 text-sm text-danger">한남일녀는 만 {MIN_AGE}세 이상 성인만 이용할 수 있어요.</p>}

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">국가</legend>
          <div className="flex flex-wrap gap-2">
            {Object.values(COUNTRIES).map((c) => (
              <Chip key={c.code} selected={me.country === c.code} disabled={!c.enabled} onClick={() => setCountry(c.code)}>
                {c.flag} {c.name}
                {!c.enabled && <span className="text-[10px]"> 준비 중</span>}
              </Chip>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">
            도시/지역 <span className="font-normal text-muted">(선택)</span>
          </span>
          <select className={inputCls} value={me.city ?? ""} onChange={(e) => update({ city: e.target.value })}>
            <option value="">선택 안 함</option>
            {COUNTRIES[me.country].cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">
            한 줄 소개 <span className="font-normal text-muted">(선택)</span>
          </span>
          <input
            className={inputCls}
            value={me.bio}
            maxLength={60}
            placeholder="예: 새로운 음식과 여행을 좋아해요."
            onChange={(e) => update({ bio: e.target.value })}
          />
        </label>

        <label className="flex items-start gap-3 rounded-2xl bg-paper p-4 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 accent-[var(--color-sea)]"
            checked={me.verification.age}
            onChange={(e) => update({ verification: { ...me.verification, age: e.target.checked } })}
          />
          <span>
            만 {MIN_AGE}세 이상 성인입니다.
            <span className="mt-0.5 block text-xs text-muted">
              데모에서는 체크만 합니다. 실제 서비스에서는 국가별 성인 인증 방식을 적용할 예정이에요.
            </span>
          </span>
        </label>
      </div>
    </>
  );
}

function LanguageStep({ me, update }: StepProps) {
  const langs = Object.keys(LANGUAGES) as LanguageCode[];
  const partnerLang = COUNTRIES[partnerCountryOf(me.country)].language;
  return (
    <>
      <StepTitle title="어떤 언어로 이야기할까요?" sub="모르는 언어도 괜찮아요. 번역이 도와줄게요." />
      <div className="space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">모국어</legend>
          <div className="flex flex-wrap gap-2">
            {langs.map((l) => (
              <Chip
                key={l}
                selected={me.nativeLanguage === l}
                onClick={() => update({ nativeLanguage: l, languages: me.languages.includes(l) ? me.languages : [l, ...me.languages] })}
              >
                {LANGUAGES[l].flag} {LANGUAGES[l].name}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">사용할 수 있는 언어</legend>
          <div className="flex flex-wrap gap-2">
            {langs.map((l) => (
              <Chip key={l} selected={me.languages.includes(l)} onClick={() => update({ languages: toggle(me.languages, l) })}>
                {LANGUAGES[l].flag} {LANGUAGES[l].name}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">배우고 싶은 언어</legend>
          <div className="flex flex-wrap gap-2">
            {langs
              .filter((l) => l !== me.nativeLanguage)
              .map((l) => (
                <Chip
                  key={l}
                  selected={me.learningLanguages.includes(l)}
                  onClick={() => update({ learningLanguages: toggle(me.learningLanguages, l) })}
                >
                  {LANGUAGES[l].flag} {LANGUAGES[l].name}
                </Chip>
              ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            {LANGUAGES[partnerLang].name} 수준
          </legend>
          <div className="space-y-2">
            {LANGUAGE_LEVELS.map((lv) => (
              <label
                key={lv.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border bg-paper px-4 py-3 text-sm",
                  me.partnerLanguageLevel === lv.id ? "border-sea" : "border-line",
                )}
              >
                <input
                  type="radio"
                  name="level"
                  className="accent-[var(--color-sea)]"
                  checked={me.partnerLanguageLevel === lv.id}
                  onChange={() => update({ partnerLanguageLevel: lv.id })}
                />
                {lv.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </>
  );
}

function MbtiStep({ me, update }: StepProps) {
  return (
    <>
      <StepTitle title="당신의 MBTI는?" sub="궁합 판정이 아니라, 대화 주제를 떠올리는 데만 가볍게 써요." />
      <div className="grid grid-cols-4 gap-2">
        {MBTI_TYPES.map((t) => (
          <button
            key={t}
            aria-pressed={me.mbti === t}
            onClick={() => update({ mbti: t })}
            className={cn(
              "rounded-2xl border py-3 text-sm font-semibold transition",
              me.mbti === t ? "border-sea bg-sea-soft text-sea" : "border-line bg-paper text-ink-soft",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <Button
        block
        variant={me.mbti === "UNKNOWN" ? "sea" : "secondary"}
        className="mt-3"
        onClick={() => update({ mbti: "UNKNOWN" })}
        aria-pressed={me.mbti === "UNKNOWN"}
      >
        🤔 잘 모르겠어요
      </Button>
    </>
  );
}

function InterestStep({ me, update }: StepProps) {
  const full = me.interests.length >= MAX_INTERESTS;
  return (
    <>
      <StepTitle title="무엇을 좋아하세요?" sub={`최대 ${MAX_INTERESTS}개까지 고를 수 있어요. (${me.interests.length}/${MAX_INTERESTS})`} />
      <div className="space-y-5">
        {INTEREST_CATEGORIES.map((cat) => (
          <fieldset key={cat}>
            <legend className="mb-2 text-sm font-semibold text-ink-soft">{cat}</legend>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.filter((i) => i.category === cat).map((i) => {
                const sel = me.interests.includes(i.id);
                return (
                  <Chip
                    key={i.id}
                    selected={sel}
                    disabled={!sel && full}
                    onClick={() => update({ interests: toggle(me.interests, i.id, MAX_INTERESTS) })}
                  >
                    {i.icon} {i.label}
                  </Chip>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </>
  );
}

function ReasonStep({ me, update }: StepProps) {
  const target = COUNTRIES[partnerCountryOf(me.country)].name;
  return (
    <>
      <StepTitle title={`${target}에 관심을 갖게 된 이유는?`} sub="여러 개 골라도 좋아요. 비슷한 이유를 가진 사람을 추천할게요." />
      <div className="flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <Chip key={r.id} selected={me.reasons.includes(r.id)} onClick={() => update({ reasons: toggle(me.reasons, r.id) })}>
            {r.label(target)}
          </Chip>
        ))}
      </div>
    </>
  );
}

function PurposeStep({ me, update }: StepProps) {
  return (
    <>
      <StepTitle title="어떤 만남을 원하세요?" sub="프로필에 표시되고, 목적이 맞는 사람을 먼저 추천해요." />
      <div className="space-y-3" role="radiogroup">
        {(Object.keys(PURPOSES) as Purpose[]).map((p) => {
          const info = PURPOSES[p];
          const sel = me.purpose === p;
          return (
            <button
              key={p}
              role="radio"
              aria-checked={sel}
              onClick={() => update({ purpose: p })}
              className={cn(
                "flex w-full items-center gap-4 rounded-3xl border-2 bg-paper p-5 text-left transition",
                sel ? "border-sea" : "border-transparent",
              )}
            >
              <span className="text-3xl" aria-hidden>
                {info.icon}
              </span>
              <span>
                <span className="block text-lg font-bold">{info.label}</span>
                <span className="text-sm text-muted">{info.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StyleStep({ me, update }: StepProps) {
  return (
    <>
      <StepTitle title="어떤 대화를 좋아하세요?" sub="여러 개 골라도 좋아요." />
      <div className="flex flex-wrap gap-2">
        {CHAT_STYLES.map((s) => (
          <Chip key={s.id} selected={me.styles.includes(s.id)} onClick={() => update({ styles: toggle(me.styles, s.id) })}>
            {s.icon} {s.label}
          </Chip>
        ))}
      </div>
      <h2 className="mb-3 mt-8 font-bold">대화 속도</h2>
      <div className="space-y-2" role="radiogroup">
        {CHAT_SPEEDS.map((s) => (
          <button
            key={s.id}
            role="radio"
            aria-checked={me.speed === s.id}
            onClick={() => update({ speed: s.id })}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border bg-paper px-4 py-3 text-left text-sm",
              me.speed === s.id ? "border-sea font-semibold text-sea" : "border-line",
            )}
          >
            <span aria-hidden>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>
    </>
  );
}
