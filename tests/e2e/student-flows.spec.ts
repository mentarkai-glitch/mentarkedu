import { test, expect, Page } from "@playwright/test";

const studentEmail = process.env.E2E_STUDENT_EMAIL;
const studentPassword = process.env.E2E_STUDENT_PASSWORD;

test.describe("student dashboard flows", () => {
  test.skip(!studentEmail || !studentPassword, "E2E_STUDENT_EMAIL and E2E_STUDENT_PASSWORD env vars required");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("daily assistant page renders key sections", async ({ page }) => {
    await page.goto("/dashboard/student/daily-assistant");
    await expect(page.getByRole("heading", { name: /Daily Assistant/i })).toBeVisible();
    await expect(page.getByText(/Tasks Completed/i)).toBeVisible();
  });

  test("study analyzer surfaces mastery signals", async ({ page }) => {
    await page.goto("/dashboard/student/study-analyzer");
    await expect(page.getByRole("heading", { name: /Study Analyzer/i })).toBeVisible();
    await expect(page.getByRole("tablist")).toBeVisible();
  });

  test("job matcher scaffold loads", async ({ page }) => {
    await page.goto("/dashboard/student/jobs");
    await expect(page.getByRole("heading", { name: /Job Matcher/i })).toBeVisible();
    await expect(page.getByText(/Find Your Perfect Job/i)).toBeVisible();
  });
});

async function login(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(studentEmail!);
  await page.getByLabel("Password").fill(studentPassword!);
  await Promise.all([
    page.waitForURL(/\/dashboard(\/student)?/, { timeout: 20_000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
}


