---
title: "Competitive Analysis"
description: "A plugin for ChatGPT and Claude that turns 'competitive analysis of this company' into an evidence-graded teardown."
---

# Competitive Analysis
Evidence-graded teardowns, in ChatGPT and Claude.

The Competitive Analysis plugin helps founders, product people and business analysts tear down companies and landing pages to understand positioning, product capabilities, and company growth.

Ask it for a "competitive analysis of _company_" and it comes back with a verdict first, then the handful of findings that decide it, and every material claim carrying a link, an evidence date, and one of three labels:

- **VERIFIED**: it read the primary source itself.
- **COMPANY-CLAIMED**: the company said it, or press repeated the company. Funding announcements live here.
- **ESTIMATE**: its own triangulation, with the method shown, or a headcount figure from a data tool you connected, with the tool named.

Four methods are required on every run:

- **Positioning history** from the Wayback Machine. What the homepage and pricing page used to say, and the day they changed.
- **Job-listing mining.** What a company is actually building shows up in job descriptions months before it ships.
- **Contradictions** between sources, including the company's own pages. A discrepancy is a finding, not noise.
- **Absence as evidence.** The review site with no reviews. The blog posts that now 404.

It ends with one of four verdicts: compelling, promising but unproven, structurally challenged, or unclear. If it couldn't reach something, it says what and why.

## The server behind it

The plugin uses a small server with four tools that do that work in one place:

- **Page history:** when a page's copy changed, bracketed between two dated Wayback Machine captures.
- **Job openings:** the company's open roles from its public Greenhouse, Lever or Ashby board.
- **Hacker News mentions:** how much Hacker News talked about it, year by year.
- **SEC filings:** what it has filed with the SEC, including Form D fundraising notices.

All four read free, public sources, need no sign-in and keep no personal data (the [privacy page](/competitive-analysis/privacy/) has the details). If the server is busy or down, the teardown still finishes with the app's own browsing and tells you what it couldn't check.

## Bring your own research tools, or don't

The plugin holds no keys, yours or anyone's. If you have [Clay](https://www.clay.com/guides/how-to-use-clay-in-chatgpt) connected, it spends a little of your Clay credit on two things: the company's headcount history and its latest funding round. It never looks up the people who work there. A team that shrank right through a pivot tells you a lot. Without Clay, it runs on built-in browsing and tells you where that left gaps. Reddit coverage needs a community connector; without one, the report says "Reddit not searched" rather than guessing at sentiment.

## Support

Questions, a bug, or a teardown that missed something? Email me at [aaron@aaronroy.com](mailto:aaron@aaronroy.com?subject=Competitive%20Analysis%20plugin) with the company you asked about and I'll take a look.