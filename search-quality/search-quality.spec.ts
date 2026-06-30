import { test, expect } from "@playwright/test";
import fixture from "./queries.json";
import searchRanking from "../src/lib/search-ranking.json";

/**
 * Search-quality regression harness.
 *
 * Loads the built Pagefind index (served from out/) and checks that real
 * queries surface the right canonical page — using the SAME ranking config the
 * app ships (src/lib/search-ranking.json), so the two can never drift.
 *
 * `queries` are asserted (expected page must be within topN). `knownIssues` are
 * reported only — tracked so we can watch them improve, but they don't fail the
 * run. Seed/maintain the fixture from real demand (PostHog on-site search + GSC).
 *
 * Requires a production build first:  npm run build  (then `npm run search:quality`).
 */

type Entry = { q: string; expect: string | null; note?: string };

const SCAN_LIMIT = 25; // how deep to look for the expected page when reporting rank

test("canonical pages rank for their queries", async ({ page }) => {
  await page.goto("/");

  // Run every query in the page context against the real index + shipped ranking.
  const { asserted, known } = await page.evaluate(
    async ({ ranking, queries, knownIssues, scanLimit }) => {
      // @ts-expect-error — Pagefind is loaded at runtime from the static index
      const pf = await import(/* webpackIgnore: true */ "/pagefind/pagefind.js");
      await pf.init();
      await pf.options({ ranking });

      const rankOne = async (q: string, expectUrl: string | null) => {
        const s = await pf.search(q);
        const limit = Math.min(s.results.length, scanLimit);
        let rank: number | null = null;
        for (let i = 0; i < limit; i++) {
          const d = await s.results[i].data();
          if (expectUrl && d.url && d.url.includes(expectUrl)) {
            rank = i + 1;
            break;
          }
        }
        const top = s.results[0] ? (await s.results[0].data()).url : null;
        return { rank, total: s.results.length, top };
      };

      const run = async (list: { q: string; expect: string | null }[]) => {
        const out = [];
        for (const item of list) {
          const r = await rankOne(item.q, item.expect);
          out.push({ q: item.q, expect: item.expect, ...r });
        }
        return out;
      };

      return { asserted: await run(queries), known: await run(knownIssues) };
    },
    {
      ranking: searchRanking,
      queries: fixture.queries as Entry[],
      knownIssues: fixture.knownIssues as Entry[],
      scanLimit: SCAN_LIMIT,
    },
  );

  const topN = fixture.topN;
  const fmtRank = (r: number | null) => (r === null ? `>${SCAN_LIMIT}` : `#${r}`);
  const stripHtml = (u: string | null) => (u ? u.replace(/\.html$/, "") : "(none)");

  // ---- Scorecard ----
  const passes = asserted.filter((r) => r.rank !== null && r.rank <= topN).length;
  const lines: string[] = [];
  lines.push("");
  lines.push(`Search quality — asserted ${passes}/${asserted.length} in top ${topN}`);
  lines.push("─".repeat(72));
  for (const r of asserted) {
    const ok = r.rank !== null && r.rank <= topN;
    const flag = ok ? "PASS" : "FAIL";
    const detail = ok ? "" : `  (got ${stripHtml(r.top)})`;
    lines.push(`  [${flag}] ${fmtRank(r.rank).padEnd(5)} ${r.q.padEnd(34)} -> ${r.expect}${detail}`);
  }
  lines.push("");
  lines.push("Known issues (reported, not asserted):");
  lines.push("─".repeat(72));
  for (const r of known) {
    const target = r.expect ? `${fmtRank(r.rank)} -> ${r.expect}` : `no canonical page (top: ${stripHtml(r.top)})`;
    lines.push(`  ${r.q.padEnd(20)} ${target}`);
  }
  lines.push("");
  console.log(lines.join("\n"));

  // ---- Assertions (soft, so every miss is reported in one run) ----
  for (const r of asserted) {
    const rank = r.rank ?? Number.POSITIVE_INFINITY;
    expect
      .soft(rank, `"${r.q}" should surface ${r.expect} in top ${topN} (got ${fmtRank(r.rank)}: ${stripHtml(r.top)})`)
      .toBeLessThanOrEqual(topN);
  }
});
