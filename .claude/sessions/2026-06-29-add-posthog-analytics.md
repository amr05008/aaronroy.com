---
date: 2026-06-29
summary: Added privacy-conscious PostHog analytics + an adblock-resistant reverse proxy; debugged a trailingSlash conflict that silently dropped pageviews
tags: [analytics, posthog, vercel, reverse-proxy, privacy, debugging]
---

## Summary

Instrumented aaronroy.com with PostHog (alongside the existing Vercel Analytics) to feed the
`content-studio` content-performance loop — referral sources, per-post traffic, time-on-page, give-link
clicks. Then added a reverse proxy so adblockers can't drop it. Verified end-to-end by querying PostHog
for real pageviews (not just "script loads"), which is how a subtle proxy bug got caught.

## Changes

- `src/components/PostHogAnalytics.astro` — posthog-js init; anonymous (`person_profiles: identified_only`),
  no session recording, respects DNT; pageview + pageleave + autocapture. **Emits nothing when
  `PUBLIC_POSTHOG_KEY` is unset** → safe to deploy un-configured.
- `src/layouts/BaseLayout.astro` — renders the component (Vercel Analytics untouched).
- `vercel.json` — reverse-proxy rewrites: `/zuko/*` → PostHog (assets to `us-assets`, capture/endpoints to `us.i`).
- `.env.example`, `CLAUDE.md` (Analytics section) — wiring + the trailingSlash gotcha.

Commits: `b3f1a6a` (add) → `136c269` (proxy) → `6b66be8` (proxy fix) → `ee6bdd4` (docs). Verified live:
a real pageview POSTs to `/zuko/e/` → 200 → lands in PostHog project `491375`.

## Key decision / bug (session-specific)

- **Path name `/zuko`** is deliberately non-obvious (PostHog docs: blockers catch `/ingest`, `/analytics`).
- **The bug that mattered:** the first proxy version looked healthy (assets 200'd) but the capture POST to
  `/zuko/e/` returned Vercel's 404 — pageviews **silently stopped landing**. Root cause: `trailingSlash: true`
  (needed for blog SEO) makes Vercel's `/zuko/:path*` wildcard skip trailing-slash paths, and posthog-js
  (with a custom `api_host`) POSTs to `/zuko/e/`. **Fix:** explicit *literal* rewrites per endpoint
  (`/e/`, `/i/v0/e/`, `/flags/`, `/decide/`) — literal sources match where `:path*` doesn't. If you add an
  endpoint, add its literal rewrite or it'll silently 404.

## Notes

- This is the hub-analytics half of the two-sided performance loop; the other half (twitter-watcher) +
  the strategy live in `~/repos/content-studio`.
- Aaron must create the PostHog project + set `PUBLIC_POSTHOG_KEY` in Vercel (done this session). The key is
  public (`phc_…`), wired via env so it's not hardcoded.
