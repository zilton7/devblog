---
title: "Stop Building Settings Pages: A Guide to Ruthless MVP Scoping"
categories: selfnote
tags: [productivity, startups, webdev, career]
image:
  feature: /assets/images/2026-02-27-Stop-Building-Settings-Pages-A-Guide-To-Ruthless-Mvp-Scoping/feature.webp
---

## The Graveyard of Perfect Apps
We all have a `~/projects` folder filled with half-finished dreams.
Usually, the code isn't broken. The idea isn't bad.
The project died because you ran out of steam. You spent 3 weeks building the scaffolding and 0 days building the actual value.

As a **One-Person Team**, your scarcest resource is momentum.
To ship, you need to conduct a **"Good Enough" Audit**. You need to look at your roadmap and ruthlessly cut everything that doesn't directly solve the user's primary pain point.

Here are the 5 biggest time-sinks you need to delete from your MVP right now.

## 1. Dark Mode (The Procrastination Trap)
We developers love Dark Mode. We think it’s a requirement.
It is not.

**The Cost:**
Building Dark Mode essentially requires you to design your app twice. You have to test every border, every shadow, and every text contrast ratio in two states. It doubles your CSS workload.

**The Reality:**
Your first 100 users do not care if their retinas are slightly seared. They care if your app saves them money or time. Linear, the gold standard of UI, didn't have Light Mode for years. You don't need Dark Mode for launch.

**The Audit:**
*   **Cut:** Dark Mode toggle, system preference detection.
*   **Keep:** A clean, high-contrast Light Mode.

## 2. The "Edit Profile" Page
You spend 3 days building a form where users can:
*   Upload a custom avatar (and crop it).
*   Change their email address (with verification).
*   Update their bio.

**The Reality:**
Nobody is going to visit your settings page because *nobody uses your app yet*.
If a user wants to change their email in the first month, they can email you, and you can change it in the database.

**The Audit:**
*   **Cut:** Avatar uploads (use Gravatar or generic initials).
*   **Cut:** Email change logic.
*   **Keep:** A "Logout" button.

## 3. Complex Authentication Flows
"I need 2FA, Forgot Password via SMS, and Social Logins for GitHub, Google, and Twitter."

**The Reality:**
Every barrier you add to the codebase is a barrier to shipping.
For an MVP, you need *one* way to get in.

**The Audit:**
*   **Cut:** 2FA (unless you are a Fintech app).
*   **Cut:** "Forgot Password" (I’m serious. If they forget it, manual reset via DB console for the first 50 users. Or use a simple `mailto` link support flow).
*   **Keep:** A simple `email/password` flow OR `Google OAuth`. Pick one. Not both.

## 4. The Admin Dashboard
You visualize a beautiful chart showing MRR. A table to ban users. A CMS to edit blog posts. You spend a week building a dashboard that only *you* will see.

**The Reality:**
You are the developer. You have `rails console` (or a SQL client). You have direct access to the database.
You do not need a UI to ban a user. You type `User.find_by(email: ...).destroy`.

**The Audit:**
*   **Cut:** The custom Admin UI.
*   **Keep:** The database connection string. (If you really need a UI, install a gem like `Avo` or `Administrate` and spend 0 minutes configuring it).

## 5. Automated Billing Upgrades/Downgrades
"What if a user wants to switch from the $10 plan to the $50 plan halfway through the month? I need to handle pro-rating logic!"

**The Reality:**
This is an "Optimizing for Success" problem. You currently have $0 MRR.
If a user actually wants to upgrade, that is a champagne problem. You can handle that manual invoice when it happens.

**The Audit:**
*   **Cut:** Custom pricing tables, pro-ration logic, PDF invoice generation.
*   **Keep:** A simple link to a pre-configured **Stripe Checkout** page. Let Stripe handle the UI.

## What is Left?
If you cut all of this, what are you building?
**The Core Loop.**

*   If you are building a Project Management tool, build the "Create Task" button.
*   If you are building an AI writer, build the "Generate Text" button.

Everything else is noise.
Your goal is not to build "Software." Your goal is to build a "Solution."

Ship the solution. Polish the software later.

***

*What feature are you currently building that you probably shouldn't be? Confess in the comments! 👇*