# Notion ↔ Markdown sync: GlutenOrNot redesign post

> **⛔ DEPRECATED as of 2026-06-08 — DO NOT SYNC.** Aaron now edits the post **only** in
> the repo markdown file `src/content/blog/glutenornot-redesign.md`. The Notion page is a
> frozen, out-of-date snapshot. Do **not** push to or pull from it. The procedure below is
> retained for reference only.

Claude-mediated sync between a Notion page (prose editing surface) and a blog draft.
There is **no script and no background process** — Claude performs the sync on request
using the connected Notion MCP. Ask: **"push GlutenOrNot to Notion"** or
**"resync GlutenOrNot from Notion"**.

## Endpoints

- **Markdown file (source of truth for structure):** `src/content/blog/glutenornot-redesign.md`
- **Notion page (source of truth for prose):** https://www.notion.so/aaronmichaelroy/GlutenorNot-new-version-37af81204bc18087b9aecb5ea7efd13c
  - Page ID: `37af81204bc18087b9aecb5ea7efd13c`
  - Lives in the "aaronroy.com – writing" database (Projects → Aaron)

## The contract (what lives where)

| Element | Source of truth | In Notion? |
|---|---|---|
| Prose (paragraphs, headings, links text) | **Notion** | yes, editable |
| Frontmatter (title, description, pubDate, categories, heroImage, draft) | **Repo file** | no (mirrored loosely into Name/Description props only) |
| Figure images + captions | **Repo file** | shown as 📷 callout placeholders |
| Alternate-images HTML comment | **Repo file only** | not pushed |
| Canonical link URLs | **Repo file** (see table below) | Notion mangles them — restore on pull |

## Figure mapping

Each `<figure>` in the markdown maps to a 📷 callout in Notion:

Markdown:
```html
<figure>
  <img src="/images/PATH.png" alt="ALT" />
  <figcaption class="text-center text-sm text-gray-600 mt-2 italic">CAPTION</figcaption>
</figure>
```

Notion callout:
```
<callout icon="📷" color="gray_bg">
	**Figure**
	path: `/images/PATH.png`
	caption: CAPTION
	alt: ALT
</callout>
```

The figcaption class is always `text-center text-sm text-gray-600 mt-2 italic`.
Figure order in the doc (top → bottom): before-after, screens, mark-colors, icon,
claude-design-directions.

### New images embedded directly in Notion

When Aaron pastes/uploads an image into Notion (not a 📷 placeholder), it arrives as a
standard `![caption](https://prod-files-secure.s3...)` with a **signed S3 URL that expires
in ~1 hour**. On resync: download it immediately to `public/images/` with a descriptive
`glutenornot-*` name, then convert to the standard `<figure>` HTML using the local path.
Already handled: `glutenornot-claude-design-directions.png`.

## Canonical links (Notion mangles these — restore on pull-back)

| Link text | Canonical URL (repo) | What Notion turns it into |
|---|---|---|
| launched GlutenOrNot | `/glutenornot-free-ingredient-scanner-celiac-disease/` | `https://app.notion.com/glutenornot-...` |
| glutenornot.com | `https://glutenornot.com/` | `http://glutenornot.com` |
| source is on GitHub | `https://github.com/amr05008/glutenornot.com` | unchanged |

## Push procedure (repo → Notion)

1. Read `glutenornot-redesign.md`.
2. Drop the frontmatter and the alternate-images HTML comment.
3. Convert each `<figure>` → 📷 callout (mapping above).
4. Keep the pinned 🔒 instructions callout at the top and the ✍️ TODO callout in the
   "Figma Make vs. Claude" section.
5. `notion-update-page` with `replace_content`.

## Resync procedure (Notion → repo) — this is a MERGE, not a blind regen

1. `notion-fetch` the page.
2. Take **prose wording** (paragraphs + heading text) from Notion.
3. Rebuild each `<figure>` from its 📷 callout using the figure mapping (restores the
   figcaption classes). Preserve figure order / repositioning the user did.
4. Restore canonical link URLs from the table above (undo Notion's host-prefixing and
   http downgrade).
5. Re-attach the **existing frontmatter** from the repo file unchanged.
6. Re-attach the alternate-images HTML comment (it lives after the "screens" figure in
   the repo file; it is never in Notion).
7. Write the result to `glutenornot-redesign.md`.
8. Show the user a diff and confirm before considering it done.

## Notes

- The ✍️ TODO callout marks where Aaron will write the "Figma Make vs. Claude" section.
  When he fills it in (in Notion), it becomes normal prose on resync.
- If Aaron wants to change the title/description/categories, that's a repo-file edit,
  not a Notion edit (tell him, or make the change in the file directly).
- `draft: true` stays until publish. Publishing = set `draft: false` and push to `main`.
