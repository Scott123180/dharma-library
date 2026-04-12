/**
 * Shared Playwright fixtures for Dharma Library tests.
 *
 * All network calls to /dev-data/** are intercepted so tests never hit a real
 * server or CloudFront endpoint. The fixture index contains 25 entries: the 9
 * talks that have real JSON files in public/dev-data/talks/ (positions 0-8)
 * plus 16 lightweight metadata-only entries (positions 9-24) to exercise
 * pagination (PAGE_SIZE = 24, so 25 entries produces two pages).
 *
 * Any talk fetch for an ID that does not have a fixture file is answered with a
 * copy of talk 37675 (patched with the requested ID) so the featured-talk
 * section always renders regardless of which month the tests run.
 */

import { test as base } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV_DATA_DIR = path.join(__dirname, "..", "public", "dev-data");
const TALKS_DIR = path.join(DEV_DATA_DIR, "talks");

// The 9 talks that have full JSON fixture files on disk.
export const KNOWN_TALK_IDS = [
  "24525",
  "24526",
  "24769",
  "24780",
  "25342",
  "27044",
  "31782",
  "37675",
  "37828"
] as const;

// The first known talk is used as the default for navigation-to-detail tests.
export const DEFAULT_TALK_ID = "24525";
export const DEFAULT_TALK_TITLE = "Hakuin's Song of zazen";

// Talk used to verify audio / transcript detail behaviour (has both).
export const TRANSCRIPT_TALK_ID = "24526";
export const TRANSCRIPT_TALK_TITLE = "Perfection of Giving";

// 25-entry fixture index: 9 known + 16 metadata-only padding entries.
// Keeping known talks at positions 0-8 ensures that every possible
// featured-talk index (year * month % 6000 % 25) that falls in 0-8 resolves
// to a real file. For positions 9-24 the route handler falls back to a known
// talk file so the page never 404s.
export const FIXTURE_INDEX = [
  { date: "1994-12-11 00:00", duration: "0:31:29", id: "24525", summary: "", tags: [], teacher: "Bonnie Myotai Treace", title: "Hakuin's Song of zazen", ts: 3 },
  { date: "1994-12-16 11:04", duration: "0:38:46", id: "24526", summary: "", tags: [], teacher: "John Daido Loori", title: "Perfection of Giving", ts: 3 },
  { date: "1994-12-18 11:24", duration: "0:42:49", id: "24769", summary: "", tags: [], teacher: "John Daido Loori", title: "The Great Pearls Dana", ts: 2 },
  { date: "1995-01-26 11:24", duration: "0:33:33", id: "24780", summary: "", tags: [], teacher: "", title: "Spiritual Fidelity", ts: 1 },
  { date: "1995-11-12 16:33", duration: "0:39:31", id: "25342", summary: "", tags: [], teacher: "Geoffrey Shugen Arnold", title: "Stillness and Commotion", ts: 2 },
  { date: "1989-10-21 17:23", duration: "0:10:06", id: "27044", summary: "", tags: [], teacher: "John Daido Loori", title: "daido's shinsanshiki tape 2", ts: 3 },
  { date: "2017-12-24 12:59", duration: "0:41:53", id: "31782", summary: "", tags: [], teacher: "Geoffrey Shugen Arnold", title: "Disclosing Is Not As Good As Practice", ts: 2 },
  { date: "2024-07-07 12:59", duration: "0:44:46", id: "37675", summary: "", tags: [], teacher: "Geoffrey Shugen Arnold", title: "We The People", ts: 2 },
  { date: "2025-03-02 12:59", duration: "0:40:41", id: "37828", summary: "", tags: [], teacher: "Jody Hojin Kimmel", title: "Auspicious! Auspicious! Spring 2025 Ango Opening Talk", ts: 1 },
  // Padding entries (metadata only — no talk JSON file needed for list display)
  { date: "1995-01-22 11:24", duration: "0:42:47", id: "24778", summary: "", tags: [], teacher: "Bonnie Myotai Treace", title: "Practicing Perfection", ts: 3 },
  { date: "1995-01-27 11:24", duration: "0:34:19", id: "24781", summary: "", tags: [], teacher: "Bonnie Myotai Treace", title: "Alphabet Soup", ts: 3 },
  { date: "1995-02-22 11:24", duration: "0:36:27", id: "24795", summary: "", tags: [], teacher: "Geoffrey Shugen Arnold", title: "Bodhidarma's Beholding the Mind", ts: 2 },
  { date: "1995-02-24 11:24", duration: "0:25:38", id: "24798", summary: "", tags: [], teacher: "John Daido Loori", title: "Master Unmon's Sermon", ts: 3 },
  { date: "1995-06-25 11:24", duration: "0:50:28", id: "24875", summary: "", tags: [], teacher: "", title: "Shuso Hossen Dharma Combat", ts: 1 },
  { date: "2015-05-10 16:33", duration: "0:41:20", id: "25332", summary: "", tags: [], teacher: "", title: "Master Keichu Makes a Cart", ts: 1 },
  { date: "1996-05-12 16:33", duration: "0:40:23", id: "25421", summary: "", tags: [], teacher: "", title: "Jukai", ts: 1 },
  { date: "1996-06-22 16:33", duration: "0:46:13", id: "25433", summary: "", tags: [], teacher: "John Daido Loori", title: "Xiangyan's Great Enlightenment", ts: 2 },
  { date: "1996-07-13 16:33", duration: "0:49:46", id: "25439", summary: "", tags: [], teacher: "", title: "Zen Training For Therapists", ts: 1 },
  { date: "1996-07-24 16:33", duration: "0:43:55", id: "25443", summary: "", tags: [], teacher: "John Daido Loori", title: "Chang-Sha's Stop Illusory Thinking", ts: 2 },
  { date: "1996-08-11 15:16", duration: "0:39:30", id: "25781", summary: "", tags: [], teacher: "Bonnie Myotai Treace", title: "Planting Flowers On A Smooth River Stone", ts: 2 },
  { date: "1996-10-25 15:16", duration: "0:49:21", id: "25807", summary: "", tags: [], teacher: "John Daido Loori", title: "Tienhuang's Essential Dharma Gate", ts: 2 },
  { date: "1997-01-05 15:16", duration: "0:43:36", id: "25843", summary: "", tags: [], teacher: "Bonnie Myotai Treace", title: "January Fog: The Cloud Gate", ts: 2 },
  { date: "1990-07-29 00:00", duration: "0:46:43", id: "26701", summary: "", tags: [], teacher: "John Daido Loori", title: "Chimon And The Essence Of Prajna", ts: 2 },
  { date: "1990-08-25 00:00", duration: "0:55:01", id: "26705", summary: "", tags: [], teacher: "John Daido Loori", title: "Dawei's Exploring Spiritual Powers", ts: 2 },
  { date: "1990-08-26 00:00", duration: "0:51:28", id: "26706", summary: "", tags: [], teacher: "John Daido Loori", title: "Yangshan Can't Say It", ts: 2 }
];

/** Fallback full talk returned when a requested ID has no fixture file. */
function loadFallbackTalk(requestedId: string): Record<string, unknown> {
  const fallbackPath = path.join(TALKS_DIR, "37675.json");
  const fallback = JSON.parse(fs.readFileSync(fallbackPath, "utf8")) as Record<string, unknown>;
  return { ...fallback, id: requestedId };
}

/**
 * Custom `test` that intercepts all /dev-data network requests so tests are
 * fully offline. Import this in every spec file instead of @playwright/test.
 */
export const test = base.extend<object>({
  page: async ({ page }, use) => {
    // Intercept the talks index.
    await page.route("**/dev-data/talks-index.json", (route) => {
      route.fulfill({ json: FIXTURE_INDEX });
    });

    // Intercept individual talk fetches.
    await page.route("**/dev-data/talks/*.json", (route) => {
      const url = route.request().url();
      const filename = url.split("/").pop() ?? "";
      const id = filename.replace(".json", "");
      const localPath = path.join(TALKS_DIR, `${id}.json`);
      if (fs.existsSync(localPath)) {
        const data = JSON.parse(fs.readFileSync(localPath, "utf8")) as unknown;
        route.fulfill({ json: data });
      } else {
        // Return a patched copy of a known talk so the UI always renders.
        route.fulfill({ json: loadFallbackTalk(id) });
      }
    });

    await use(page);
  }
});

export { expect } from "@playwright/test";
