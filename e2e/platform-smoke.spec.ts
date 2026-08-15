import { expect, test } from "@playwright/test";

test("health endpoint is live and not cacheable", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  expect(response.headers()["cache-control"]).toContain("no-store");
  await expect(response.json()).resolves.toMatchObject({
    status: "ok",
    service: "afnan-web",
  });
});

test("anonymous admin access is redirected to login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/login\?returnTo=%2Fadmin/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
});

test("robots excludes private and transactional routes", async ({ request }) => {
  const response = await request.get("/robots.txt");
  const body = await response.text();

  for (const path of ["/admin/", "/account/", "/cart/", "/checkout/", "/orders/"]) {
    expect(body).toContain(`Disallow: ${path}`);
  }
});
