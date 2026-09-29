"use client";

import { useMemo } from "react";
import { splitHref, useRouterState } from "./router";

export function useRouter() {
  const { push, replace, back } = useRouterState();
  return { push, replace, back, refresh: () => {}, prefetch: () => {}, forward: () => {} };
}

export function usePathname(): string {
  return splitHref(useRouterState().href).pathname;
}

export function useSearchParams(): URLSearchParams {
  const { href } = useRouterState();
  return useMemo(() => new URLSearchParams(splitHref(href).search), [href]);
}
