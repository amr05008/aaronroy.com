---
title: "GlutenOrNot version 1.2 - check out the fresh coat of paint"
description: "New redesigned release of GlutenOrNot for iOS and web is live. New version delivers improved barcode and restaurant menu verdicts."
pubDate: 2026-06-08
categories: ["Projects", "GlutenOrNot"]
heroImage: "/og-images/glutenornot-before-after-og.png"
draft: false
---

A new release of GlutenOrNot is live in the Apple App Store: [GlutenOrNot 1.2](https://apps.apple.com/us/app/glutenornot/id6758594582)

Since the [launch of this free gluten scanning app](/glutenornot-free-ingredient-scanner-celiac-disease/), we've added support for detecting gluten from barcodes and restaurant menus, as well as expanding support into multiple languages.

This new release is worth calling out as it's a total redesign. While the prior version worked, it looked like a health app from 2014. Teal everywhere, a generic leaf logo, and the scan verdict crammed into a little pill.

In this new release, the verdict is the only color in the app. Everything else is neutral. When you scan something, Safe / Caution / Unsafe fills the screen and should be much easier to read and understand your result.

<figure>
  <img src="/images/glutenornot-before-after.png" alt="The old teal result screen next to the new neutral one with a full-bleed red Unsafe verdict" />
  <figcaption class="text-center text-sm text-gray-600 mt-2 italic">Before and after shots. Same verdict, much easier to parse.</figcaption>
</figure>

Scanning is way better in this new version. The new designs better support label detection, restaurant menu results and ingredient labels.

<figure>
  <img src="/images/glutenornot-screens.png" alt="The new scan, menu, and safe screens" />
  <figcaption class="text-center text-sm text-gray-600 mt-2 italic">Scan, menu mode, and a clean "Safe."</figcaption>
</figure>

<!--
  Higher-res individual screens are also available if you'd rather show them
  one at a time instead of the composite above:
    /images/glutenornot-new-scan.png    — camera / "Point at a label, menu, or barcode"
    /images/glutenornot-new-menu.png    — restaurant menu mode (safe / ask / avoid)
    /images/glutenornot-new-safe.png    — full-bleed green "Safe" verdict
    /images/glutenornot-new-unsafe.png  — full-bleed red "Unsafe" verdict
-->

The leaf mark is gone and the new mark is a scan reticle with three dots: red, amber, green (traffic light vibes).

<figure>
  <img src="/images/glutenornot-mark-colors.png" alt="The new GlutenOrNot mark and the three verdict colors" />
  <figcaption class="text-center text-sm text-gray-600 mt-2 italic">The new mark, and the only three colors that mean anything.</figcaption>
</figure>

A redesign would not be complete without a new app icon:

<figure>
  <img src="/images/glutenornot-icon.png" alt="The new GlutenOrNot app icon" />
  <figcaption class="text-center text-sm text-gray-600 mt-2 italic">Goodbye leaf, hello sleek traffic light</figcaption>
</figure>

## How the redesign came together

The first version of GlutenOrNot was designed in [Figma Make](https://www.figma.com/make/). This new release was imagined in [Claude Design](https://support.claude.com/en/articles/14604416-get-started-with-claude-design).

The prompt I used to kickstart the new designs was shockingly simple.

```markdown
id like to give this ios and web app a fresh coat of paint. i think the current styles are quite outdated. i love a minimal aesethetic. this is the repo: https://github.com/amr05008/glutenornot.com
```

The experience inside of Claude Design was a night and day difference vs Figma Make.

After the starting prompt, Claude Design used interactive questions and prompts to surface a few different design directions for me. Each direction showed the design treatment across **scan → reading → result** flows, plus all three verdict states.

<figure>
  <img src="/images/glutenornot-claude-design-directions.png" alt="The Claude Design canvas showing interactive design directions across the scan and result flow and all three verdict states" />
  <figcaption class="text-center text-sm text-gray-600 mt-2 italic">Claude Design's web UI surfacing interactive design directions.</figcaption>
</figure>

Once we settled on a design direction, Claude Design produced the full design set for both the iOS app and the web app, as well as the App Store assets for submitting the new version to Apple, all in a tidy package for handing off to Claude Code.

## What else

In addition to the new iOS version, the redesigned web app is live now at [glutenornot.com](https://glutenornot.com/), you can upload a photo of a label and get a verdict.

As always, it's still free, you don't need to make an account, and we still don't track what you scan.
And it's all open source, so you can read the code yourself [on GitHub](https://github.com/amr05008/glutenornot.com).
