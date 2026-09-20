import Link from "next/link";

import { ThemeToggle } from "@/components/layout/ThemeToggle";

type Props = {
  ctaHref?: string;
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transactions", href: "/transactions" },
  { label: "Budgets", href: "/budgets" },
  { label: "Settings", href: "/settings" },
] as const;

export function Navbar({ ctaHref = "/signup" }: Props) {
  return (
    <header className="w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-360 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-lg font-bold text-white"
            style={{
              background: "linear-gradient(45deg, #7C5CFC 0%, #4A2EC5 100%)",
            }}
          >
            E
          </span>
          <span className="text-[19px] font-bold leading-7 text-text-darkest">
            ExpenseTracker
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={ctaHref}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
