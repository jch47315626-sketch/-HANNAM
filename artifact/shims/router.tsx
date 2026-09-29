"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Claude Artifact(단일 페이지)용 메모리 라우터.
 * next/navigation, next/link 를 이 구현으로 대체해 같은 화면 코드를 그대로 쓴다.
 */

interface RouterState {
  href: string;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
}

const RouterContext = createContext<RouterState | null>(null);

export function MemoryRouter({ initial = "/", children }: { initial?: string; children: React.ReactNode }) {
  const [stack, setStack] = useState<string[]>([initial]);
  const go = useCallback((href: string, mode: "push" | "replace") => {
    setStack((s) => (mode === "push" ? [...s, href] : [...s.slice(0, -1), href]));
    window.scrollTo(0, 0);
  }, []);
  const value = useMemo<RouterState>(
    () => ({
      href: stack[stack.length - 1],
      push: (h) => go(h, "push"),
      replace: (h) => go(h, "replace"),
      back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    }),
    [stack, go],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouterState(): RouterState {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("MemoryRouter missing");
  return ctx;
}

export function splitHref(href: string): { pathname: string; search: string } {
  const [pathname, search = ""] = href.split("?");
  return { pathname: pathname || "/", search };
}
