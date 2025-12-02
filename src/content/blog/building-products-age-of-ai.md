---
title: "Building products in the age of AI"
description: "I recently had the opportunity to speak at NYU's Product Management Club about building products in the age of AI. Here's a walkthrough of my presentation with additional context and resources."
pubDate: 2025-11-28
categories: ["presentations", "product management", "ai"]
---

I recently had the opportunity to speak at NYU's Product Management Club about building products in the age of AI. So much has changed over the past 12 months in terms of how we approach validating new ideas and how we build new capabilities on top of existing platforms. The crux of this presentation for aspiring and soon to be product managers was get out there, start building things, and learn how to leverage these new tools now. 

Below is a walkthrough of the main points of my presentation with additional context and insights.

![Title slide of presentation](/images/building-products-age-of-ai/Slide1.png)

I'm going to be talking about how building products has changed thus far in the age of AI, both at the 0-1 phase and for companies further along in their journey. 

By the time I publish this presentation, this field may very well change again. 

![Lines blurring between product and other fields](/images/building-products-age-of-ai/Slide4.png)

What traditionally non-technical people can do is changing rapidly. You can move much faster from idea to reality. 

- PMs can undertake almost any technical project 
(Websites, apps, scripts, migrations, etc)
- PMs & Designers easily able to build shacks and houses
- Engineers embracing these tools are building castles

![Thumbnail from pmquiz.xyz](/images/building-products-age-of-ai/Slide6.png)

I'll show you an example of a project I built from 0-1 just for this presentation. 

![QR code for pmquiz.xyz](/images/building-products-age-of-ai/Slide7.png)

Take the quiz at <a href="https://pmquiz.xyz" target="_blank" rel="noopener noreferrer">pmquiz.xyz</a>!

![Application interface for pmquiz](/images/building-products-age-of-ai/Slide8.png)

This quiz was inspired by a friend who built a great design assessment tool that applied science and rigor to assessing design skills. I wanted to build the opposite for product managers. 

**A quiz that "roasted" your attributes.**

You can check out and experiment with this project at <a href="https://github.com/amr05008/pm-linkedin-assessor" target="_blank" rel="noopener noreferrer">github.com/amr05008/pm-linkedin-assessor</a>.

![Claude prompt for quiz](/images/building-products-age-of-ai/Slide10.png)

I started by brainstorming the concept with Claude. 

My goal was to spin up a visual prototype at first so I could visualize the functionality and copy for each phase of the quiz. 

I recommend and use <a href="https://www.claude.com/blog/build-artifacts" target="_blank" rel="noopener noreferrer">Claude artifacts</a> to create highly engaging and shareable prototypes. 

Artifacts are interactive, customizable and embeddable in other creations. 

![Claude artifact prototype](/images/building-products-age-of-ai/Slide12.png)

This is the <a href="https://claude.ai/public/artifacts/d9a8f5c1-1cfd-461f-b20f-fda888b1f0bd" target="_blank" rel="noopener noreferrer">artifact</a> I built in Claude to get initial feedback. 

For this project, I built the visual prototype with dummy data and then published the artifact. I made additional tweaks to get the prototype the way I wanted. 

Total time from idea to prototype was ~20 minutes. 

![Best practices for feedback](/images/building-products-age-of-ai/Slide14.png)

I solicited feedback on usability and concept via text message from co-workers and friends. This took about ~1 hour of effort including waiting for responses. 

Next step was actually building to achieve personalized and "real" results.

![Claude code project instructions](/images/building-products-age-of-ai/Slide16.png)

For this project, I wanted to move from prototyping with Claude to building with Claude code. 

Some best practices when vibe coding projects: 
- **Always start with a plan.** Claude and other tools can help you come up with one
- Defining the outcome you want to accomplish = better vibe coding sessions 

Once you have a plan, Claude can handoff to Claude code to build. You can check out the handoff instructions for this project here: <a href="https://github.com/amr05008/pm-linkedin-assessor/blob/main/public/PM_Assessment_Quiz_Project_Instructions.md" target="_blank" rel="noopener noreferrer">PM Assessment Quiz Project Instructions</a>.

It's helpful to think of Claude as the project manager for a given project. You can plan steps, visually debug items, create prototypes and revise your plan. 

Claude code is where the actual work of building happens. You can set up loops so projects can be built with as little or as much human intervention as you'd like. 

As you get more comfortable, you can even run multiple sessions at once.

![Claude code handoff](/images/building-products-age-of-ai/Slide19.png)

I took my handoff document from Claude and I moved it into Claude code to start building. 

I started with setting up local file structure on my computer as I planned to host this project on Github and commit and push changes via Github desktop. 

I opened up Claude code in the new project repository using terminal and added the handoff document. I flip flop between using Claude code via terminal and via VS Code. 

I reviewed the build plan Claude code proposed and made sure the steps matched what I expected and once satisfied gave permission to start working through the build plan. 

You can ask Claude code to modify, remove or rethink phases of the proposed plan so don't be afraid to ask questions and refine your build plan to reflect what you want as an output. 

I've not had the chance to check it out yet, but the recent release of <a href="https://www.claude.com/blog/claude-code-on-the-web" target="_blank" rel="noopener noreferrer">Claude code for web</a> makes this transition between Claude and Claude code even easier.

![Debugging claude code](/images/building-products-age-of-ai/Slide20.png)

Claude and Claude code are both great at helping debug issues.

I constantly take screenshots and feed those into Claude code to get assistance in solving errors. 

I recommend starting with screenshotting UI issues and copying and pasting error codes, warnings, etc you are getting while trying to build and run your application. 

As you get more experience and feel more comfortable, you can start to think how to further let Claude "loop" so you don't even need to screenshot issues you are seeing. For instance, you can connect in <a href="https://github.com/microsoft/playwright-mcp" target="_blank" rel="noopener noreferrer">Playwright via MCP</a> so Claude can "see" the outputs of its builds and self-diagnose issues in a loop until they get resolved.

![Thinking example claude code](/images/building-products-age-of-ai/Slide21.png)

I encourage toggling "Thinking" on as you are learning as it's helpful to see how Claude reasons and attacks problems. 

![Claude prompt example](/images/building-products-age-of-ai/Slide23.png)

Now that I had a real application, I went back out for another round of feedback. 

In addition to lots of things breaking, I got quite a bit of feedback on how to improve the quiz, make it more entertaining and engaging. 

For a 0-1 concept such as this it is better to be a bit embarrassed and get feedback as early as possible. 

I shared the working quiz with fellow product folks, my partner, designers, engineers, anyone who I knew who might give useful and honest feedback about the quiz. 

The roast meter to control the level of the sarcasm the quiz provides was an idea that came from this early feedback. 

I was able to repeat the prototype > propose a plan > handoff to Claude code cycle to get the roast meter built right into the app. 

![Brainstorming domain names](/images/building-products-age-of-ai/Slide24.png)

Beyond debugging and accomplishing the project plan Claude also helped me:
- Brainstorm domains before settling on pmquiz.xyz
- Connect Cloudflare domain to Vercel
- Optimize my token usage
- Improve my application security and protect against prompt injection

![Project goal details](/images/building-products-age-of-ai/Slide25.png)

The goal with this project was to use this quiz to teach this room about the power of Claude and Claude code. I wanted it to deliver personalized results and demonstrate lead capture capabilities. 

I originally "planned" to parse LinkedIn URLs to do the roasting. 

I realized early on building a web scraper into LinkedIn or authenticated data importer was not necessary for the purpose of this quiz. 

I could get a useful output from the Claude prompts by asking quiz takers to paste their "About" section into the quiz. This made personalization of the responses possible via a 10 minute implementation vs the unknown efforts of building a LinkedIn URL parser.

![Learn version control](/images/building-products-age-of-ai/Slide26.png)

Understand git, github, the basics of version control and how code gets deployed will help you work with engineering teams as your career progresses.

Version control gives you ability to take on more ambitious projects. 

Git is most common for modern projects, experiment with it as soon as you can.

I start new sessions for each new "bigger" thing (i.e. post a project milestone being achieved), this helps reduce the context window LLM has to manage. 

Claude is exceptional at git management. 

![Product process at Teachable](/images/building-products-age-of-ai/Slide27.png)

Teachable process contains four key ceremonies to make new capabilities come to life:
- Opportunities ("Opps")
- Product Brief Review
- Design Review
- Engineering Implementation Plan

### What are "opps"?

The "opps" process is heavily influenced by the Socratic Method, and it's essential it's collaborative, healthy debate and not just criticism just for the sake of being critical.

The goal for the presenter is to propose a hypothesis, defend their position, and advocate for additional time and/or resources to be allocated to the hypothesis. 

Presenters are often PMs but come from all corners of the company.

Attendees are encouraged to collaboratively challenge the assumptions underlying the opportunity and force the presenter to defend their hypothesis and proposed plan. 

Majority of pitches will not gain buy-in but serve as seeds of future ideas for remixing and reusing in other applications. 

Presenters often asked for further fidelity, research or exploration of additional considerations.

Here's a copy of the opportunity template you can copy and experiment with: <a href="https://aaronmichaelroy.notion.site/Example-Opportunity-Template-2b6f81204bc1805db97dea4261a4199a?source=copy_link" target="_blank" rel="noopener noreferrer">Example Opportunity Template</a>

  <iframe 
    width="100%"
    height="600" 
    src="https://aaronmichaelroy.notion.site/ebd/2b6f81204bc1805db97dea4261a4199a" 
    title="Example Opportunity Template"
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>

### How have opps changed in age of AI? 

Our pitches for opportunities have changed dramatically in the past six months. 

Where before we would traditionally use just the template above and figma prototypes, now presenters are showing up with testable applications, live prototypes and real examples. 

We're now using vibe coded prototypes with customers to get feedback on real functionality in advance of building at scale.

### Distribution is changing as well 
- Companies (including Teachable) are releasing MCPs to enable their applications to connect into LLMs 
- Increasing percentage of Teachable subscribers now coming from searches starting in LLMs
- Now product thinking includes "How might we make this capability usable or discoverable from an LLM?"

![PM job changes with vibe coding](/images/building-products-age-of-ai/Slide30.png)

These tools are a must learn as you enter the product management field. 

At Teachable, we're changing job descriptions to include screening for these skills. 

Companies want people that can come in and try and explore problems ASAP. 

![Show your experience example](/images/building-products-age-of-ai/Slide31.png)

When you are just starting out it's hard to build up experience and find roles willing to take a chance on someone brand new to the field. 

Experience can come from trying (and failing sometimes) at building your own projects. 

I highly encourage finding areas and problems you are curious about, trying to build something, and getting feedback from potential people who might share a similar problem. Running this real feedback loop is a great way to learn and expand your experiences to draw upon. 

The project in the above slide is a silly <a href="https://aaronroy.com/vibe-coding-a-tour-de-france-app-using-replit-and-google-sheets" target="_blank" rel="noopener noreferrer">tour de france fantasy app</a> I built for me and my friends because we found it a bit annoying to track who was winning our competition each year in spreadsheets alone. 

Not every problem area or passion project has to be something groundbreaking or capable of explosive growth, sometimes you can learn a lot and have a lot of fun just by tinkering. 

### Bringing it all together
- Product management is undergoing a massive shift with AI
- **You will be part of that shift** by embracing, understanding and becoming familiar with these tools
- Experiment with building whatever you can
- Get feedback on what you build
- Dust yourself off and try again 

### Projects & Resources 
 
Here are some resources to check out and learn more:
- <a href="https://www.deeplearning.ai/courses/generative-ai-for-everyone/" target="_blank" rel="noopener noreferrer">Generative AI for Everyone</a>
- <a href="https://www.amazon.com/Vibe-Coding-Building-Production-Grade-Software/dp/1966280025" target="_blank" rel="noopener noreferrer">Vibe Coding: Building Production-Grade Software With GenAI, Chat, Agents, and Beyond</a>
- <a href="https://read.technically.dev/" target="_blank" rel="noopener noreferrer">Technically</a>
- <a href="https://www.youtube.com/@aiexplained-official" target="_blank" rel="noopener noreferrer">AI Explained</a>
- <a href="https://www.deeplearning.ai/short-courses/vibe-coding-101-with-replit/" target="_blank" rel="noopener noreferrer">Vibe Coding 101 with Replit</a>
- <a href="https://blog.sshh.io/p/how-i-use-every-claude-code-feature" target="_blank" rel="noopener noreferrer">How I Use Every Claude Code Feature</a>

Shoutout to Simon Willison for inspiring this post with his <a href="https://simonwillison.net/tags/annotated-talks/" target="_blank" rel="noopener noreferrer">annotated talks</a>.