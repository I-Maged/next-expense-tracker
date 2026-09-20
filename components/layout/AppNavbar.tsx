import Link from "next/link";

import { SignOutButton } from "@/components/layout/SignOutButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transactions", href: "/transactions" },
  { label: "Budgets", href: "/budgets" },
  { label: "Settings", href: "/settings" },
] as const;

type Props = {
  activePath: string;
  userEmail?: string;
};

export function AppNavbar({ activePath, userEmail }: Props) {
  return (
    <header className="w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-360 items-center justify-between gap-4 px-6">
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
          {NAV_LINKS.map((link) => {
            const isActive = link.href === activePath;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "text-sm font-medium leading-5 text-accent"
                    : "text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          {userEmail ? (
            <span className="hidden text-sm font-medium text-text-secondary sm:block">
              {userEmail}
            </span>
          ) : null}
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
      <nav
        aria-label="Mobile"
        data-testid="app-navbar-mobile-nav"
        className="border-t border-border md:hidden"
      >
        <div className="mx-auto flex w-full max-w-360 items-center gap-6 overflow-x-auto px-6 py-2">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === activePath;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "shrink-0 whitespace-nowrap text-sm font-medium leading-5 text-accent"
                    : "shrink-0 whitespace-nowrap text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
