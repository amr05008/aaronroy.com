---
date: 2026-07-23
summary: Email notification layer — Buttondown capture form at the bottom of blog posts, plus subscribe-flow landing pages
tags: [email, buttondown, posthog, seo]
---

## Summary
Added the email notification layer: a quiet capture form at the bottom of every
blog post posting natively to Buttondown's embed endpoint (username `aaronroy`),
plus two redirect landing pages (`/subscribed/`, `/confirmed/`) so readers
return to the site instead of stranding on Buttondown after submitting.
TDD throughout; suite grew 21 → 26 tests.

## Changes
- `src/components/EmailNotify.astro` (new) — copy + email input + "Notify me"
  button; native POST (no widget JS); PostHog `email_notify_submitted` fired via
  `sendBeacon` (survives the unload; form never depends on PostHog existing)
- `src/layouts/BlogPost.astro` — renders EmailNotify after the article, before
  PostNavigation (posts only)
- `src/pages/subscribed.astro` / `confirmed.astro` (new) — Buttondown redirect
  targets ("check your email" / "you're on the list"); noindex, unlinked
- `src/layouts/BaseLayout.astro` — optional `noindex` prop
- `astro.config.mjs` — sitemap filter excluding the two landing pages
- `src/config.ts` — `BUTTONDOWN_USERNAME`, shared by component + tests
- `tests/smoke.spec.ts` — 5 new tests (form present on posts with correct
  action / absent elsewhere; landing pages render + noindex; sitemap exclusion)

## Decisions
- **Free plan, manual sends**: RSS-to-email turned out to be paid ($9/mo);
  Aaron sends a short manual notification per post (1–2×/month) until ~100
  subscribers, which is both the free sending cap and the planned revisit point.
- **Copy** (Aaron, final): "Get an email when I post something new. 1-2 posts
  per month." — promises a notification (link-out), not the post in the inbox,
  matching what manual sends deliver.
- **Double opt-in verified live**: it's Buttondown's default (no toggle exists);
  test submit produced a confirmation email, subscriber doesn't count unconfirmed.
- Buttondown settings: welcome email OFF, reminders OFF, cleanup ON; redirects
  → `/subscribed/` and `/confirmed/` (set by Aaron post-deploy).
- Full decision record: `docs/PLAN-email-notification-layer.md` (local-only,
  git-excluded — this repo is public).

## Notes
- The manual send is now part of publishing a post — candidate addition to the
  `blog-publish` skill checklist so the reader promise can't be silently missed.
- Buttondown embed endpoint: `https://buttondown.com/api/emails/embed-subscribe/<username>`
  (the `.com` one; legacy `.email` 301s and would downgrade the POST).
- An abandoned duplicate Buttondown account exists tied to
  aaron.michael.roy@gmail.com (username `aaronmichaelroy`) — ignore/delete.
