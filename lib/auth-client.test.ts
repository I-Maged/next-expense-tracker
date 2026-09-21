import { describe, expect, it } from "vitest";

import { authClient } from "@/lib/auth-client";

describe("lib/auth-client", () => {
  it("exports a stable client singleton for UI components", () => {
    // Components mock "@/lib/auth-client" by path — this guards the export name.
    expect(authClient).toBeTruthy();
  });
});
