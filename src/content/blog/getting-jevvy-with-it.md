---
title: "Getting jevvy with it"
description: "I put Jev's \"fast structured decisions\" promise to the test against email classification and GlutenOrNot's response time issues."
pubDate: 2026-09-22
categories: ["Projects", "GlutenOrNot", "Agents"]
heroImage: "/og-images/getting-jevvy-with-it-og.png"
---

A problem I've been facing with GlutenOrNot overall is the "need for speed."

With the current setup I've noticed errors popping up, especially from users with low connectivity or bandwidth, as even under the best of conditions the app can sometimes take more than 5 seconds for a response. Thus a model which could potentially help reduce that time in response is of great interest to me.

Last week, [TypeSafe AI](https://typesafe.ai) released Jev, which is an example of a new category of frontier models called "[System One](https://typesafe.ai/blog/introducing-system-one-models-and-jev)" or decision models. Jev came out of stealth on Sept. 15th and I just so happened to have some free time these past few days to spin up some tests.

## What is Jev?

Jev's main promise is it can make "fast structured decisions" that can be used by software. It takes in text and outputs probabilities. **It does not output text at all**, so it needs to be paired with some other system to make use of the result.

TypeSafe has three primitives its models are built around:

![TypeSafe's three primitives: Choice, Score and Noul, and what each one returns](/images/getting-jevvy-with-it/typesafe-primitives.png)
*More info in TypeSafe's [helpful documentation](https://docs.typesafe.ai/introduction#typesafe-primitives)*

To help users understand these concepts, the Jev platform has three walkthrough lessons to test each primitive. I tested out the "Is Hotdog a Sandwich" exercise before creating an API key and moving my tests onto some of my real-world scenarios.

![The TypeSafe playground scoring "Is hotdog a sandwich?" as 77% true](/images/getting-jevvy-with-it/typesafe-hotdog-exercise.png)
*Based on the provided criteria, it's a 77% probability that a hot dog is a sandwich*

## Testing Jev against GlutenOrNot

[GlutenOrNot](https://aaronroy.com/glutenornot-free-ingredient-scanner-celiac-disease/) currently uses Opus 4.8 to classify and flag gluten-containing ingredients from barcode scans, ingredient labels and restaurant menus ([overview of what the app can do here](https://www.youtube.com/watch?v=g6qqkZzcHJE)).

I tested Jev vs. the [latest GlutenOrNot production app](https://apps.apple.com/us/app/glutenornot/id6758594582) against ~1,000 food labels from [Open Food Facts](https://world.openfoodfacts.org/) across multiple languages.

The first major finding is I realized both Jev and Opus called cut-off labels `safe` if the cut-off part had the gluten-containing ingredients. The majority of gluten-containing food labels list flour as one of the first ingredients, so when that's cut off in the photo or ingredient label, the default behavior should be to flag that the label is missing information or to take another photo vs. giving a default safe response. This bug will get fixed ASAP in an upcoming build.

Moving beyond stumbling right into a bug, the results with Jev were impressive overall.

Jev was 17x faster (0.17s vs 2.89 seconds per median response) and ~240x cheaper (3.5 cents vs. $8.45 per 1,000 labels). Neither model missed a label that visibly contained gluten.

![Bar chart of response times on 996 labels: Jev at 0.17s median and 0.27s 95th percentile, Opus 4.8 at 2.89s median and 5.35s 95th percentile](/images/getting-jevvy-with-it/jev-latency.png)

If Jev holds up under further testing and can serve as the first line of classification for ingredient labels coming from barcodes, that could be a game changer for GlutenOrNot users as long as it does not compromise accuracy. My current thoughts are to have Jev as the first line of classification and then routing to Opus 5 (which would be an upgrade vs. today's setup) when the [OCR](https://cloud.google.com/use-cases/ocr) is unable to cleanly parse the text the image contains or the item is not found in a barcode database.

Considering that GlutenOrNot has no account creation step and ingredient scans are only associated with a user on their respective local device, I'm less concerned with the fact that TypeSafe does not have a clear timeline on [how long they retain personal data](https://typesafe.ai/legal/privacy-policy) yet.

## Testing Jev against email classification

Beyond testing Jev against GlutenOrNot's needs, I also tested Jev against the question of "does this email require my attention?"

I already have an [email agent](https://aaronroy.com/go-get-yourself-a-personal-agent/) set up that handles flagging and notifying me if any emails need my attention based on the contents of the sender domain, subject line and 200 characters of the email itself.

I gave Jev a few lines from my [personal context](https://aaronroy.com/giving-agents-personal-context/) repo to establish what I care about and tested it on the same job of figuring out which emails require my attention, with access only to the sender domain and the subject lines. In this run, Jev mistakenly labeled two important emails as routine and not needing my attention.

Splitting the one question, "does this email require my attention?," into narrower questions such as "is this about money, security, childcare, etc." got the misses down to zero.

With this tuning, Jev handled 121 out of 129 emails on its own and marked the other 8 as uncertain so another model could follow up if I had that wired up.

Across all my experiment runs I've still spent less than $1 despite consuming 16 million Jev tokens in testing thus far.

![TypeSafe billing page showing 16M tokens used for $0.58 of a $5 monthly credit](/images/getting-jevvy-with-it/typesafe-billing.png)
*Haven't even burned through my monthly credit yet*

## First impressions

The fundamental concept of having a "fast" classifier model up front for making snap decisions that can then decide where and what to route to other models and systems makes a lot of sense. If the speed and [cost per usable result](https://aaronroy.com/what-it-costs-to-get-llms-to-produce-usable-work/) gains are real at scale and over time, then a lot of folks are going to bring Jev-type models into their products.

The fact that I'm already considering moving this into the production version of GlutenOrNot to leverage the speed gains (without compromising accuracy) is wild considering how new this model is.

I have not tested the scoring primitive of Jev yet but I figure I'll get there in a future experiment.

Here are all the experiments I've run with Jev (and will add more in as I test further): [amr05008/jev-sandbox](https://github.com/amr05008/jev-sandbox).
