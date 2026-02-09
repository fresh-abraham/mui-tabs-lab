import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChromeLikeTabs from "./ChromeLikeTabs";

describe("ChromeLikeTabs", () => {
  test("öffnet einen neuen Tab", async () => {
    const user = userEvent.setup();
    render(<ChromeLikeTabs />);

    // neuer Tab
    await user.click(screen.getByLabelText("new-tab"));

    // Erwartung: Tab 2 existiert
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
  });

  test("counter ist pro Tab getrennt", async () => {
    const user = userEvent.setup();
    render(<ChromeLikeTabs />);

    // Tab 1: Count hoch
    await user.click(screen.getByRole("button", { name: /count:/i }));
    expect(screen.getByRole("button", { name: "Count: 1" })).toBeInTheDocument();

    // Tab 2 erstellen und wechseln
    await user.click(screen.getByLabelText("new-tab"));
    await user.click(screen.getByText("Tab 2"));

    // Tab 2 startet bei 0
    expect(screen.getByRole("button", { name: "Count: 0" })).toBeInTheDocument();

    // Zurück zu Tab 1 -> wieder 1
    await user.click(screen.getByText("Tab 1"));
    expect(screen.getByRole("button", { name: "Count: 1" })).toBeInTheDocument();
  });

  test("persistiert Tabs in localStorage", async () => {
    const user = userEvent.setup();
    render(<ChromeLikeTabs />);

    await user.click(screen.getByLabelText("new-tab"));
    const raw = localStorage.getItem("mui_tabs_lab.tabs.v1");
    expect(raw).toBeTruthy();
    expect(raw).toContain("Tab 2");
  });
});
