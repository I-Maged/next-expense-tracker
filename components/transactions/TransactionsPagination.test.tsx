import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TransactionsPagination } from "@/components/transactions/TransactionsPagination";

describe("TransactionsPagination", () => {
  it("announces the visible range and total", () => {
    render(
      <TransactionsPagination
        page={1}
        totalPages={3}
        total={48}
        start={1}
        end={20}
        onPageChange={() => {}}
      />,
    );

    expect(screen.getByText("Showing 1 to 20 of 48")).toBeInTheDocument();
  });

  it("navigates between pages and disables edges", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <TransactionsPagination
        page={1}
        totalPages={3}
        total={48}
        start={1}
        end={20}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(
      <TransactionsPagination
        page={3}
        totalPages={3}
        total={48}
        start={41}
        end={48}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByText("Showing 41 to 48 of 48")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
