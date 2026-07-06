import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { makeUser, renderWithProviders } from "@/test/utils";
import { DriversPage } from "./DriversPage";

describe("DriversPage", () => {
  it("loads drivers from the mock api", async () => {
    renderWithProviders(<DriversPage />, { user: makeUser(["DISPATCHER"]) });
    expect(await screen.findByText("DRV-2100")).toBeInTheDocument();
    // Roster is paginated to 10 rows.
    expect(screen.getAllByText(/^DRV-\d+$/)).toHaveLength(10);
  });

  it("shows moderation actions for a DISPATCHER", async () => {
    renderWithProviders(<DriversPage />, { user: makeUser(["DISPATCHER"]) });
    await screen.findByText("DRV-2100");
    expect(screen.getAllByRole("button", { name: /^(Suspend|Reactivate)$/ }).length).toBeGreaterThan(0);
  });

  it("hides moderation actions without the role (per-action gating)", async () => {
    renderWithProviders(<DriversPage />, { user: makeUser(["FINANCE"]) });
    await screen.findByText("DRV-2100");
    expect(screen.queryByRole("button", { name: /^(Suspend|Reactivate)$/ })).toBeNull();
  });
});
