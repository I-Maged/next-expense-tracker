import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

const VARIANT_CLASSES = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-dark disabled:opacity-60",
  secondary:
    "border border-border bg-surface text-text-primary hover:bg-surface-secondary disabled:opacity-60",
  danger:
    "border border-border bg-surface text-error hover:bg-surface-secondary disabled:opacity-60",
} as const;

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    />
  );
}
