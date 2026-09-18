import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders label text bound to a control", () => {
    render(<Label htmlFor="email">Email</Label>);

    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "email");
  });
});
