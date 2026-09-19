import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog } from "@/components/ui/dialog";

describe("Dialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Dialog open={false} onClose={() => {}} title="Add transaction">
        <p>body</p>
      </Dialog>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders title and body when open", () => {
    render(
      <Dialog open onClose={() => {}} title="Add transaction">
        <p>dialog body</p>
      </Dialog>,
    );

    expect(
      screen.getByRole("dialog", { name: "Add transaction" }),
    ).toBeInTheDocument();
    expect(screen.getByText("dialog body")).toBeInTheDocument();
  });

  it("closes on Escape and backdrop click", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Add transaction">
        <p>dialog body</p>
      </Dialog>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.mouseDown(screen.getByTestId("dialog-overlay"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
