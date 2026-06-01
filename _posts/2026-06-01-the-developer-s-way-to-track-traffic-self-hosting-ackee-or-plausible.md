---
title: "The Developer's Way to Track Traffic: Self-Hosting Ackee or Plausible"
categories: selfnote
tags: [analytics, privacy, devops, rails]
image:
 path: /assets/images/2026-06-01-The-Developer-S-Way-To-Track-Traffic-Self-Hosting-Ackee-Or-Plausible/feature.webp
---

I recently took a long look at my Rails projects and realized I was carrying around a piece of technical debt that was actually hurting my user experience: **Google Analytics (GA4).**

As a developer living in the EU (Lithuania), using Google Analytics is a headache. Between the complex GDPR compliance rules, the legal uncertainty of sending data to US servers, and that massive, ugly cookie banner I was forced to show every visitor, it just didn't feel "clean" anymore. 

Plus, let’s be honest: GA4 is bloated. I don't need 500 different reports to tell me how many people visited my pricing page today. I just want to see my traffic, my referrers, and my conversion rate without selling my users' souls to an advertising giant.

In 2026, the best move for a solo developer is to self-host your own privacy-first analytics. Here is how I moved to **Ackee** and **Plausible**, and why you should too.

## 1. Why Self-Host?

When you self-host your analytics, you own the data. It lives on your server, in your database. 

*   **No Cookie Banners:** Tools like Plausible and Ackee don't use cookies and don't track personal data. Under GDPR, this means you can often remove those annoying "Accept Cookies" popups entirely.
*   **Performance:** The Google Analytics script is heavy. Self-hosted alternatives are usually tiny (under 1KB), which helps your site load faster and score higher on Google Lighthouse.
*   **Ad-Blocker Friendly:** Because you are serving the script from your own subdomain (like `stats.yourdomain.com`), many ad-blockers won't catch it, giving you more accurate data than Google.

## 2. The Contenders: Ackee vs. Plausible

There are two main players I recommend for the Rails community.

### Ackee (The Minimalist)
Ackee is built on Node.js and is incredibly beautiful. It is perfect if you just want the "vibe" of your traffic. It shows you views, referrers, and duration in a very clean, dark interface.
*   **Pros:** Very lightweight, easy to run in a Docker container.
*   **Cons:** Doesn't track "Goals" (like button clicks) as easily as Plausible.

### Plausible (The Professional)
Plausible is the gold standard for privacy-first analytics. It is written in Elixir and is incredibly fast.
*   **Pros:** Supports goal tracking, custom events, and even integrates with Google Search Console so you can see your keywords.
*   **Cons:** A bit more complex to self-host because it requires a ClickHouse database for the stats.

## 3. Deployment with Kamal 2

If you followed my previous articles, you know I use **Kamal 2** to build my "Cloud Empire" on cheap VPS servers. Deploying a self-hosted analytics tool is just another Docker container in your cluster.

Here is a simplified `deploy.yml` example for running Ackee on a subdomain:

```yaml
service: my-stats
image: electerious/ackee

servers:
  web:
    - 123.45.67.89 # Your VPS IP

proxy:
  ssl: true
  host: stats.zil.com

env:
  secret:
    - ACKEE_PASSWORD
  clear:
    ACKEE_MONGODB: mongodb://db_user:pass@your-db-ip:27017/ackee
```

Once deployed, you get a small JavaScript snippet to paste into your Rails layout.

## 4. Integrating with Rails

You don't need a heavy gem for this. Just put the script in your `<head>`.

```erb
<!-- app/views/layouts/application.html.erb -->
<% if Rails.env.production? %>
  <script 
    async 
    src="https://stats.zil.com/tracker.js" 
    data-ackee-server="https://stats.zil.com" 
    data-ackee-domain-id="your-uuid-here">
  </script>
<% end %>
```

If you want to track custom events (like when someone clicks "Subscribe"), you can trigger it from a **Stimulus** controller:

```javascript
// app/javascript/controllers/analytics_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  trackClick() {
    // Ackee custom action
    ackeeTracker.action('button_clicked', { key: 'Join', value: 1 })
  }
}
```

## Summary

Moving away from Google Analytics was one of the best decisions I made for my side projects. 

1.  My sites load faster.
2.  My users' privacy is respected.
3.  I don't have to deal with complex GDPR legal paperwork.
4.  My dashboard is actually fun to look at again.

If you are a solo developer, stop giving your data away for free. Rent a $5 VPS, spin up a Docker container, and take control of your own metrics.