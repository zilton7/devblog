---
title: "The $5 VPS Reality: My Honest Math on Moving to Kamal 2"
categories: selfnote
tags: [devops, rails, kamal, startups]
image:
 path: /assets/images/2026-06-04-The-5-Vps-Reality-My-Honest-Math-On-Moving-To-Kamal-2/feature.webp
---

I remember the day I got my first $200 bill from a PaaS provider (Platform as a Service). 

I only had a few side projects running. None of them were making much money, but because I needed a "Standard" database for one and an extra "Worker" for another, the costs just started stacking up. I felt like I was paying a "Laziness Tax" just to avoid managing a server.

In 2026, the trend has reversed. Tools like **Kamal 2** and **Rails 8** have made it incredibly easy to leave the expensive "managed" clouds and host everything yourself on a cheap VPS.

But is it actually cheaper? Most people only look at the monthly bill, but they forget about the "Time Tax." Here is my honest breakdown of the true cost of running your own cloud empire.

## 1. The Financial Math (The "Win")

Let’s look at a typical Rails setup for a small SaaS.

**The Heroku/Render Way:**
*   Web Service (2GB RAM): $25
*   Postgres Database (Managed): $30
*   Redis (for Sidekiq): $15
*   **Total: $70/month**

**The Self-Hosted Way (Hetzner/DigitalOcean):**
*   One VPS (ARM, 8GB RAM, 4 vCPUs): $10
*   Backups (S3/R2): $1
*   **Total: $11/month**

**Savings: $59 per month / $708 per year.** 
If you have 5 different apps, you are saving over **$3,500 a year**. For a solo developer living in Europe, that is a huge amount of money that can be spent on marketing or better coffee.

## 2. The Maintenance Tax (The "Hidden Cost")

This is where the PaaS providers justify their high prices. When you self-host, you are the CEO, the Developer, and now the **System Administrator**.

*   **Security:** You are responsible for OS updates. If a new Linux vulnerability comes out, you have to run `apt-get upgrade`.
*   **Backups:** On Heroku, you click a button. On a VPS, you have to ensure your database is being streamed to S3 (using Litestream or a cron job). If your script fails and the server dies, your business is gone.
*   **Monitoring:** If your server runs out of disk space at 3:00 AM, there is no support team to fix it. You need to set up your own alerts (like UptimeRobot or health checks).

**True Cost:** About 1–2 hours of "Server Maintenance" per month.

## 3. The "One-Person" Secret: Docker & Kamal 2

The reason self-hosting is viable in 2026 is because we stopped managing servers manually. 

In the old days, you had to install Ruby, Nginx, and Postgres on the server. It was a nightmare. Today, we use **Docker**. Your server is just a "dumb" box that runs containers. 

With **Kamal 2**, deploying to a $5 VPS feels exactly like deploying to Heroku. You type `kamal deploy`, and it handles the SSL, the zero-downtime switch, and the health checks. 

The "Learning Tax" to master Kamal takes about a weekend. Once you pay that tax, you never have to pay the "PaaS Tax" again.

## 4. The Stability Myth

People fear that a cheap VPS is less stable than AWS or Heroku. 

The truth? Modern VPS providers like Hetzner or Akamai have 99.9% uptime. Most "crashes" in a Rails app aren't caused by the hardware; they are caused by **bad code** (N+1 queries, memory leaks, or unhandled exceptions). 

Whether you pay $7 or $700, a bug in your Ruby code will still crash the app. 

## Summary: Should You Switch?

If you are a solo developer, here is my recommendation:

*   **Stay on a PaaS (Render/Fly.io)** if you are in the first 48 hours of an idea. Don't waste time on infrastructure until you know the idea is worth it.
*   **Switch to Self-Hosting (Kamal + VPS)** the moment your app starts making even $10 a month. 

The $50+ you save every month covers your AI subscription (Cursor/ChatGPT), your domain names, and your email marketing tools. 

Building your own "Cloud Empire" isn't just about saving money; it’s about **Ownership**. When you own the server, you have total control. And in the world of indie hacking, control is freedom.