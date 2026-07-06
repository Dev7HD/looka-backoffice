import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { ApiError } from "@shared/api/client";
import { AsyncBoundary } from "./Feedback";

describe("AsyncBoundary", () => {
  it("shows a spinner while loading", () => {
    renderWithProviders(
      <AsyncBoundary isLoading isError={false}>
        <span>content</span>
      </AsyncBoundary>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("content")).toBeNull();
  });

  it("shows a mapped error message with retry", async () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <AsyncBoundary
        isLoading={false}
        isError
        error={new ApiError(422, { code: "billing.points.insufficient" })}
        onRetry={onRetry}
      >
        <span>content</span>
      </AsyncBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Not enough points for this action.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders children when settled", () => {
    renderWithProviders(
      <AsyncBoundary isLoading={false} isError={false}>
        <span>content</span>
      </AsyncBoundary>
    );
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
