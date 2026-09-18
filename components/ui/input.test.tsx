import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders a labeled email field with placeholder", () => {
    render(<Input id="email" type="email" placeholder="you@example.com" />);

    const input = screen.getByPlaceholderText("you@example.com");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "email");
  });

  it("shows error styling when invalid", () => {
    render(<Input id="email" invalid placeholder="you@example.com" />);

    expect(screen.getByPlaceholderText("you@example.com")).toHaveClass(
      "border-error",
    );
  });
});
