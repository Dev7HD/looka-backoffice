import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Deterministic locale for every run.
  await page.addInitScript(() => localStorage.setItem("louka.locale", "en"));
});

test("unauthenticated users are sent to the login screen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Hamza Damiri")).toBeVisible();
});

test("admin can sign in and navigate across features", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Hamza Damiri/ }).click();

  // Lands on the dashboard shell.
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Partners" })).toBeVisible();

  // Partners → review queue.
  await page.getByRole("link", { name: "Partners" }).click();
  await expect(page.getByText("Review queue")).toBeVisible();
  await expect(page.getByText("Sahara Nomads Co.").first()).toBeVisible();

  // Ledger → escrow summary.
  await page.getByRole("link", { name: "Ledger" }).click();
  await expect(page.getByText("Escrow balance")).toBeVisible();

  // Dispatch → live indicator.
  await page.getByRole("link", { name: "Dispatch" }).click();
  await expect(page.getByText("Live", { exact: true })).toBeVisible();
});

test("switching to Arabic flips the layout to RTL", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Hamza Damiri/ }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.locator(".lang__select").selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
});
