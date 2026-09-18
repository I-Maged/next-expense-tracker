"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const nextEmailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? null
      : "Enter a valid email address.";
    const nextPasswordError =
      password.length > 0 ? null : "Password is required.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    if (nextEmailError !== null || nextPasswordError !== null) return;

    setIsSubmitting(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (result.error) {
        console.error("[LoginForm] sign-in failed", result.error);
        setFormError(
          "Could not sign you in. Check your details and try again.",
        );
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("[LoginForm] sign-in failed", error);
      setFormError("Could not sign you in. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          invalid={emailError !== null}
          onChange={(event) => setEmail(event.target.value)}
        />
        {emailError !== null ? (
          <p role="alert" className="text-sm text-error">
            {emailError}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          invalid={passwordError !== null}
          onChange={(event) => setPassword(event.target.value)}
        />
        {passwordError !== null ? (
          <p role="alert" className="text-sm text-error">
            {passwordError}
          </p>
        ) : null}
      </div>
      {formError !== null ? (
        <p role="alert" className="text-sm text-error">
          {formError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
