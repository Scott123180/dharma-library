/**
 * Talk detail page tests
 *
 * Covers: metadata display, transcript rendering, audio player, data-lineage
 * tracker, print button, and the back button.
 *
 * Uses talk 24526 ("Perfection of Giving") as the primary fixture because it
 * has a full transcript and audio URL. Uses talk 37675 ("We The People") to
 * test data-lineage behaviour. Talk 24780 ("Spiritual Fidelity") has audio
 * but no transcript — used to verify the "no transcript" state.
 */

import { test, expect } from "./fixtures.js";

// Known fixture talk IDs / titles for talk-detail tests.
const TALK_WITH_TRANSCRIPT = { id: "24526", title: "Perfection of Giving", teacher: "John Daido Loori" };
const TALK_AUDIO_NO_TRANSCRIPT = { id: "24780", title: "Spiritual Fidelity" };
const TALK_WITH_LINEAGE = { id: "37675", title: "We The People" };

test.describe("Talk detail — metadata", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_TRANSCRIPT.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
  });

  test("renders the talk title as a heading", async ({ page }) => {
    await expect(page.locator("article.talk-detail h2")).toContainText(TALK_WITH_TRANSCRIPT.title);
  });

  test("renders the speaker in the meta line", async ({ page }) => {
    await expect(page.locator(".talk-detail__meta")).toContainText(TALK_WITH_TRANSCRIPT.teacher);
  });

  test("shows the Talk eyebrow label", async ({ page }) => {
    await expect(page.locator(".section__eyebrow", { hasText: "Talk" })).toBeVisible();
  });

  test("shows the Audio pill when audio is available", async ({ page }) => {
    await expect(page.locator(".talk-detail__pills .pill", { hasText: "Audio" })).toBeVisible();
  });

  test("shows the Transcript pill when transcript is available", async ({ page }) => {
    await expect(page.locator(".talk-detail__pills .pill", { hasText: "Transcript" })).toBeVisible();
  });

  test("details card renders with a heading", async ({ page }) => {
    await expect(page.locator(".talk-detail__card h3", { hasText: "Details" })).toBeVisible();
  });

  test("reading time is displayed when transcript is present", async ({ page }) => {
    // All fixture talks with transcripts should have a reading time
    await expect(page.locator("dt", { hasText: "Reading time" })).toBeVisible();
    await expect(page.locator("dd", { hasText: /minute read/ })).toBeVisible();
  });
});

test.describe("Talk detail — transcript", () => {
  test("renders transcript paragraphs when transcript exists", async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_TRANSCRIPT.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    const transcriptBody = page.locator(".transcript__body");
    await expect(transcriptBody).toBeVisible();
    // At least one paragraph of real text should be present
    const firstPara = transcriptBody.locator("p").first();
    await expect(firstPara).toBeVisible();
    await expect(firstPara).not.toContainText("Transcript not available yet.");
  });

  test("shows 'Transcript not available' when transcript is missing", async ({ page }) => {
    await page.goto(`/talk/${TALK_AUDIO_NO_TRANSCRIPT.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await expect(page.locator("text=Transcript not available yet.")).toBeVisible();
  });

  test("transcript section has a Transcript heading", async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_TRANSCRIPT.id}`);
    await expect(page.locator(".transcript h3, .talk-detail__card h3", { hasText: "Transcript" })).toBeVisible();
  });
});

test.describe("Talk detail — audio player", () => {
  test("audio card and inline audio element are rendered", async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_TRANSCRIPT.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await expect(page.locator(".talk-detail__card--audio")).toBeVisible();
    await expect(page.locator(".talk-detail__card--audio audio")).toBeVisible();
  });

  test("'Pop out mini player' button is visible when audio is available", async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_TRANSCRIPT.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await expect(page.locator("button:has-text('Pop out mini player')")).toBeVisible();
  });

  test("shows 'Add an audio URL' note when no audio", async ({ page }) => {
    // Route this specific talk to a version with no audioUrl
    await page.route(`**/dev-data/talks/24780.json`, (route) => {
      route.fulfill({
        json: {
          id: "24780",
          title: "Spiritual Fidelity",
          teacher: "",
          date: "1995-01-26 11:24",
          duration: "0:33:33",
          tags: [],
          summary: "",
          ts: 1,
          transcript: "",
          audioUrl: undefined
        }
      });
    });
    await page.goto(`/talk/${TALK_AUDIO_NO_TRANSCRIPT.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await expect(page.locator(".talk-detail__card--audio .talk-detail__note")).toBeVisible();
  });
});

test.describe("Talk detail — data lineage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/talk/${TALK_WITH_LINEAGE.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
  });

  test("data lineage tracker is rendered", async ({ page }) => {
    await expect(page.locator("dt", { hasText: "Data lineage" })).toBeVisible();
    await expect(page.locator(".lineage")).toBeVisible();
  });

  test("lineage steps are displayed as a list", async ({ page }) => {
    const steps = page.locator(".lineage__step");
    await expect(steps).toHaveCount(4); // 4 stages: audio, raw, structured, cleaned
  });

  test("completed steps have the is-complete class", async ({ page }) => {
    // Talk 37675 has dataLineage: ["audio_original", "transcript_raw"] → stages 1 and 2 complete
    const steps = page.locator(".lineage__step");
    await expect(steps.nth(0)).toHaveClass(/is-complete/);
    await expect(steps.nth(1)).toHaveClass(/is-complete/);
    await expect(steps.nth(2)).not.toHaveClass(/is-complete/);
  });
});

test.describe("Talk detail — data lineage panel", () => {
  test("'Show lineage details' toggle appears and expands when likeness scores exist", async ({ page }) => {
    // Route a talk with likeness scores so the toggle appears
    await page.route(`**/dev-data/talks/99999.json`, (route) => {
      route.fulfill({
        json: {
          id: "99999",
          title: "Test Talk With Likeness",
          speaker: "Test Speaker",
          date: "2024-01-01 00:00",
          tags: [],
          summary: "",
          ts: 4,
          transcript: "Test transcript content here.",
          audioUrl: "https://example.com/audio/test.mp3",
          dataLineage: [
            { stage: "audio_original" },
            { stage: "transcript_raw" },
            { stage: "transcript_structured", likeness: 0.92 },
            { stage: "transcript_cleaned", likeness: 0.97 }
          ]
        }
      });
    });
    await page.goto("/talk/99999");
    await expect(page.locator("article.talk-detail")).toBeVisible();
    const toggle = page.locator("button.lineage__toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveText("Show lineage details");
    await toggle.click();
    await expect(toggle).toHaveText("Hide lineage details");
    await expect(page.locator(".lineage__panel")).toBeVisible();
    await expect(page.locator("text=Raw → structured")).toBeVisible();
    await expect(page.locator("text=Structured → cleaned")).toBeVisible();
  });
});

test.describe("Talk detail — navigation", () => {
  test("clicking a talk card from the home page then Back returns home", async ({ page }) => {
    await page.goto("/");
    // Click the "Open" link in the card for the target talk
    await page.locator("article.talk-card", { hasText: TALK_WITH_TRANSCRIPT.title })
      .locator("a.link")
      .click();
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await page.click("button:has-text('Back to list')");
    await expect(page).toHaveURL("/");
  });

  test("URL updates to /talk/:id when a talk is opened", async ({ page }) => {
    await page.goto("/");
    await page.locator("article.talk-card", { hasText: TALK_WITH_TRANSCRIPT.title })
      .locator("a.link")
      .click();
    await expect(page).toHaveURL(`/talk/${TALK_WITH_TRANSCRIPT.id}`);
  });

  test("loading state is shown then replaced by content", async ({ page }) => {
    // The loading paragraph may flash briefly; by the time we assert the
    // article it should be gone and the detail article visible.
    await page.goto(`/talk/${TALK_WITH_TRANSCRIPT.id}`);
    await expect(page.locator("article.talk-detail")).toBeVisible();
    await expect(page.locator("text=Loading talk…")).not.toBeVisible();
  });
});
