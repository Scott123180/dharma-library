/**
 * Search Talks page tests.
 *
 * All network calls are intercepted. The search API POST endpoint is mocked
 * inline via page.route() — it never hits the real AWS API Gateway.
 */

import { test, expect } from "./fixtures.js";

const SEARCH_ENDPOINT = "**/search";

const FIXTURE_RESULTS = [
  {
    talk_id: "37675",
    chunk_index: 2,
    chunk_text: "The nature of mind is fundamentally open and clear, like the sky.",
    similarity: 0.91,
  },
  {
    talk_id: "24525",
    chunk_index: 5,
    chunk_text: "When we sit in zazen we are not trying to achieve anything.",
    similarity: 0.76,
  },
  {
    talk_id: "24526",
    chunk_index: 1,
    chunk_text: "Giving without expectation is the perfection of dana.",
    similarity: 0.61,
  },
];

function mockSearch(
  page: Parameters<Parameters<typeof test>[1]>[0]["page"],
  results = FIXTURE_RESULTS,
  status = 200
) {
  return page.route(SEARCH_ENDPOINT, (route) => {
    if (status !== 200) {
      route.fulfill({ status, body: JSON.stringify({ error: "Service error" }) });
    } else {
      route.fulfill({ json: { results } });
    }
  });
}

// ─── User Story 1: Semantic Search ────────────────────────────────────────────

test.describe("Search Talks — US1: Semantic Search", () => {
  test("empty state: page loads with input focused and no results", async ({ page }) => {
    await mockSearch(page);
    await page.goto("/search-talks");

    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.getByRole("searchbox")).toBeFocused();
    await expect(page.locator(".search-empty-state")).toBeVisible();
    await expect(page.locator(".search-result-card")).toHaveCount(0);
  });

  test("valid query returns ranked result cards", async ({ page }) => {
    let requestBody: string | null = null;
    await page.route(SEARCH_ENDPOINT, (route) => {
      requestBody = route.request().postData();
      route.fulfill({ json: { results: FIXTURE_RESULTS } });
    });

    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("the nature of mind");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-result-card")).toHaveCount(3);

    // First card has the highest similarity passage
    const firstCard = page.locator(".search-result-card").first();
    await expect(firstCard.locator(".chunk-text")).toContainText(
      "The nature of mind is fundamentally open"
    );

    // Metadata from fixture index: talk 37675 = "We The People", Geoffrey Shugen Arnold
    await expect(firstCard).toContainText("We The People");
    await expect(firstCard).toContainText("Geoffrey Shugen Arnold");

    // Relevance indicator present with accessible label
    await expect(firstCard.locator(".relevance-indicator")).toBeVisible();

    // top_k: 10 sent in request
    expect(requestBody).toContain('"top_k":10');
  });

  test("query shorter than 3 chars shows validation message and makes no API call", async ({ page }) => {
    let apiCalled = false;
    await page.route(SEARCH_ENDPOINT, (route) => {
      apiCalled = true;
      route.fulfill({ json: { results: [] } });
    });

    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("ab");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-validation-error")).toBeVisible();
    expect(apiCalled).toBe(false);
  });

  test("query of exactly 150 chars is accepted", async ({ page }) => {
    await mockSearch(page, []);
    await page.goto("/search-talks");

    const query = "a".repeat(150);
    await page.getByRole("searchbox").fill(query);
    await expect(page.getByRole("searchbox")).toHaveValue(query);
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-validation-error")).not.toBeVisible();
  });

  test("submit button is disabled during loading", async ({ page }) => {
    let resolveSearch!: () => void;
    await page.route(SEARCH_ENDPOINT, (route) => {
      new Promise<void>((res) => { resolveSearch = res; }).then(() =>
        route.fulfill({ json: { results: FIXTURE_RESULTS } })
      );
    });

    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("impermanence");
    await page.getByRole("button", { name: /search/i }).click();

    // Button disabled while in-flight
    await expect(page.getByRole("button", { name: /search/i })).toBeDisabled();
    await expect(page.getByRole("searchbox")).toBeDisabled();

    resolveSearch();
    await expect(page.locator(".search-result-card")).toHaveCount(3);
    await expect(page.getByRole("button", { name: /search/i })).toBeEnabled();
  });

  test("zero-results state shown when API returns empty array", async ({ page }) => {
    await mockSearch(page, []);
    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("xyzzy no results");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-zero-results")).toBeVisible();
    await expect(page.locator(".search-result-card")).toHaveCount(0);
  });

  test("error state shown when API returns 500, retry button visible", async ({ page }) => {
    await mockSearch(page, [], 500);
    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("suffering");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-error")).toBeVisible();
    await expect(page.getByRole("button", { name: /retry/i })).toBeVisible();
  });

  test("keyboard-only flow: type → Enter → Tab to card → Enter opens talk", async ({ page }) => {
    await mockSearch(page);
    await page.goto("/search-talks");

    // Input is already focused — type without clicking
    await page.keyboard.type("the nature of mind");
    await page.keyboard.press("Enter");

    // Wait for results
    await expect(page.locator(".search-result-card")).toHaveCount(3);

    // Tab to the first "Open" button on the first card and activate it
    const openButton = page.locator(".search-result-card").first().getByRole("button", { name: /Open/i });
    await openButton.focus();
    await page.keyboard.press("Enter");

    // Should navigate to talk detail
    await expect(page).toHaveURL(/\/talk\//);
  });

  test("accessibility: relevance indicator has aria-label, input has accessible label", async ({ page }) => {
    await mockSearch(page);
    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("mind");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-result-card")).toHaveCount(3);

    // Input accessible label
    await expect(page.getByRole("searchbox")).toHaveAttribute("aria-label");

    // Relevance indicator has accessible text (first card has similarity 0.91 → "Excellent match")
    const firstIndicator = page.locator(".search-result-card").first().locator(".relevance-indicator");
    await expect(firstIndicator).toHaveAttribute("aria-label", "Excellent match");

    // Open button accessible
    await expect(
      page.locator(".search-result-card").first().getByRole("button", { name: /Open/i })
    ).toBeVisible();
  });
});

// ─── User Story 2: Jump to Matching Passage ───────────────────────────────────

test.describe("Search Talks — US2: Jump to Matching Passage", () => {
  test("Jump to text link is present with correct #:~:text= href", async ({ page }) => {
    await mockSearch(page);
    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("mind");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-result-card")).toHaveCount(3);

    const jumpLink = page.locator(".search-result-card").first().locator("a.jump-to-text");
    // In Chromium (Playwright default) Text Fragments are supported
    await expect(jumpLink).toBeVisible();
    const href = await jumpLink.getAttribute("href");
    expect(href).toContain("#:~:text=");
    expect(href).toContain(encodeURIComponent("The nature of mind").slice(0, 10));
  });

  test("Jump to text absent when Text Fragments not supported", async ({ page }) => {
    // Override document.fragmentDirective to simulate unsupported browser
    await page.addInitScript(() => {
      Object.defineProperty(document, "fragmentDirective", {
        get: () => undefined,
      });
    });

    await mockSearch(page);
    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("mind");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-result-card")).toHaveCount(3);
    await expect(page.locator("a.jump-to-text")).toHaveCount(0);
  });

  test("Open button navigates to talk page without a text fragment", async ({ page }) => {
    await mockSearch(page);
    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("mind");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-result-card")).toHaveCount(3);
    await page.locator(".search-result-card").first().getByRole("button", { name: /Open/i }).click();

    await expect(page).toHaveURL(/\/talk\//);
    await expect(page).not.toHaveURL(/#:~:text=/);
  });
});

// ─── User Story 3: Shareable & Bookmarkable ───────────────────────────────────

test.describe("Search Talks — US3: Shareable & Bookmarkable", () => {
  test("URL reflects query after search", async ({ page }) => {
    await mockSearch(page);
    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("compassion");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-result-card")).toHaveCount(3);
    await expect(page).toHaveURL(/[?&]q=compassion/);
  });

  test("deep link with ?q= pre-fills input and auto-triggers search", async ({ page }) => {
    await mockSearch(page);
    await page.goto("/search-talks?q=impermanence");

    await expect(page.getByRole("searchbox")).toHaveValue("impermanence");
    await expect(page.locator(".search-result-card")).toHaveCount(3);
  });

  test("cache is used on repeat search — no new POST request", async ({ page }) => {
    let callCount = 0;
    await page.route(SEARCH_ENDPOINT, (route) => {
      callCount++;
      route.fulfill({ json: { results: FIXTURE_RESULTS } });
    });

    await page.goto("/search-talks");
    await page.getByRole("searchbox").fill("mind");
    await page.getByRole("button", { name: /search/i }).click();
    await expect(page.locator(".search-result-card")).toHaveCount(3);
    expect(callCount).toBe(1);

    // Search again with the same query
    await page.getByRole("searchbox").fill("mind");
    await page.getByRole("button", { name: /search/i }).click();
    await expect(page.locator(".search-result-card")).toHaveCount(3);

    // Second search should use cache — no additional API call
    expect(callCount).toBe(1);
  });

  test("clearing input and submitting shows empty state, removes ?q=", async ({ page }) => {
    await mockSearch(page);
    await page.goto("/search-talks?q=mind");
    await expect(page.locator(".search-result-card")).toHaveCount(3);

    await page.getByRole("searchbox").fill("");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.locator(".search-empty-state")).toBeVisible();
    await expect(page).toHaveURL("/search-talks");
  });
});
