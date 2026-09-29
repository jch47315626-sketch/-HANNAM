"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "sea";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong shadow-sm shadow-brand/20 disabled:bg-brand/40",
  secondary: "bg-paper text-ink border border-line hover:bg-cream disabled:text-muted",
  ghost: "text-ink-soft hover:bg-black/5 disabled:text-muted",
  danger: "bg-danger text-white hover:brightness-95 disabled:bg-danger/40",
  sea: "bg-sea text-white hover:brightness-95 disabled:bg-sea/40",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] disabled:active:scale-100";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  block?: boolean;
}

const sizes = { sm: "px-3 py-2 text-sm", md: "px-4 py-3 text-[15px]", lg: "px-5 py-4 text-base" };

export function Button({ variant = "primary", size = "md", block, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
      {...rest}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  block,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], block && "w-full", className)}>
      {children}
    </Link>
  );
}

export function Chip({
  selected,
  onClick,
  children,
  disabled,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  if (!onClick) {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-sm text-ink-soft", className)}>
        {children}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3.5 py-2 text-sm transition",
        selected
          ? "border-sea bg-sea-soft font-semibold text-sea"
          : "border-line bg-paper text-ink-soft hover:border-ink/20 disabled:opacity-40",
        className,
      )}
    >
      {selected && <span aria-hidden>✓</span>}
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-3xl border border-line bg-paper p-5", className)}>{children}</div>;
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition",
        checked ? "bg-sea" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  hideClose?: boolean;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="닫기" className="absolute inset-0 bg-ink/40" onClick={onClose} tabIndex={-1} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className="relative z-10 max-h-[90dvh] w-full max-w-[430px] animate-fade-up overflow-y-auto rounded-t-3xl bg-paper p-6 shadow-xl sm:rounded-3xl"
      >
        {!hideClose && (
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 top-4 rounded-full p-2 text-muted hover:bg-black/5"
          >
            ✕
          </button>
        )}
        {title && (
          <h2 id={titleId} className="mb-3 pr-8 text-lg font-bold">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 text-5xl" aria-hidden>
        {icon}
      </div>
      <p className="text-lg font-bold">{title}</p>
      {description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{children}</p>;
}

export function Loading({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center" role="status">
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 animate-typing rounded-full bg-sea"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="whitespace-pre-line text-sm text-ink-soft">{label}</p>
    </div>
  );
}
