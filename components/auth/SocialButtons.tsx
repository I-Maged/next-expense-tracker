"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Props = {
  callbackURL?: string;
};

type Provider = "google" | "github";

const PROVIDER_LABEL: Record<Provider, string> = {
  google: "Google",
  github: "GitHub",
};

export function SocialButtons({ callbackURL = "/dashboard" }: Props) {
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [failedProvider, setFailedProvider] = useState<Provider | null>(null);

  async function handleSocialSignIn(provider: Provider): Promise<void> {
    setPendingProvider(provider);
    setFailedProvider(null);
    try {
      const result = await authClient.signIn.social({ provider, callbackURL });
      if (result.error) {
        console.error(
          `[SocialButtons] ${provider} sign-in failed`,
          result.error,
        );
        setFailedProvider(provider);
      }
    } catch (error) {
      console.error(`[SocialButtons] ${provider} sign-in failed`, error);
      setFailedProvider(provider);
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {(Object.keys(PROVIDER_LABEL) as Array<Provider>).map((provider) => (
        <div key={provider} className="flex flex-col gap-2">
          <Button
            variant="secondary"
            disabled={pendingProvider !== null}
            onClick={() => {
              void handleSocialSignIn(provider);
            }}
          >
            {pendingProvider === provider
              ? `Connecting to ${PROVIDER_LABEL[provider]}…`
              : `Continue with ${PROVIDER_LABEL[provider]}`}
          </Button>
          {failedProvider === provider ? (
            <p role="alert" className="text-sm text-error">
              Could not continue with {PROVIDER_LABEL[provider]}. Please try
              again.
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
