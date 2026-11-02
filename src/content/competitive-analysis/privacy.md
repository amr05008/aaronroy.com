---
title: "Competitive Analysis privacy"
description: "What the Competitive Analysis plugin and its server collect, keep and share."
---

# Competitive Analysis: Privacy Policy

_Last updated: November 2, 2026_

Competitive Analysis is a plugin for ChatGPT, Codex and Claude, published by [Aaron Roy](https://aaronroy.com/about/).

It has two parts: written instructions the model follows, and a small server that looks up public records about companies. The instructions collect nothing, so this page is mostly about the server.

## What the server receives

When a teardown calls one of the plugin's four tools, the server gets only what that tool needs: a page address on the company's website, the company's or product's name, its domain and US state, or the ids of job postings from an earlier answer, along with options such as a date range. It never receives your prompts, the rest of the conversation, the report, your name or your account. If the app attaches its own details to a call, the server uses none of them and keeps none.

The tools are built for companies and don't look people up. Their answers leave out the people named in SEC filings and the usernames on Hacker News. If someone types a person's name where a company name goes, the server treats it like any other input: it uses it for that one lookup and caches the public result as described below.

## What it does with it

It looks the company up in free public sources and sends back dated, linked evidence: the Wayback Machine (web.archive.org); the company's public job board on Greenhouse, Lever or Ashby, plus a few careers pages on the company's own domain to find that board; Hacker News search (hn.algolia.com); and SEC EDGAR. Those sites see the page address, name or domain in a request from the server, with a user agent that names the plugin and my email address (EDGAR asks for one). Wayback Machine requests go through a small relay I run on Vercel, because the archive limits requests from Cloudflare's network.

## What it keeps

- Cached public answers, stored under the page address, name or domain asked about, so the same question doesn't hit a source twice: archived page readings for up to a year (an archived capture never changes), archive indexes and SEC filings for a day, Hacker News search results for six hours, job boards for an hour.
- A daily count of calls per tool, split by outcome, such as ok or busy. The counts hold no inputs, network addresses or identifiers, so they can't be tied to a company or a person. I keep them for 90 days, and a weekly total goes to a private Discord channel I use for alerts.
- No request logs of my own. Logging is off on the server, and the relay's code logs nothing. Vercel keeps its usual log of the relay's calls, but the address being looked up travels inside the request, so that log never shows it.

## Who else is involved

- Cloudflare hosts the server. Like any host, it sees the network address each request comes from, to route it and to slow down floods; I don't record those addresses. In ChatGPT and claude.ai, calls come from OpenAI's and Anthropic's servers; in an app that runs on your computer, such as Claude Code, they come from your computer. [Cloudflare's privacy policy](https://www.cloudflare.com/privacypolicy/) covers what it handles.
- Vercel hosts the archive relay. It sees the server's requests, never yours, and passes each archive answer straight back without keeping it. [Vercel's privacy policy](https://vercel.com/legal/privacy-policy) covers what it handles.
- OpenAI or Anthropic, as with any conversation, under [OpenAI's privacy policy](https://openai.com/policies/privacy-policy/) or [Anthropic's](https://www.anthropic.com/legal/privacy).
- The public websites the model reads with its own browsing, including the company's site, the Internet Archive and public job boards.
- Any research plugin you connect yourself, such as Clay, under that vendor's terms. With Clay, that's the company's name and domain, never a person's. The plugin never asks you for a key and never stores one.

## Your choices

There's no account and nothing tied to you, so there's nothing of yours for me to look up or delete. To stop using the server, disconnect or uninstall the plugin; the method still works from the model's own browsing. Questions: [aaron@aaronroy.com](mailto:aaron@aaronroy.com?subject=Competitive%20Analysis%20plugin).