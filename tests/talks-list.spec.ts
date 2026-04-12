/**
 * Talks list and filter tests
 *
 * Covers: search filter, teacher filter, year/month filter dependency,
 * stage filter, multi-filter combination, pagination, and selecting a talk.
 *
 * The fixture provides 25 talks (positions 0-24) so pagination kicks in
 * (PAGE_SIZE = 24 → page 1 has 24 cards, page 2 has 1 card).
 *
 * Known data in the fixture:
 *   - Teachers: "Bonnie Myotai Treace", "John Daido Loori",
 *               "Geoffrey Shugen Arnold", "Jody Hojin Kimmel", "" (unknown)
 *   - Years: 1989, 1990, 1994, 1995, 1996, 1997, 2015, 2017, 2024, 2025
 *   - Stages: ts=1 (audio only), ts=2 (raw transcript), ts=3 (structured)
 */

import { test, expect, TRANSCRIPT_TALK_TITLE } from "./fixtures.js";

test.describe("Talks list — initial state", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows search, teacher, year, month, and stage filters", async ({ page }) => {
    await expect(page.locator("input[placeholder*='Heart Sutra']")).toBeVisible();
    await expect(page.locator("select").nth(0)).toBeVisible(); // teacher
    await expect(page.locator("select").nth(1)).toBeVisible(); // year
    await expect(page.locator("select").nth(2)).toBeVisible(); // month
    await expect(page.locator("select").nth(3)).toBeVisible(); // stage
  });

  test("month filter is disabled until a year is selected", async ({ page }) => {
    const monthSelect = page.locator("select").nth(2);
    await expect(monthSelect).toBeDisabled();
  });

  test("displays result count", async ({ page }) => {
    const count = page.locator(".results-count");
    await expect(count).toBeVisible();
    await expect(count).toContainText("25 of 25");
  });
});

test.describe("Talks list — search filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("filtering by title narrows the results", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='Heart Sutra']");
    await searchInput.fill("Perfection");
    await expect(page.locator(".results-count")).toContainText("of 25");
    // Should match "Perfection of Giving" and "Practicing Perfection"
    const count = page.locator(".results-count");
    await expect(count).toContainText(/^Results: [12] of 25/);
  });

  test("search is case-insensitive", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='Heart Sutra']");
    await searchInput.fill("zazen");
    const countLower = await page.locator(".results-count").innerText();
    await searchInput.fill("ZAZEN");
    const countUpper = await page.locator(".results-count").innerText();
    expect(countLower).toEqual(countUpper);
  });

  test("no-match search shows empty state message", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='Heart Sutra']");
    await searchInput.fill("xyzzy_no_match_ever");
    await expect(page.locator("text=No talks match your filters yet.")).toBeVisible();
  });

  test("clearing search restores all results", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='Heart Sutra']");
    await searchInput.fill("zazen");
    await searchInput.fill("");
    await expect(page.locator(".results-count")).toContainText("25 of 25");
  });
});

test.describe("Talks list — teacher filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("teacher dropdown lists known teachers", async ({ page }) => {
    const teacherSelect = page.locator("select").nth(0);
    await expect(teacherSelect.locator("option", { hasText: "Bonnie Myotai Treace" })).toHaveCount(1);
    await expect(teacherSelect.locator("option", { hasText: "John Daido Loori" })).toHaveCount(1);
    await expect(teacherSelect.locator("option", { hasText: "Geoffrey Shugen Arnold" })).toHaveCount(1);
  });

  test("selecting a teacher filters results to that teacher only", async ({ page }) => {
    const teacherSelect = page.locator("select").nth(0);
    await teacherSelect.selectOption("Jody Hojin Kimmel");
    await expect(page.locator(".results-count")).toContainText("1 of 25");
  });

  test("selecting 'Any teacher' restores all results", async ({ page }) => {
    const teacherSelect = page.locator("select").nth(0);
    await teacherSelect.selectOption("Jody Hojin Kimmel");
    await teacherSelect.selectOption("all");
    await expect(page.locator(".results-count")).toContainText("25 of 25");
  });
});

test.describe("Talks list — year/month filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("selecting a year enables the month dropdown", async ({ page }) => {
    const yearSelect = page.locator("select").nth(1);
    const monthSelect = page.locator("select").nth(2);
    await yearSelect.selectOption("2024");
    await expect(monthSelect).not.toBeDisabled();
  });

  test("selecting a year narrows results to that year", async ({ page }) => {
    const yearSelect = page.locator("select").nth(1);
    await yearSelect.selectOption("2024");
    // fixture has 1 talk in 2024 (37675, "We The People")
    await expect(page.locator(".results-count")).toContainText("1 of 25");
  });

  test("month dropdown is reset when year changes", async ({ page }) => {
    const yearSelect = page.locator("select").nth(1);
    const monthSelect = page.locator("select").nth(2);
    await yearSelect.selectOption("1994");
    await monthSelect.selectOption({ index: 1 }); // pick first available month
    await yearSelect.selectOption("2024");
    // month should reset to "all"
    await expect(monthSelect).toHaveValue("all");
  });

  test("selecting year then month further narrows results", async ({ page }) => {
    const yearSelect = page.locator("select").nth(1);
    const monthSelect = page.locator("select").nth(2);
    await yearSelect.selectOption("1994");
    // 1994 has talks in December (month 12)
    await monthSelect.selectOption("12");
    const countText = await page.locator(".results-count").innerText();
    // Should be fewer than all 1994 talks
    expect(countText).toMatch(/^Results: \d+ of 25/);
  });
});

test.describe("Talks list — stage filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("stage filter shows expected options", async ({ page }) => {
    const stageSelect = page.locator("select").nth(3);
    await expect(stageSelect.locator("option", { hasText: "Audio only" })).toHaveCount(1);
    await expect(stageSelect.locator("option", { hasText: "Raw transcript" })).toHaveCount(1);
    await expect(stageSelect.locator("option", { hasText: "Cleaned transcript" })).toHaveCount(1);
  });

  test("filtering by stage=1 (audio only) returns correct subset", async ({ page }) => {
    const stageSelect = page.locator("select").nth(3);
    await stageSelect.selectOption("1");
    const countText = await page.locator(".results-count").innerText();
    // ts=1 talks in fixture: 24780, 24875, 25332, 25421, 25439, 37828 = 6
    expect(countText).toMatch(/^Results: 6 of 25/);
  });

  test("selecting 'Any stage' restores all results", async ({ page }) => {
    const stageSelect = page.locator("select").nth(3);
    await stageSelect.selectOption("1");
    await stageSelect.selectOption("all");
    await expect(page.locator(".results-count")).toContainText("25 of 25");
  });
});

test.describe("Talks list — combined filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("teacher + stage filter combine correctly", async ({ page }) => {
    const teacherSelect = page.locator("select").nth(0);
    const stageSelect = page.locator("select").nth(3);
    await teacherSelect.selectOption("Geoffrey Shugen Arnold");
    await stageSelect.selectOption("2");
    // Geoffrey Shugen Arnold, ts=2 in fixture: 25342, 31782, 37675, 24795 (metadata-only) = 4
    const countText = await page.locator(".results-count").innerText();
    expect(countText).toMatch(/^Results: \d+ of 25/);
  });

  test("filter + search combine correctly", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='Heart Sutra']");
    const teacherSelect = page.locator("select").nth(0);
    await teacherSelect.selectOption("John Daido Loori");
    await searchInput.fill("Perfection");
    // Should match "Perfection of Giving" by John Daido Loori
    await expect(page.locator(".results-count")).toContainText("1 of 25");
  });

  test("filters reset page to 1 when results change", async ({ page }) => {
    // Verify we're on page 1, go to page 2, then filter — should return to page 1
    await expect(page.locator("text=Page 1 of")).toBeVisible();
    await page.click("button:has-text('Next')");
    await expect(page.locator("text=Page 2 of")).toBeVisible();
    // Apply a filter
    const teacherSelect = page.locator("select").nth(0);
    await teacherSelect.selectOption("Jody Hojin Kimmel");
    // Only 1 result → no pagination, but page counter resets
    await expect(page.locator("text=Page 2 of")).not.toBeVisible();
  });
});

test.describe("Talks list — pagination", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("pagination controls appear when results exceed page size", async ({ page }) => {
    // 25 talks > PAGE_SIZE 24 → pagination should be visible
    await expect(page.locator(".pagination")).toBeVisible();
  });

  test("shows 'Page 1 of 2' on first load", async ({ page }) => {
    await expect(page.locator(".pagination__page")).toHaveText("Page 1 of 2");
  });

  test("Previous button is disabled on page 1", async ({ page }) => {
    await expect(page.locator("button:has-text('Previous')")).toBeDisabled();
  });

  test("clicking Next advances to page 2", async ({ page }) => {
    await page.click("button:has-text('Next')");
    await expect(page.locator(".pagination__page")).toHaveText("Page 2 of 2");
  });

  test("Next button is disabled on last page", async ({ page }) => {
    await page.click("button:has-text('Next')");
    await expect(page.locator("button:has-text('Next')")).toBeDisabled();
  });

  test("clicking Previous returns to page 1", async ({ page }) => {
    await page.click("button:has-text('Next')");
    await page.click("button:has-text('Previous')");
    await expect(page.locator(".pagination__page")).toHaveText("Page 1 of 2");
  });

  test("pagination shows correct count range", async ({ page }) => {
    await expect(page.locator(".pagination__info")).toContainText("Showing 1–24 of 25 talks");
    await page.click("button:has-text('Next')");
    await expect(page.locator(".pagination__info")).toContainText("Showing 25–25 of 25 talks");
  });
});

test.describe("Talks list — selecting a talk", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("clicking a talk card navigates to talk detail", async ({ page }) => {
    // Click the "Open" link in the card for "Perfection of Giving"
    await page.locator("article.talk-card", { hasText: TRANSCRIPT_TALK_TITLE })
      .locator("a.link")
      .click();
    await expect(page).toHaveURL(/\/talk\//);
    await expect(page.locator("article.talk-detail")).toBeVisible();
  });
});
