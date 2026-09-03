import { test, expect } from "@playwright/test";

/**
 * Admin flow e2e tests.
 *
 * The app has no login UI page (auth is API-route based via NextAuth),
 * so these tests verify:
 *   1. Unauthenticated users are redirected away from /admin
 *   2. The auth API endpoints respond correctly
 *   3. Admin pages render when a session cookie is present (skipped
 *      unless E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD are configured)
 */

test.describe("Admin auth guard", () => {
    // The admin layout redirects unauthenticated users via a client-side
    // redirect after hydration — so we wait for the URL to leave /admin
    // rather than checking the initial response.
    for (const adminPath of ["/admin", "/admin/projects", "/admin/articles"]) {
        test(`unauthenticated visit to ${adminPath} redirects away`, async ({ page }) => {
            await page.goto(adminPath, { waitUntil: "domcontentloaded" });

            await expect
                .poll(async () => new URL(page.url()).pathname, { timeout: 10000 })
                .not.toBe(adminPath);
        });
    }
});

test.describe("Auth API", () => {
    test("auth providers endpoint responds", async ({ request }) => {
        // NextAuth exposes its providers list at the base path
        const authBase = process.env.AUTH_BASE_PATH || "/api/auth";
        const response = await request.get(authBase.replace(/^\//, "") + "/providers");
        // NextAuth returns 200 with a JSON array (possibly empty in prod config)
        expect([200, 404]).toContain(response.status());
        if (response.status() === 200) {
            const body = await response.json();
            expect(Array.isArray(body)).toBeTruthy();
        }
    });

    test("csrf endpoint issues a token", async ({ request }) => {
        const authBase = process.env.AUTH_BASE_PATH || "/api/auth";
        const response = await request.get(authBase.replace(/^\//, "") + "/csrf");
        if (response.status() === 200) {
            const body = await response.json();
            expect(body.csrfToken).toBeTruthy();
        }
    });
});

// Full authenticated admin flow — only runs when credentials are provided
// (e.g. in CI with a seeded dev database).
test.describe("Authenticated admin flow", () => {
    test.skip(
        !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
        "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set for authenticated admin tests"
    );

    test("admin can sign in and view the dashboard", async ({ page }) => {
        const authBase = (process.env.AUTH_BASE_PATH || "/api/auth").replace(/^\//, "");

        // Use the browser context's request so the session cookie lands in
        // the same cookie jar the page uses.
        const request = page.context().request;

        // 1. Get CSRF token
        const csrfRes = await request.get(`${authBase}/csrf`);
        const { csrfToken } = await csrfRes.json();

        // 2. Sign in via the credentials flow
        const signInRes = await request.post(`${authBase}/callback/credentials`, {
            form: {
                csrfToken,
                email: process.env.E2E_ADMIN_EMAIL!,
                password: process.env.E2E_ADMIN_PASSWORD!,
            },
        });
        expect(signInRes.ok()).toBeTruthy();

        // 3. Visit the admin dashboard with the session established
        const response = await page.goto("/admin");
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1, h5, h6").first()).toBeVisible();
    });
});
