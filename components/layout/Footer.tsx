import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transactions", href: "/transactions" },
  { label: "Budgets", href: "/budgets" },
  { label: "Settings", href: "/settings" },
] as const;

const ACCOUNT_LINKS = [
  { label: "Sign In", href: "/login" },
  { label: "Get Started", href: "/signup" },
] as const;

type Props = {
  authenticated?: boolean;
};

export function Footer({ authenticated = false }: Props) {
  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[19px] font-bold leading-7 text-text-darkest">
            ExpenseTracker
          </p>
          <p className="mt-2 max-w-xs text-xs leading-4 text-text-muted">
            Fast transaction entry, clear budgets, and honest reports.
          </p>
        </div>
        <nav aria-label="Product" className="flex flex-col gap-2.5">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Product
          </p>
          {PRODUCT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Account" className="flex flex-col gap-2.5">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Account
          </p>
          {ACCOUNT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={authenticated ? "/dashboard" : link.href}
              className="text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-360 px-6 py-4 text-xs leading-4 text-text-muted">
          © 2026 ExpenseTracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
