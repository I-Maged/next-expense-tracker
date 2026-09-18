import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BottomCta } from "@/components/homepage/BottomCta";

describe("BottomCta", () => {
  it("renders closing CTA linking to signup", () => {
    render(<BottomCta />);

    expect(
      screen.getByRole("heading", { name: /start tracking today/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });
});
