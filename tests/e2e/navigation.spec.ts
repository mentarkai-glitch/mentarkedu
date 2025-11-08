import { test, expect, Page } from "@playwright/test";

const studentEmail = process.env.E2E_STUDENT_EMAIL;
const studentPassword = process.env.E2E_STUDENT_PASSWORD;

test.describe("public navigation", () => {
  test("landing page renders hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Beyond Marks.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Get Started/i })).toBeVisible();
  });

  test("header links navigate without errors", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Smart Search/i }).click();
    await expect(page).toHaveURL(/\/search/);
  });
});

test.describe("student dashboard experience", () => {
  test.skip(!studentEmail || !studentPassword, "E2E_STUDENT_EMAIL and E2E_STUDENT_PASSWORD env vars required");

  test("student can login and view dashboard quick actions", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard(\/student)?/);
    await expect(page.getByText(/Daily Assistant/i)).toBeVisible();
    await expect(page.getByText(/Smart Search/i)).toBeVisible();
  });

  test("student sidebar links are reachable", async ({ page }) => {
    await login(page);

    const sidebarLinks = [
      { name: "Daily Assistant", urlFragment: "/dashboard/student/daily-assistant" },
      { name: "My ARKs", urlFragment: "/dashboard/student/arks" },
      { name: "Study Analyzer", urlFragment: "/dashboard/student/study" },
      { name: "Practice Questions", urlFragment: "/dashboard/student/practice" },
      { name: "Project Helper", urlFragment: "/dashboard/student/projects" },
      { name: "Academic Papers", urlFragment: "/dashboard/student/papers" },
      { name: "Cutoff Predictor", urlFragment: "/dashboard/student/cutoffs" },
      { name: "Form Filler", urlFragment: "/dashboard/student/forms" },
      { name: "Job Matcher", urlFragment: "/dashboard/student/jobs" },
      { name: "Emotion Check", urlFragment: "/dashboard/student/emotion" },
      { name: "Progress", urlFragment: "/dashboard/student/progress" },
      { name: "Achievements", urlFragment: "/dashboard/student/achievements" },
      { name: "Peer Matches", urlFragment: "/dashboard/student/peers" },
      { name: "Doubt Solver", urlFragment: "/dashboard/student/doubt-solver" },
    ];

    for (const link of sidebarLinks) {
      await page.getByRole("link", { name: link.name, exact: false }).first().click();
      await expect(page).toHaveURL(new RegExp(link.urlFragment));
      await page.goBack();
    }
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

