---
title: "Giving agents personal context"
description: "Exploring how to bring my voice, context and preferences into different LLMs and machines"
pubDate: 2026-04-07
categories: ["AI", "Projects"]
heroImage: "/og-images/personal-context-og.png"
---

<figure>
  <img src="/og-images/personal-context-og.png" alt="Using my personal context system to review this blog" />
  <figcaption class="text-center text-sm text-gray-600 mt-2 italic">
    Using my personal context system to review this blog
  </figcaption>
</figure>

For over a month this year, I had an [OpenClaw](https://github.com/openclaw/openclaw) agent named "King Ziti" living on a Raspberry Pi in my apartment. Recently, after spending a few precious hours post work trying to debug permissions issues in OpenClaw and finding myself frustrated, I decided to unplug my Raspberry Pi and take a break from King Ziti.

King Ziti lived on a Raspberry Pi 5 and we communicated via Discord. I had him researching swimming classes for my daughter, sending email reports to my friends, managing a shared Notion task list, etc. Pretty much anything I could safely delegate, I tried.

There were moments in working with King Ziti where things felt like magic. The "Aha" moment for me was that King Ziti hit on being a personal agent that learns and works around your preferences and knowledge.

To get to that "Aha" moment took substantial effort with OpenClaw. I'm talking hundreds of hours of tinkering type investment. This was not a turn-it-on-and-it-works experience. It was a blank canvas, using software that is developing at a rapid pace, that requires constant fiddling for it to maintain its utility.

With King Ziti offline, I still want to have agents actually know my preferences and how I write and think, without the infrastructure overhead or having to setup one-off project instructions across each LLM.

Thankfully, I came across [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), the idea of maintaining a personal document that gives an LLM context about who you are, and [nlwhittemore's Personal Context Portfolio](https://github.com/nlwhittemore/personal-context-portfolio) which took that concept further with structured markdown files. Both clicked immediately. This was the piece I wanted to keep from OpenClaw, just without the agent infrastructure around it.

So with a little help from Claude, I built [personal-context](https://github.com/amr05008/personal-context), my take on this idea, curated markdown files served via MCP so any Claude Code session can pull my voice, opinions, and style automatically.

## How it works

My spin on the personal context system has me maintain six curated markdown files:

| File | What it captures |
|------|-----------------|
| `identity.md` | Background, career arc, personal details |
| `writing-style.md` | Voice, tone, sentence patterns, vocabulary, annotated examples |
| `opinions.md` | Stances on topics you write about |
| `expertise.md` | Domains of deep knowledge |
| `projects.md` | Current and notable past projects |
| `communication.md` | How you communicate in different contexts (Slack, email, docs) |

A [FastMCP](https://gofastmcp.com/) server exposes these files as tools via [MCP](https://modelcontextprotocol.io/). When you ask Claude to review or draft something, it pulls my context first and the output is much closer to my preferences.

The whole thing runs entirely locally, just markdown files on disk, no external services beyond the normal Claude API calls.

## Jumpstarting the context

I had no desire to fill in those markdown files from scratch.

I jumpstarted this personal context system with my recent blogs from this website. Since those are already stored in markdown, I figured that would be an easy way to teach an agent who I am, what I'm interested in and how I write.

In the repo, there's an ingest script that can bootstrap drafts automatically:

```python
python scripts/ingest.py sources/blogs/ --cutoff 2024-01-01 --output drafts
```

I used a Claude Code session to interview me to fill in any gaps across the personal context files.

I'm still testing the system out but thus far I'm happy with the early results.

## Work and personal machines

Being able to share context between work and personal machines safely is the dream for me. I'm hoping this does the trick or at least gets me closer.

This project uses a `sources/private/` directory that's gitignored, so I can drop in work emails I've drafted, slide decks, or anything I don't want committed. My context files can reference that material without exposing it.

I write monthly update emails that use a fairly consistent pattern that I'm using as a source of private context to teach this system my "professional" writing style.

## What's next

I'm still iterating on the context files themselves and I'm interested in expanding my personal wiki over time.

Most importantly, my hope now is making this system something that is useful agnostic of specific LLMs, so I can switch between frontier models and whatever crazy stuff comes out next without having to rebuild from scratch all my context.

I'm using this context MCP in combination with [scheduled agent tasks](https://github.com/amr05008/scheduled-agents) to get much of the same benefits I got from OpenClaw but with a lot less overhead. More to come on scheduled tasks as I continue experimenting with them.

If you want to try it here is the link: [github.com/amr05008/personal-context](https://github.com/amr05008/personal-context).

Fork it, delete my files, and make it yours.
