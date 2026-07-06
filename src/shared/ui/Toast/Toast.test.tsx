import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "./Toast";

function Trigger() {
  const { show } = useToast();
  return (
    <button onClick={() => show({ title: "Ride accepted", body: "RD-42", duration: 0 })}>
      notify
    </button>
  );
}

describe("Toast", () => {
  it("shows a toast and dismisses it", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "notify" }));
    expect(screen.getByText("Ride accepted")).toBeInTheDocument();
    expect(screen.getByText("RD-42")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Ride accepted")).toBeNull();
  });
});
