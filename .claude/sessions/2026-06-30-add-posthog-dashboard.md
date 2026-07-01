---
date: 2026-06-30
summary: Built a PostHog analytics dashboard for blog traffic and referring sources, with bot + legacy-path filtering
tags: [analytics, posthog, dashboard, mcp, bot-filtering]
---

## Summary

Stood up the first PostHog dashboard for aaronroy.com ("Blog Analytics — Traffic &
Sources", pinned) and analyzed the initial traffic. All work was done via the PostHog MCP —
**no repo code changed** except a CLAUDE.md doc update. Data is a day old (ingestion started
2026-06-30 after the reverse-proxy fix), so the numbers are a heartbeat, not a trend.

## Changes

- **PostHog (project `491375`)** — created dashboard `1782625` with 5 insights:
  - Total pageviews (30d, BoldNumber) — `EkgltzZJ`
  - Pageviews over time (30d, line: pageviews + unique visitors) — `rZIjZaS3`
  - Pageviews by post / page (30d, bar, breakdown `$pathname`) — `cvX81Ci1`
  - Referring sources (30d, pie, breakdown `$referring_domain`) — `arWBmNhj`
  - Outbound link clicks (30d, bar, breakdown `$external_click_url`) — `5U9Q6xQ5`
  - The four pageview tiles filter out `$virt_is_bot = true` **and** `$pathname ~ ^/hynews/`.
- **CLAUDE.md** — added a "Querying via the PostHog MCP" + "Dashboard" block to the Analytics
  section (project id, the MCP-defaults-to-GlutenOrNot gotcha, key event properties, dashboard
  link) and a Recent Changes entry.

## Decisions

- **Two-layer noise filter, not just a bot filter.** The `/hynews/*` hits (old WordPress URLs)
  classify as `Regular`/not-a-bot — they come from a real Chrome UA (link scanner / dead-URL
  probe), so `$virt_is_bot` alone misses them. The explicit `$pathname not_regex ^/hynews/` is
  what actually strips them; the bot filter is future-proofing for JS-executing crawlers.
- **Filters scoped per-insight, not project-wide.** Kept the change contained and reversible;
  flagged project-level internal/test-account filters as the durable alternative if wanted later.

## Notes

- Initial traffic (first ~24h, 33 raw pageviews): one post carries it — "go get yourself a
  personal agent" (~21 views), driven almost entirely by LinkedIn. Direct + LinkedIn ≈ all
  traffic; no organic search yet.
- `$virt_is_bot` only catches bots that run JS and fire `$pageview`. Measuring AI crawlers
  (GPTBot/ClaudeBot) for AEO would need server-log ingestion (Vercel logs → `$http_log`) — a
  separate lift, relevant to the entity/SEO work.
