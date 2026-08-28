---
date: 2026-08-28
summary: Published "Fable flagged my Airbnb camera scan as a cybersecurity risk"; built a custom OG image from an oddly-shaped screenshot via a Pillow letterbox composite; scheduled (then consolidated) a Buttondown catch-up send on the calendar
tags: [blog, publishing, og-images, buttondown, calendar]
---

## Summary

Drafted and published a short reaction post about Fable 5's safeguards tripping on a
defensive network scan mid-vacation. Iterated the frontmatter description with Aaron
over a few rounds, ran the full blog-publish gate, and built a custom OG image from
the safeguard-rejection screenshot despite it being a poor fit for 1200×630. Closed
by scheduling a consolidated Buttondown send for both of August's posts and cancelling
a now-redundant single-post send.

## Changes

- `src/content/blog/fable-flagged-my-airbnb-camera-scan-as-a-cybersecurity-risk.md` -
  new post; description iterated to "I tripped Fable's safeguards 12 minutes into a
  network scan..."; added an archive link to `how-to-stay-ahead-of-online-scammers`;
  fixed `categories:` back to inline `[...]` form after Obsidian reformatted it to
  YAML block-list (failed the smoke test's parser); `heroImage` set
- `public/images/fable-flagged-my-airbnb-camera-scan-as-a-cybersecurity-risk/` - two
  screenshots (safeguard message, Kimi K3 comparison)
- `public/og-images/fable-flagged-my-airbnb-camera-scan-as-a-cybersecurity-risk-og.png` -
  custom OG image, letterboxed from the safeguard screenshot
- `.claude/skills/blog-publish/SKILL.md` - Common mistakes entry on letterboxing a
  non-standard-aspect-ratio source image for row 8, since this machine has no
  ImageMagick

Outside this repo (Google Calendar): scheduled "Buttondown send: August writing
roundup" (Sun 2026-08-30, 8:00-8:30 PM ET) covering both August posts; cancelled the
earlier single-post "Buttondown send: LLM-costs post" event at Aaron's request to
avoid two sends the same evening.

Commits: 3d5844a (draft), a3bf7de (publish)

## Decisions

**Letterboxed the OG image rather than stretching or hard-cropping it.** The source
screenshot was 2462×268 (9.2:1) — nothing like 1200×630. Composited it onto a
1200×630 canvas filled with the screenshot's own near-black background (`rgb(5,5,5)`),
scaled ~1.37x, and cropped so the frame ends on a complete clause ("Fable 5's
safeguards flagged this message.") instead of mid-word. No ImageMagick on this
machine, so used a throwaway `python3 -m venv` + Pillow rather than fighting `sips`
(which can't composite onto a canvas).

**Skipped llms.txt.** This is an incident/reaction post tied to one model's behavior
on a specific day, not evergreen reference content — recorded as an explicit skip
per the blog-publish gate rather than silently omitted.

## Notes

- Obsidian reformatting `categories:` into YAML block-list style is a recurring risk
  whenever Aaron edits frontmatter through the vault symlink — the smoke test only
  parses the inline `[...]` form. Worth a glance any time a vault-edited post fails
  the "categories present but not parsed" test.
