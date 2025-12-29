---
title: "Taking aim at helping creators drive more revenue"
description: "What we did, how we did it and lessons learned from trying to help creators drive more revenue with Teachable Discover and Spotlight."
pubDate: 2022-05-06
categories: ["Projects"]
heroImage: "/og-images/helping-creators-drive-more-revenue.png"
---

In 2020, I put my startup, Wami, [into survival mode](https://aaronroy.com/how-i-got-a-product-job-during-the-pandemic/) and joined Teachable as the product lead for a new Skunkworks team. Our ambitious goal was to figure out ways to help creators generate additional revenue.

We started with the following areas as potential problems to solve: 

-   How a creator gets their course content discovered and purchased remains one of the foundational challenges all creators need to answer on their path to monetary success. 
-   Creating a course or digital good is relatively easy. Distributing a course or digital good to facilitate actual sales is difficult and often where digital creators will fail.
-   Existing aggregators at the time offering distribution support (i.e. Udemy and Skillshare) charge high take rates and require sacrificing direct relationships and control of their audience.

## **What we did:** 

We started with [Discover by Teachable](https://teachable.com/blog/discover-by-teachable), a course marketplace featuring content from top creators. 

Where Udemy charged a ~63% take rate and sat between the creator and their audience post-sale, we helped creators drive demand for a ~30% take rate and creators had complete control over their audience and communication. 

Alas, a major hurdle we faced with Discover was the chicken-and-egg dilemma of [kickstarting a marketplace](https://www.lennysnewsletter.com/p/how-to-kickstart-and-scale-a-marketplace). To build demand, you need copious amounts of great content, and to attract creators, you need to be able to offer an engaged audience of prospective buyers. We chose to focus on cultivating top creators first rather than aggregating a large backlog of course demand. 

We realized the events we hosted alongside creators for Discover were great at generating leads and awareness for creator content and used those learnings to pivot into launching Spotlight. 

Spotlight was a course and live event platform that helped creators generate new leads, engage with their audience, and generate course sales. I imagined what we were doing with Spotlight as similar to the [Home Shopping Network](https://www.hsn.com/) but for creators. 

<figure>
  <img src="/images/taking-aim-at-helping-creators-drive-more-revenue-1759632216581.jpg" alt="Doing my best Billy Mays impression" />
  <figcaption class="text-center text-sm text-gray-600 mt-2 italic">
    Doing my best Billy Mays impression (replay of event <a href="https://www.youtube.com/watch?v=91Sx_zEzhu0" target="_blank" rel="noopener noreferrer">here</a>)
  </figcaption>
</figure>

Spotlight was able to sidestep some of the hurdles Discover faced in building up demand because by focusing on co-hosted live events with creators, the participants, in turn, would promote heavily to their own audience. 

Creators would use the [live events](https://www.youtube.com/watch?v=v19Q8QRH7J0) to launch new courses, promote content, drive awareness for premium offers, and test out potential new course content. We would promote the live events via paid media and to our own email list and then use our platform to deliver follow-up sales sequences to event attendees with limited-time offers and drive traffic to our mobile-optimized sales pages for conversions. 

<figure>
  <img src="/images/taking-aim-at-helping-creators-drive-more-revenue-1759632216606.png" alt="Example sales page" />
  <figcaption class="text-center text-sm text-gray-600 mt-2 italic">
    Example sales page
  </figcaption>
</figure>

Both Discover and Spotlight used an affiliate marketing model to generate revenue. Creators were able to keep the entirety of sales on Discover/Spotlight’s sales pages driven by their efforts and we took a commission for any sales driven by our marketing efforts (typically ~30%-50%, which was substantially lower than Udemy’s ~63% take rate). 

## **How we did it:** 

-   Our team operated as a startup outside of the main Teachable product org. We started off with reporting directly to the founder of Teachable, Ankur Nagpal. This distinction of having a direct line of reporting to the CEO was important as we needed to rapidly make decisions, test out ideas and operate at startup speed. 
-   To stay organized and keep things moving forward, we used the minimum viable process for each project. We used [Notion](https://www.notion.so/) for project management/documentation and [Jira](https://jira.com/) (when necessary) for ticket management. 
-   We [hosted the live events ourselves](https://www.youtube.com/watch?v=O01EXQcrJNE) to prove out the concept before hiring dedicated hosts to increase the number of events we could host per week (eventually hosting 200+ events). We started with [Zoom](https://zoom.us/) for live streams before switching to [Streamyard](https://streamyard.com/). I personally love [OBS](https://obsproject.com/) but it was overkill for our needs.
-   While the live events were the hook to evangelize the creator's content, the majority of sales we drove came from the sales sequences we sent as follow-up via [Drip](https://www.drip.com/). We tested a wide variety of subject lines, [designs](https://www.litmus.com/), copy and conversion drivers to optimize what types of sequences performed best for each type of content. We also realized the majority of purchases occurred via mobile email so we knew heading into the Spotlight iteration that being mobile first with our sales pages was crucial for achieving the best CVR for creators. 
-   We used landing pages and outbound outreach to recruit creators both on and off Teachable who had great content to be a part of these projects. 
-   The original Discover prototype used [Webflow](https://webflow.com/) for the home page and sale pages and linked to Teachable checkout pages for processing sales.
-   Spotlight was primarily built with [Contentful](https://www.contentful.com/) and [React](https://react.dev/). It was also built standalone from Teachable and was reusable for promoting courses, hosting events, and collecting registrations agnostic of course platforms.
-   We used [Airtable](https://www.airtable.com/) as a lightweight CRM, [Typeform](https://www.typeform.com/) to collect inputs, create waitlists and collect user feedback, and [Zapier](https://zapier.com/) to connect these disparate tools and speed up our workflows.

## **Lessons learned:** 

-   **Going from one product to multi-product is super hard.** The lessons here are worthy of their own writeup at a later date. It’s an important moment for every company when they try to make the leap from just the core offering into a multi-product suite. It requires time, patience, investment, the right culture and proper timing to pull off successfully. Here is a great [further read from FirstMark](https://hackernoon.com/9-lessons-learned-going-multi-product-19b48c159068) on the topic.