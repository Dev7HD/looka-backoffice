import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it("renders the default label per ride status", () => {
    render(<StatusPill status="ABANDONED" />);
    expect(screen.getByText("Abandoned")).toBeInTheDocument();
  });

  it("maps terminal states to distinct intents", () => {
    const { rerender } = render(<StatusPill status="CANCELLED" />);
    expect(screen.getByText("Cancelled").className).toContain("chip--neutral");
    rerender(<StatusPill status="ABANDONED" />);
    expect(screen.getByText("Abandoned").className).toContain("chip--critical");
  });

  it("accepts a label override for i18n", () => {
    render(<StatusPill status="PENDING" label="En attente" />);
    expect(screen.getByText("En attente")).toBeInTheDocument();
  });
});
