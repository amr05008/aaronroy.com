# ADR 004: Defer the Astro 5 → 6 Upgrade

**Date**: 2026-06-01
**Status**: Deferred (revisit on triggers below)

## Context

`npm audit` flagged that the only way to clear the 3 remaining advisories was
`npm audit fix --force`, which installs `astro@6.x` — a breaking major upgrade.
We evaluated the full Astro 6 migration in an isolated worktree
(`worktree-astro-6-upgrade`, since removed) before committing to it.

The 3 advisories are all **Astro CVEs that do not apply to this site**:

1. **SSR allowlist bypass** — site is fully static, no SSR.
2. **Server-island encrypted-param replay** — no server islands used.
3. **`define:vars` XSS** — no untrusted data is injected into `define:vars`.

With the security motivation effectively nil, the upgrade is weighed purely as
"stay current" vs. real migration risk on a working site.

## Decision

**Defer the Astro 6 upgrade.** Stay on Astro 5.x (currently 5.18.2) until a
concrete trigger makes the upgrade worthwhile. The non-breaking security fixes
were already applied separately (`npm audit fix`, 22 → 3 advisories; commit
`2b23ec7`).

## Rationale

The migration has real surface area for zero visible benefit today:

1. **Content Collections rewrite (medium effort, SEO risk).** Astro 6 removes
   the legacy collections API this site uses. Required work:
   - Move `src/content/config.ts` → `src/content.config.ts`
   - Add a `glob()` loader; drop `type: 'content'`
   - Switch `z` import from `astro:content` → `astro/zod`
   - Change `.slug` → `.id` in 7 files
     (`src/pages/[...slug].astro`, `writing.astro`, `index.astro`,
     `category/[slug].astro`, `rss.xml.ts`, `components/PostNavigation.astro`,
     `utils/posts.ts`)
   - Change `post.render()` → `render(post)` (`src/pages/[...slug].astro:29`)
   - ⚠️ **Highest-stakes item:** the `glob()` loader derives `id` from the
     filename. If the generated ids are not byte-identical to today's slugs,
     post URLs change — breaking the WordPress-preserved permalinks this site
     was specifically built to keep. Must be verified URL-by-URL.

2. **Tailwind must be re-wired.** `@astrojs/tailwind` does not support Astro 6
   (peer dep caps at `astro: ^5`). It has to be removed regardless.
   - **Recommended path: stay on Tailwind v3 via PostCSS.** Remove the
     integration, add a `postcss.config.mjs`
     (`{ plugins: { tailwindcss: {}, autoprefixer: {} } }`), leave
     `tailwind.config.mjs` and `src/styles/global.css` (`@tailwind` directives)
     unchanged. Near-zero visual-regression risk.
   - **Do NOT** bundle a Tailwind v3 → v4 migration (`@tailwindcss/vite`,
     CSS-first `@theme`, typography-plugin changes) into the Astro upgrade —
     that entangles two risky migrations. Save v4 for a future redesign.

3. **Runtime + transitive bumps (low risk, nonzero QA).** Node 22.12+ required
   (local fine; Vercel must honor it — add `engines.node >= 22.12.0` to
   `package.json` since none is pinned today). Vite 7, Zod 4, Shiki 4 come along
   but are low-impact for a static site.

Compatible target versions confirmed at evaluation time: `astro@6.4.2`,
`@astrojs/mdx@6.0.1`, `astro-expressive-code@0.42.0`. `@astrojs/rss` and
`@astrojs/sitemap` install cleanly on v6.

## Revisit Triggers

Reopen this decision when **any** of these becomes true:

- An integration/feature we want **requires** Astro 6.
- Astro 5 reaches **EOL** / stops receiving security patches.
- A genuine Astro 6 capability becomes compelling.
- We're already doing a **design refresh** — fold the Tailwind v4 migration in then.

## Consequences

- Site stays on a working, supported Astro 5.x; no regression risk incurred now.
- The 3 non-applicable Astro advisories will keep showing in `npm audit` /
  Dependabot until the upgrade happens. This is expected and accepted.
- When revisited, this ADR is the pre-done research: task list, the URL-stability
  risk, the Tailwind recommendation, and target versions are all captured above.
