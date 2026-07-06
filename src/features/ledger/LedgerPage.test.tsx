import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeUser, renderWithProviders } from "@/test/utils";
import { LedgerPage } from "./LedgerPage";

describe("LedgerPage", () => {
  it("renders escrow summary and transactions", async () => {
    renderWithProviders(<LedgerPage />, { user: makeUser(["FINANCE"]) });
    expect(await screen.findByText("Escrow balance")).toBeInTheDocument();
    // At least one TXN row.
    expect(await screen.findAllByText(/^TXN-\d+$/)).not.toHaveLength(0);
  });

  it("filters transactions by type", async () => {
    renderWithProviders(<LedgerPage />, { user: makeUser(["FINANCE"]) });
    await screen.findByText("Escrow balance");

    await userEvent.click(screen.getByRole("button", { name: "Capture" }));

    // Wait for the refetch to settle (keepPreviousData shows stale rows first).
    await waitFor(() => {
      const table = screen.getByRole("table");
      const typeCells = within(table)
        .getAllByRole("row")
        .slice(1)
        .map((r) => r.children[1]?.textContent);
      expect(typeCells.length).toBeGreaterThan(0);
      expect(typeCells.every((c) => c === "Capture")).toBe(true);
    });
  });
});
