"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const nextNameError =
      name.trim().length >= 2 ? null : "Name must be at least 2 characters.";
    const nextEmailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? null
      : "Enter a valid email address.";
    const nextPasswordError =
      password.length >= 8 ? null : "Password must be at least 8 characters.";
    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    if (
      nextNameError !== null ||
      nextEmailError !== null ||
      nextPasswordError !== null
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (result.error) {
        console.error("[SignupForm] sign-up failed", result.error);
        setFormError("Could not create your account. Please try again.");
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("[SignupForm] sign-up failed", error);
      setFormError("Could not create your account. Please try again.");
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
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Ana"
          value={name}
          invalid={nameError !== null}
          onChange={(event) => setName(event.target.value)}
        />
        {nameError !== null ? (
          <p role="alert" className="text-sm text-error">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
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
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
        {isSubmitting ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
