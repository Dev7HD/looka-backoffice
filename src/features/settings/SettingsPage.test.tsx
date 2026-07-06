import { afterEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeUser, renderWithProviders } from "@/test/utils";
import { SettingsPage } from "./SettingsPage";

describe("SettingsPage", () => {
  afterEach(() => document.documentElement.removeAttribute("data-theme"));

  it("applies the theme live when a segment is chosen", async () => {
    renderWithProviders(<SettingsPage />, { user: makeUser(["ADMIN"]) });
    await userEvent.click(await screen.findByRole("button", { name: "Dark" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("confirms after saving preferences", async () => {
    renderWithProviders(<SettingsPage />, { user: makeUser(["ADMIN"]) });
    await userEvent.click(await screen.findByRole("button", { name: "Save preferences" }));
    expect(await screen.findByText("Preferences saved")).toBeInTheDocument();
  });

  it("lists the user's roles", async () => {
    renderWithProviders(<SettingsPage />, { user: makeUser(["FINANCE", "DISPATCHER"]) });
    expect(await screen.findByText("FINANCE")).toBeInTheDocument();
    expect(screen.getByText("DISPATCHER")).toBeInTheDocument();
  });
});
