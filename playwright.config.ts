import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const localTestEnvironment = {
  ...process.env,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/afnan-e2e",
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "afnan-e2e",
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET || "e2e-only-secret-that-is-at-least-32-characters",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://127.0.0.1:3000",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "re_e2e_placeholder",
  AUTH_EMAIL_FROM: process.env.AUTH_EMAIL_FROM || "Afnan E2E <e2e@afnan.invalid>",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@afnan.invalid",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "list",
  use: {
    baseURL: externalBaseUrl || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "npm start",
        url: "http://127.0.0.1:3000/api/health",
        env: localTestEnvironment,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
