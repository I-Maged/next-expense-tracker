"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut(): Promise<void> {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("[SignOutButton] sign-out failed", error);
    } finally {
      router.push("/");
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={() => {
        void handleSignOut();
      }}
    >
      Sign out
    </Button>
  );
}
