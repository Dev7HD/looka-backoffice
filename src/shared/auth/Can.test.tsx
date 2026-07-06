import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { makeUser, renderWithProviders } from "@/test/utils";
import { Can } from "./Can";

describe("Can", () => {
  it("renders children when the user holds the role", async () => {
    renderWithProviders(
      <Can role="FINANCE">
        <span>allowed</span>
      </Can>,
      { user: makeUser(["FINANCE"]) }
    );
    expect(await screen.findByText("allowed")).toBeInTheDocument();
  });

  it("renders the fallback without the role", async () => {
    renderWithProviders(
      <Can role="FINANCE" fallback={<span>denied</span>}>
        <span>allowed</span>
      </Can>,
      { user: makeUser(["DISPATCHER"]) }
    );
    expect(await screen.findByText("denied")).toBeInTheDocument();
    expect(screen.queryByText("allowed")).toBeNull();
  });

  it("lets ADMIN through any gate", async () => {
    renderWithProviders(
      <Can roles={["MEDIA_MODERATOR", "CATALOG_MANAGER"]}>
        <span>allowed</span>
      </Can>,
      { user: makeUser(["ADMIN"]) }
    );
    expect(await screen.findByText("allowed")).toBeInTheDocument();
  });
});
