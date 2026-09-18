const STEPS = [
  {
    step: "1",
    title: "Sign up",
    body: "Create your account in seconds. Your default categories are ready instantly.",
  },
  {
    step: "2",
    title: "Log spending",
    body: "Add income and expenses as they happen — fast entry keeps you consistent.",
  },
  {
    step: "3",
    title: "Stay on budget",
    body: "Watch spent versus remaining per category and adjust before month end.",
  },
] as const;

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="w-full">
      <div className="mx-auto w-full max-w-360 px-8 py-16">
        <h2
          id="how-it-works-heading"
          className="text-center text-2xl font-semibold leading-8 text-text-primary"
        >
          How it works
        </h2>
        <ol className="mt-8 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
          {STEPS.map((item) => (
            <li key={item.step} className="card flex flex-col items-start">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted text-base font-semibold text-accent">
                {item.step}
              </span>
              <h3 className="mt-4 text-base font-semibold leading-6 text-text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm font-normal leading-5 text-text-secondary">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
