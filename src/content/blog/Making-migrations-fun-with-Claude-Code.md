---
title: "Making migrations fun with Claude Code"
description: "Claude Code made completing a boring migration fun. Here is how I used Claude Code to migrate my WordPress blog to Astro in just 6 hours."
pubDate: 2025-10-10
categories: ["Projects"]
heroImage: "/og-images/making-migrations-fun-with-claude-code.png"
---
I had a “simple” question as a starting point. How could I use Claude Code to swap my tour de france fantasy app from being hosted on Replit to a free tier option? 

The quest of completing this task, started a migration bonanza that ended up with this website and 8+ years of content being migrated from Wordpress to an Astro-based static site.

### The first project

My [TDF fantasy app](https://fantasytour.streamlit.app/) was [originally created and hosted](https://aaronroy.com/vibe-coding-a-tour-de-france-app-using-replit-and-google-sheets) via Replit. I was spending ~$25 a month to keep my Replit account (and the hosting it provides) active. I wanted to try out Claude Code so this was the perfect test project to see if I could figure out a new home for the TDF app and eventually cancel my Replit hosting. 

I estimated this project would take me ~4 or so hours to complete between research, planning and doing. I was happily surprised to be quite wrong. It took me about 60 minutes go from initial conversation to **completed project**! 

The majority of the time spent on this project was setting up Claude Code in my terminal and installing the proper npm packages and updates for everything to run. I decided to use Claude Code via the VS code extension. I initialized Claude Code in my local repo for this project and asked it for a plan to host this project for free. It suggested Streamlit as an option and also came back with a step by step plan of tasks for both me and Claude Code to get done to complete the swap to Streamlit. 

Having seemingly gained back 3 hours, I turned to a project I’ve kicked down my to do list 100 times. 

### My white whale website project

I’ve wanted to migrate away from Wordpress and Elementor for years at this point. While this stack was awesome for getting a blog up and running, it requires a certain level of overhead and pain in navigating that over time I’ve wanted to move on from. There is also a cost component to paying for Wordpress hosting and Elementor license updates that I hoped to reduce or altogether remove. 

Alas, I started and stopped this project many times over because:

1. I wasn’t sure where to migrate from away from Wordpress 
2. I had no desire to spend potentially weeks of time setting up something new and dealing with styling, formatting, w.e. 

After seeing the success of the Replit task, I was curious what type of plan Claude might come up with to finally knock out my white whale background project. 

As my site was entirely in Wordpress as a starting point, I didn’t have a repo already stood up to let Claude Code explore. Thus I started by creating a project in the Claude desktop app and started a chat within the project with the prompt `What instructions would you give a Claude Code project to have it act as a staff level engineer assisting me on a project migrating a website from being hosted on wordpress to potentially self-hosted?`

The output from this chat, I plugged into the Claude desktop project instructions (with some slight tweaks for my project specifics) 

![claude-project-instructions-input.png](/images/claude-project-instructions-input.png)

Now that the project had precise instructions, I was able to start a new chat within the project with the prompt of 

`Following the project instructions, please lay out a migration strategy for https://aaronmichaelroy.com/. Keep in mind, I am not particularly technical and will rely on Claude Code to help guide me through deployment of the migrated application.`

Claude fetched my existing website, put together an audit summary and suggested multiple technology stacks that might accomplish my goal. It went even further and created a phased approach to accomplish the project’s goal with recommended path. I knew I wanted Claude Code’s help with any suggested path, so I asked the likely very silly question of `can I reference this project in Claude Code or should I use this chat for updating each step as complete?`  Claude let me know I should use both (Claude for the project planning, and Claude Code for the building and doing) and what to use each tool for along the way.

### The main event

I created a new repo to start this project and initialized Claude Code within the repo. Now switching to working within VS code I pasted in this whammy of a prompt that Claude provided me. 

![claude-instructions-for-migration.png](/images/claude-instructions-for-migration.png)

From here, we were off to the races. I was able to work with Claude Code, Claude and my own efforts to start knocking out the launch project plan. 

Some of the tasks we accomplished for this project included: 

- Built custom migration script (`migrate-wordpress.js`) to parse WordPress XML exports
- Migrated all 29 blog posts from WordPress to Markdown format
- Extracted and preserved all 54+ images with organized, slug-based naming
- Created second script (`update-yoast-descriptions.js`) to recover handcrafted Yoast SEO meta descriptions
- Preserved all post categories, publication dates, and metadata
- Maintained WordPress URL structure (`/{slug}`) to preserve search rankings and inbound links
- Configured automatic sitemap generation (`sitemap-index.xml` and `sitemap-0.xml`)
- Created `robots.txt` with proper sitemap reference
- Built site with Astro 5.x, TypeScript, and Tailwind CSS
- Created custom "Highlights" feature to curate featured posts instead of showing recent posts chronologically
- Built custom branded 404 error page
- Installed custom favicon for brand consistency
- Deployed to Vercel with automatic SSL certificate provisioning
- Configured custom domain (aaronroy.com and [www.aaronroy.com](http://www.aaronroy.com/))
- Installed Vercel Analytics (goodbye to GA 4)
- Achieved ~1.14 second build time for entire site (32 pages)
- Executed simultaneous domain migration (aaronmichaelroy.com → aaronroy.com)
- Created comprehensive CLAUDE.md documentation tracking all technical decisions
- Built reusable migration scripts for future WordPress migration

Claude helped me understand how to end a session to make it easy to restart the next day as well as how to restart a session being ready to jump right back into the to do list. 

This is as an example of me giving context to Claude Code while picking this project back up after some time away. Claude Code was able to use the CLAUDE.md file, plus the additional context I provided to adjust the projectplan to accomodate the transition from [aaronmichaelroy.com](http://aaronmichaelroy.com) to [aaronroy.com](http://aaronroy.com). 

![claude-code-restarting-session.png](/images/claude-code-restarting-session.png)

I was able to complete this project after my daughters bedtime across two weekend nights. In total, it took me about ~6 hours to go from project planning to having the new site built and polished enough to set up 301 redirects from my original website. I’m now able to confidently say goodbye to my paid Wordpress hosting and Elementor plans.  

I still have a few open items to do but at this point, it’s window dressing compared to what’s been done thus far. Even better is that open items for “finishing” the project are in the CLAUDE.md file and readme so I can easily pick this back up whenever I’d like. 

You can check out the source code behind this entire project at [amr05008/aaronroy.com](https://github.com/amr05008/aaronroy.com)

### What’s next?

Well this technology is absolutely wild. I feel capable of building and prototyping things that before were pipe dreams for me. In addition to iterating on my fantasy cycling app, the next project I’d like to take on is migrating my mom’s art website away from Squarespace and into something I can host and deploy on a free tier as well. 

### Helpful resources:

- [How Claude Code is built](https://newsletter.pragmaticengineer.com/p/how-claude-code-is-built) (paid article but awesome read)
- [Claude Code best practices](https://www.youtube.com/watch?v=gv0WHhKelSE) | Code w/ Claude
- [Prompts and examples](https://github.com/amr05008/prompts-and-examples)