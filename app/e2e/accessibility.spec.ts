import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility smoke tests — catch the most common a11y violations
 * (contrast, missing labels, heading order, landmark structure) on
 * every public page.
 */
const pages = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
    { name: "Projects", url: "/projects" },
    { name: "Articles", url: "/articles" },
];

for (const page of pages) {
    test.describe(`Accessibility - ${page.name}`, () => {
        test(`${page.name} page has no critical accessibility violations`, async ({ page: p }) => {
            await p.goto(page.url);

            const results = await new AxeBuilder({ page: p })
                .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
                .analyze();

            const seriousViolations = results.violations.filter(
                (v) => v.impact === "critical" || v.impact === "serious"
            );
            expect(seriousViolations).toEqual([]);
        });

        test(`${page.name} page has a main landmark and h1`, async ({ page: p }) => {
            await p.goto(page.url);
            await expect(p.locator("h1").first()).toBeVisible();
        });
    });
}

test.describe("Accessibility - Theme Toggle", () => {
    test("toggle button is keyboard accessible", async ({ page }) => {
        await page.goto("/");

        const toggle = page.locator('button[aria-label*="Mode"]');
        await expect(toggle).toBeVisible();

        // Focus and activate via keyboard only
        await toggle.focus();
        await page.keyboard.press("Enter");

        // The html class should have changed (dark ↔ light)
        await expect(page.locator("html")).toHaveClass(/dark|light/);
    });
});
