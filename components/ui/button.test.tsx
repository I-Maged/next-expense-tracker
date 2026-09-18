import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders primary variant by default", () => {
    render(<Button>Sign In</Button>);

    const button = screen.getByRole("button", { name: "Sign In" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-accent");
  });

  it("renders secondary and danger variants", () => {
    const { rerender } = render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass(
      "bg-surface",
    );

    rerender(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(
      "text-error",
    );
  });

  it("forwards disabled state", () => {
    render(<Button disabled>Sign In</Button>);

    expect(screen.getByRole("button", { name: "Sign In" })).toBeDisabled();
  });
});
