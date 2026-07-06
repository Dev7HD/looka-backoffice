import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { makeUser, renderWithProviders } from "@/test/utils";
import { MediaPage } from "./MediaPage";

describe("MediaPage", () => {
  it("shows moderation actions for a MEDIA_MODERATOR", async () => {
    renderWithProviders(<MediaPage />, { user: makeUser(["MEDIA_MODERATOR"]) });
    // Pending queue loads.
    expect((await screen.findAllByText(/photo|narration/)).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Approve" }).length).toBeGreaterThan(0);
  });

  it("hides moderation actions without the role", async () => {
    renderWithProviders(<MediaPage />, { user: makeUser(["FINANCE"]) });
    await screen.findAllByText(/photo|narration/);
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
  });
});
