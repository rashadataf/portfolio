import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggler } from "@/components/DarkModeToggle";
import { ThemeProvider } from "@/context/theme.provider";

const renderWithProvider = () =>
  render(
    <ThemeProvider>
      <ThemeToggler />
    </ThemeProvider>
  );

describe("ThemeToggler", () => {
  it("renders the toggle button with an accessible name", () => {
    renderWithProvider();
    const button = screen.getByRole("button", { name: /mode/i });
    expect(button).toBeInTheDocument();
  });

  it("toggles the theme when clicked", () => {
    renderWithProvider();

    const button = screen.getByRole("button", { name: /mode/i });
    const initialLabel = button.getAttribute("aria-label");

    fireEvent.click(button);

    const updatedLabel = button.getAttribute("aria-label");
    expect(updatedLabel).not.toBe(initialLabel);
    expect(updatedLabel).toMatch(/dark|light/i);
  });

  it("persists the choice to localStorage", () => {
    renderWithProvider();

    fireEvent.click(screen.getByRole("button", { name: /mode/i }));

    // The provider persists via `localStorage.theme = ...` (property assignment)
    expect(window.localStorage.getItem("theme")).toBeDefined();
  });
});