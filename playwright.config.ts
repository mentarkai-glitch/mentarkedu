import { defineConfig, devices, type ReporterDescription } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", override: false });

const isCI = !!process.env.CI;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const reporters: ReporterDescription[] = [["list"]];

if (isCI) {
  reporters.push(["html", { outputFolder: "playwright-report" }]);
}

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  retries: isCI ? 1 : 0,
  reporter: reporters,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});

