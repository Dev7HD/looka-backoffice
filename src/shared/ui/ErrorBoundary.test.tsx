import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { ErrorBoundary } from "./ErrorBoundary";

function Boom(): never {
  throw new Error("kaboom");
}

describe("ErrorBoundary", () => {
  it("catches a render error and shows the error card", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithProviders(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("kaboom")).toBeInTheDocument();
    spy.mockRestore();
  });

  it("renders children when there is no error", () => {
    renderWithProviders(
      <ErrorBoundary>
        <span>safe</span>
      </ErrorBoundary>
    );
    expect(screen.getByText("safe")).toBeInTheDocument();
  });
});
