import type { LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Props = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...rest }: Props) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-5 text-text-secondary",
        className,
      )}
      {...rest}
    />
  );
}
