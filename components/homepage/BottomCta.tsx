import Link from "next/link";

type Props = {
  authenticated?: boolean;
};

export function BottomCta({ authenticated = false }: Props) {
  return (
    <section aria-labelledby="bottom-cta-heading" className="w-full bg-surface">
      <div className="mx-auto w-full max-w-360 px-8 py-16 text-center">
        <h2
          id="bottom-cta-heading"
          className="mx-auto max-w-xl text-3xl font-bold leading-tight text-text-primary"
        >
          Start tracking today — your first expense takes 10 seconds
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-5 text-text-secondary">
          Free to start. No bank sync, no spreadsheets, no paywalled reports.
        </p>
        <Link
          href={authenticated ? "/dashboard" : "/signup"}
          className="mt-6 inline-block rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
