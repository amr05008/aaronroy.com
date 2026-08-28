---
title: "Fable flagged my Airbnb camera scan as a cybersecurity risk"
description: "Fable 5 spent 12 minutes scanning an Airbnb network for hidden cameras before its safeguards stopped the defensive security scan."
pubDate: 2026-08-28
categories: ["Agents", "Cybersecurity"]
draft: true
---

I'm currently on summer vacation with my family and staying in an Airbnb.

Airbnb allows hosts to use outdoor cameras when they disclose them in the listing. Airbnb now [prohibits indoor cameras](https://www.airbnb.com/help/article/3061) completely. That said, I'm a bit of a tinfoil hat wearing person when it comes to cybersecurity so I can't help myself from running a quick scan to see if what someone tells me matches what's on the network.

I asked Claude Code + Fable 5 to assist me in checking out what's on my rental's network (yes I know I could have used [Nmap](https://nmap.org/) but I figured this would be a piece of cake for agents).

All I ran was this prompt:

`im currently at an airbnb on someone elses wifi. i want to know if any random cameras are here. can you scan the network and let me know what you find?`

A Claude Code session using Fable 5 spent 12 minutes investigating, inventoried the 10+ devices on the network and then its [safeguards](https://x.com/claudedevs/status/2064949876463645026) tripped when it tried to finish the scan.

![Fable 5 safeguard message flagging the network scan as a cybersecurity task](/images/fable-flagged-my-airbnb-camera-scan-as-a-cybersecurity-risk/fable-cybersecurity-safeguard.png)
*The exact message I got back once the safeguards were tripped*

Claude Code handed the same task to Opus 4.8, which completed it. The scan found no cameras on the network.

As an aside, a clean network scan does not mean there aren't hidden cameras somewhere on the property but it does mean the network that has been scanned is clean. If there is a separate Wi-Fi network enabled on the property I was unable to connect to, it could totally hold cameras but alas I'm diverging back into tinfoil hat territory again.

I was so surprised that Fable's safeguards stopped my scan before finishing.

As a sanity check, I ran the same prompt through the [Pi Harness](https://www.youtube.com/watch?v=HLxgO4O5QdY&t=95s) and Kimi K3 and got assistance with no issue.

![Kimi K3 camera scan results in the Pi coding agent](/images/fable-flagged-my-airbnb-camera-scan-as-a-cybersecurity-risk/kimi-k3-camera-scan.png)
*Kimi K3 findings after the network scan*

When basic security questions by default are something Fable is treating as potentially malicious, it's a frustrating and weird experience.

I think there's got to be a better balance between letting people use the tools available to them to inspect a network and trying to prevent malicious behavior.

Hopefully in the days ahead as more folks run into these issues, more thoughtful safeguards will be put into place because I don't think it's a good outcome that Anthropic's current "best model," Fable 5, is unusable for defensive cybersecurity work.
