"use client";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
  onPageChange: (page: number) => void;
};

export function TransactionsPagination({
  page,
  totalPages,
  total,
  start,
  end,
  onPageChange,
}: Props) {
  return (
    <nav
      aria-label="Transactions pagination"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs leading-4 text-text-muted">
        {`Showing ${start} to ${end} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          Previous
        </Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? "primary" : "secondary"}
              aria-current={pageNumber === page ? "page" : undefined}
              aria-label={`Page ${pageNumber}`}
              onClick={() => {
                onPageChange(pageNumber);
              }}
            >
              {pageNumber}
            </Button>
          ),
        )}
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => {
            onPageChange(page + 1);
          }}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
