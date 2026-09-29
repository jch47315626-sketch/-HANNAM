"use client";

import { useRouterState } from "./router";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; replace?: boolean; prefetch?: boolean };

export default function Link({ href, replace, onClick, children, ...props }: Props) {
  const { prefetch, ...rest } = props;
  void prefetch;
  const router = useRouterState();
  return (
    <a
      href={`#${href}`}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        if (replace) router.replace(href);
        else router.push(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
