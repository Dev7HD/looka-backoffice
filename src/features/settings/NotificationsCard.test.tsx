import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeUser, renderWithProviders } from "@/test/utils";
import { NotificationsCard } from "./NotificationsCard";

describe("NotificationsCard", () => {
  it("shows unsupported when FCM is not configured", async () => {
    renderWithProviders(<NotificationsCard />, { user: makeUser(["ADMIN"]) });
    // No VITE_FCM_* in the test env → HAS_FCM is false.
    expect(await screen.findByText("Push notifications are not configured.")).toBeInTheDocument();
    // Enable button is not offered.
    expect(screen.queryByRole("button", { name: "Enable notifications" })).toBeNull();
  });

  it("renders the subscription matrix and toggles a cell", async () => {
    renderWithProviders(<NotificationsCard />, { user: makeUser(["ADMIN"]) });
    // 4 categories × 2 channels = 8 checkboxes.
    const boxes = await screen.findAllByRole("checkbox");
    expect(boxes).toHaveLength(8);

    // Default: all PUSH checked (4), no EMAIL → 4 checked.
    expect(boxes.filter((b) => (b as HTMLInputElement).checked)).toHaveLength(4);

    // Enable an EMAIL cell.
    const emailTours = screen.getByLabelText("Email · Tours") as HTMLInputElement;
    expect(emailTours.checked).toBe(false);
    await userEvent.click(emailTours);
    await waitFor(() =>
      expect((screen.getByLabelText("Email · Tours") as HTMLInputElement).checked).toBe(true)
    );
  });
});
