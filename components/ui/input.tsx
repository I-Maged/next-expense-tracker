import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid = false, className, ...rest }: Props) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded-md border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
        invalid ? "border-error" : "border-border",
        className,
      )}
      {...rest}
    />
  );
}
