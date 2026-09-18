import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HowItWorks } from "@/components/homepage/HowItWorks";

describe("HowItWorks", () => {
  it("renders the three steps", () => {
    render(<HowItWorks />);

    expect(
      screen.getByRole("heading", { name: /how it works/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/log spending/i)).toBeInTheDocument();
    expect(screen.getByText(/stay on budget/i)).toBeInTheDocument();
  });
});
