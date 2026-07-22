---
name: blog-publish
description: Use when a post for aaronroy.com should go live or a new draft file is needed — "publish this", "ship this post", "put this on the site", "new blog post", a finished draft handed over as a Notion URL, repo file, or pasted text. For editorial feedback on the words, use blog-review instead; this skill handles the mechanics of getting a post onto the site.
argument-hint: <slug | file-path | notion-url | "new post about X">
---

# blog-publish

Get a post onto aaronroy.com in **one commit** — no nit-fix tail, no forgotten
curation steps. Editorial quality is blog-review's job; ideation and promotion
are content-plan's. This skill owns everything between "draft is done" and
"post is live and verified".

## Mode detection

- **No draft exists yet** ("new post about X") → **Scaffold**
- **Draft exists** (repo file, Notion URL, or pasted text) → **Publish**

## Scaffold mode

Create `src/content/blog/<kebab-slug>.md`:

```markdown
---
title: "<Title>"
description: "TODO-DESCRIPTION — replace before publish (120-160 chars, handcrafted)"
pubDate: <today>
categories: [<from the existing set only — see category rule below>]
draft: true
---
```

Tell Aaron the post's images belong in `public/images/<kebab-slug>/` and stop.
Writing happens outside this skill.

## Publish mode

### 1. Ingest

- Notion URL → fetch via Notion MCP (`notion-fetch`); download any images to
  `public/images/<slug>/`
- Pasted text → write to `src/content/blog/<kebab-slug>.md`
- Repo file → use as-is

If the post hasn't been through blog-review, offer it once; proceed either way.

### 2. Pre-publish checklist

Run every row. Each row's procedure is the check — "looks fine" is not a result.

| # | Check | Procedure |
|---|-------|-----------|
| 1 | Frontmatter schema | Parses as YAML; has title, description, pubDate; matches `src/content/config.ts` |
| 2 | Description quality | 120–160 chars, specific and handcrafted. "Present" is not the bar — a placeholder or generic sentence fails this row |
| 3 | pubDate | Equals today's date |
| 4 | Categories pre-exist | A category is valid only if **another published post already uses it**. Check with `grep -l '<category>' src/content/blog/*.md*` excluding this post (`node scripts/count-categories.js` counts this post too, so its output self-confirms — don't trust a count of 1). Any new category → stop and ask Aaron |
| 5 | Image location + naming | Every post image lives in `public/images/<kebab-slug>/` with kebab-case filenames. No spaces anywhere in the path. Older folders with spaces (e.g. `Experiments with Strava MCP/`) are legacy warts, not precedent — move/rename and update references |
| 6 | Image weight | Each image ≤ 300 KB. Over → downscale to ≤ 1600px wide (`sips --resampleWidth 1600`) and/or `pngquant --quality=65-85` |
| 7 | Image references resolve | Every `![...]` path maps to a real file |
| 7b | Image captions | A visible caption is an italic line directly under the image (no blank line between): `![alt](...)` then `*caption*` — `.prose img + em` in `src/styles/global.css` styles it. Don't hand-write `<figure>/<figcaption>` HTML in new posts |
| 8 | OG image | If Aaron supplied one: resize/crop to 1200×630 → `public/og-images/<slug>-og.png`, set `heroImage`. If not: publish with the site default, and the gate report's Follow-ups section MUST contain "custom OG image". Never block on this row |
| 9 | External links | Fetch each once; non-200 → flag (fix or ask, don't silently delete Aaron's sentences — content edits get listed in the gate report) |
| 10 | Internal links | Trailing slashes on all of them |
| 11 | llms.txt | Explicit decision: is this post evergreen/notable? Yes → add an entry to `public/llms.txt`. No → record "skipped: <reason>" in the gate report. Silence fails this row |
| 12 | Publish flip | Remove `draft: true` |
| 13 | Tests | `npm run test` passes |

### 3. Gate

Present, then **stop and wait for Aaron's go**:

1. The checklist as a table with per-row results
2. Any content edits made (changed sentences, removed links)
3. Diff summary (`git diff --stat`)
4. **Follow-ups** — deferred items (OG image, llms.txt reasoning)

### 4. Publish (only after "go")

```bash
git add <post + images> && git commit -m "Publish: <title>" && git push
```

Single commit; don't also run /ship for the post. Then verify live:
`curl -sI https://aaronroy.com/<slug>/` returns 200 (Vercel takes ~1 min) and
the post appears in `https://aaronroy.com/rss.xml`.

Once live-verified, ping IndexNow so Bing-family engines pick it up fast:

```bash
node scripts/indexnow-submit.js /<slug>/
```

(It fails loud if the key file or URL isn't live — rerun after the deploy
settles rather than skipping.) Report the live URL, follow-ups, and point at
content-plan for promotion.

## Common mistakes

- **Category self-confirmation** — validating categories against a list that
  includes the post being checked. The baseline test shipped a brand-new
  category this way.
- **Treating legacy files as convention** — the repo contains pre-cleanup
  warts (folders with spaces, heavy images). The rules above override
  whatever git history suggests.
- **"Description present" ≠ "description done"** — row 2 is a quality bar,
  not an existence check.
- **Silent OG fallback** — publishing with the default image is fine;
  publishing without *saying so* is not.
