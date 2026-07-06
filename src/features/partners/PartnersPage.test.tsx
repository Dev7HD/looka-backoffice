import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeUser, renderWithProviders } from "@/test/utils";
import { PartnersPage } from "./PartnersPage";

describe("PartnersPage", () => {
  it("loads the queue and auto-selects the first partner with its KYC docs", async () => {
    renderWithProviders(<PartnersPage />, { user: makeUser(["PARTNER_MANAGER"]) });
    // Oldest submission first → Sahara Nomads Co.
    expect(await screen.findByText("Sahara Nomads Co.")).toBeInTheDocument();
    // Detail shows the 4 KYC document rows.
    const rows = await screen.findAllByText(/rc-|licence-|cin-|rib-/);
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });

  it("shows decision actions for a PARTNER_MANAGER", async () => {
    renderWithProviders(<PartnersPage />, { user: makeUser(["PARTNER_MANAGER"]) });
    await screen.findByText("Sahara Nomads Co.");
    expect(
      await screen.findByRole("button", { name: "Approve partner" })
    ).toBeInTheDocument();
  });

  it("verifying the rejected doc enables approval", async () => {
    renderWithProviders(<PartnersPage />, { user: makeUser(["ADMIN"]) });
    await screen.findByText("Sahara Nomads Co.");

    const approve = await screen.findByRole("button", { name: "Approve partner" });
    expect(approve).toBeDisabled(); // license is REJECTED

    // Verify the rejected licence row.
    const licenceFile = screen.getByText("licence-sahara.pdf");
    const row = licenceFile.closest("li")!;
    await userEvent.click(within(row).getByRole("button", { name: "Verify" }));

    // Once all docs verified, approval unlocks.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Approve partner" })).toBeEnabled()
    );
  });
});
