import { BarChart3, Wallet, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Fast entry",
    body: "Log a transaction in under 10 seconds — type, amount, category, date, done.",
  },
  {
    icon: Wallet,
    title: "Budgets",
    body: "Set one monthly limit per category and always see spent versus remaining.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    body: "Spending by category and income versus expense charts that match your data exactly.",
  },
] as const;

export function Features() {
  return (
    <section aria-labelledby="features-heading" className="w-full bg-surface">
      <div className="mx-auto w-full max-w-360 px-8 py-16">
        <h2
          id="features-heading"
          className="text-center text-2xl font-semibold leading-8 text-text-primary"
        >
          Everything you need, nothing you don&apos;t
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light">
                <feature.icon
                  aria-hidden="true"
                  className="h-5 w-5 text-accent"
                />
              </span>
              <h3 className="mt-4 text-base font-semibold leading-6 text-text-primary">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm font-normal leading-5 text-text-secondary">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
