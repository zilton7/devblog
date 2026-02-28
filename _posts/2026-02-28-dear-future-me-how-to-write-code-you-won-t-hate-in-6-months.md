---
title: "Dear Future Me: How to Write Code You Won't Hate in 6 Months"
categories: selfnote
tags: [productivity, career, documentation, beginners]
image:
  feature: /assets/images/2026-02-28-Dear-Future-Me-How-To-Write-Code-You-Won-T-Hate-In-6-Months/feature.webp
---

## The "I'll Remember This" Lie
We tell ourselves the same lie every day.
*"I don't need to write down why I used this specific regex. It’s obvious. I built it. I am the god of this repo."*

Then, three months pass.
You come back to the project to fix a bug. You stare at that regex. You have absolutely no idea what it does, why it's there, or what will break if you touch it.

**Welcome to Context Bankruptcy.**

When you are a solo developer (the "One Person Framework"), you assume documentation is for *teams*. You assume it's for handing off knowledge to others.
This is wrong.
**Documentation is time travel.** It is a message from *Past You* (who was smart and in the zone) to *Future You* (who is tired, busy, and has forgotten everything).

Here are the 4 low-effort documentation strategies that will save your sanity.

## 1. The "Why," Not the "What"
Junior developers comment on **what** the code is doing.
Senior developers comment on **why** the code looks weird.

The code itself tells you *what* is happening (`user.save!`). You don't need a comment for that.
You need comments for the invisible constraints.

**Bad:**
```ruby
# Sets timeout to 5000
config.timeout = 5000
```

**Good:**
```ruby
# We set this to 5000 because the Stripe API webhook 
# occasionally hangs for 4s during nightly maintenance.
# Do not lower this without checking their status page.
config.timeout = 5000
```

**Strategy:** Only comment on things that look like mistakes or hacks. If you had to Google a weird error to fix a line, paste the StackOverflow URL in a comment right above that line.

## 2. The `DECISIONS.md` File (ADRs Lite)
In big companies, they use "Architecture Decision Records" (ADRs). They are formal documents.
You don't need that. You just need a markdown file in your root folder called `decisions.md`.

When you make a big tech choice, write 3 sentences.

*   **Date:** 2026-02-03
*   **Decision:** Switched from Sidekiq to Solid Queue.
*   **Why:** I didn't want to pay $15/mo for a Redis instance on Render. Solid Queue handles my volume (50 jobs/day) fine.

**Why this matters:**
In a year, you will read a blog post saying "Sidekiq is faster!" and you will feel the urge to refactor. You check this file, realize your constraints haven't changed, and you save yourself a week of wasted work.

## 3. The "Scratchpad" Journal
Context switching destroys solo devs.
If you work on your app on Saturday, and then don't touch it until next Saturday, you spend the first 2 hours just figuring out where you left off.

Create a file called `SCRATCHPAD.md` (and add it to `.gitignore` if you want, though I commit mine).

At the end of every coding session, write a "Dump":
> "I got the billing form working, but the webhook is failing with a 400 error. I suspect it's the CSRF token. The next step is to look at the StripeController."

When you sit down next week, you don't have to load the entire architecture into your brain. You just read the last line and start coding.

## 4. The `README` is your Deployment Manual
The scariest moment for a solo dev is deploying a hotfix 6 months after launch.
*"Wait, do I run `fly deploy` or `kamal deploy`? Do I need to migrate the DB manually?"*

Your `README.md` should not be a description of the project. It should be an **Instruction Manual for Emergencies.**

It must contain:
1.  **How to start the app locally:** (`bin/dev`)
2.  **How to deploy:** (`kamal deploy`)
3.  **How to access the production console:** (`ssh user@ip -t 'app console'`)
4.  **Where the secrets are:** (e.g., "See 1Password vault 'Project X'")

## Summary: Documentation is Self-Care
When you work alone, you don't have a senior engineer to ask for help. **You are the senior engineer.**

If you don't write things down, every time you open your editor, you are forced to re-solve problems you already solved months ago. That is the definition of burnout.

Be kind to Future You. Write a note.

***

*What is the one thing you always forget about your own code? Tell me in the comments! 👇*