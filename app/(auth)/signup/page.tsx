import Link from "next/link";

import { SignupForm } from "@/components/auth/SignupForm";
import { SocialButtons } from "@/components/auth/SocialButtons";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col px-8 py-16">
      <div className="card flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold leading-8 text-text-primary">
            Create your account
          </h1>
          <p className="text-sm font-medium leading-5 text-text-secondary">
            Start tracking your spending in seconds.
          </p>
        </div>
        <SignupForm />
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-muted">or</span>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>
        <SocialButtons />
        <p className="text-center text-sm font-medium leading-5 text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
