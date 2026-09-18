import Link from "next/link";

const PREVIEW_BARS = [
  { label: "Food", width: "72%", tone: "bg-accent" },
  { label: "Rent", width: "58%", tone: "bg-success" },
  { label: "Shopping", width: "41%", tone: "bg-warning" },
] as const;

type Props = {
  authenticated?: boolean;
};

export function Hero({ authenticated = false }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-360 flex-col items-center px-8 pt-16 pb-12 text-center md:pt-24">
      <h1 className="max-w-2xl text-4xl font-bold leading-tight text-text-primary md:text-6xl">
        Know where your money goes
      </h1>
      <p className="mt-4 max-w-xl text-base leading-6 text-text-secondary md:text-lg">
        Log income and expenses in seconds, set monthly budgets per category,
        and see honest reports of your spending.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={authenticated ? "/dashboard" : "/signup"}
          className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          Get Started
        </Link>
        <Link
          href={authenticated ? "/dashboard" : "/login"}
          className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
        >
          Sign In
        </Link>
      </div>
      <div
        data-testid="app-preview"
        className="card mt-12 w-full max-w-3xl text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium leading-5 text-text-secondary">
              Spent This Month
            </p>
            <p className="mt-1 text-3xl font-semibold leading-9 text-text-primary tabular-nums">
              $1,284.50
            </p>
          </div>
          <span className="rounded-full bg-success-lightest px-2.5 py-1 text-xs font-medium text-success-foreground">
            +$2,400.00 income
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          {PREVIEW_BARS.map((bar) => (
            <div key={bar.label}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium leading-5 text-text-dark">
                  {bar.label}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-border-light">
                <div
                  className={`h-2 rounded-full ${bar.tone}`}
                  style={{ width: bar.width }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
