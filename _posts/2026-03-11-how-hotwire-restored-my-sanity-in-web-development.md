---
title: "How Hotwire Restored My Sanity in Web Development"
categories: selfnote
tags: [rails, javascript, hotwire, webdev]
image:
 path: /assets/images/2026-03-11-How-Hotwire-Restored-My-Sanity-In-Web-Development/feature.webp
---

I'll admit it: I used to be a React maximalist. 

I spent years believing that if you wanted a "modern" web experience, you had to build a decoupled architecture. I wrote thousands of lines of boilerplate to synchronize a client-side JSON state with a server-side database. I wrestled with `useEffect` loops, Redux stores, and the constant fear that my frontend and backend would drift out of sync.

Then I tried **Hotwire**. 

It didn't just change my code; it changed my relationship with web development. Here is why I am absolutely in love with the "HTML Over The Wire" approach.

---

## 1. I Stopped Building APIs for Myself
The biggest epiphany I had with Hotwire was realizing how much time I wasted building JSON APIs that only *I* was going to use. 

In a traditional SPA/React setup, you spend half your day writing a controller to turn a Ruby object into JSON, and the other half writing JavaScript to turn that JSON back into HTML. 

**Hotwire deletes that entire layer.** The server sends HTML. The browser renders HTML. The middleman is dead, and I couldn't be happier.

## 2. The "Single Source of Truth" is Back
In a React app, "State Management" is a nightmare. You have data in your Postgres DB, and you have a "mirror" of that data in your browser's memory. When they disagree, bugs happen.

With Hotwire, the **Database is the only state.**
*   If a user clicks "Like," the server updates the DB and sends back the updated HTML for the button.
*   There is no "optimistic UI" logic to write manually.
*   There is no "stale data" in the browser.
The browser is just a window into the server.

## 3. Turbo Frames are "Magic Boxes"
The most delightful part of Hotwire is **Turbo Frames**. 

You can wrap any part of your page in a `<turbo-frame>` tag, and suddenly, that part of the page becomes an independent island. Links and forms inside that box only update *that box*. 

I recently built a complex tabbed dashboard. In React, that would have been a maze of state-controlled visibility. In Hotwire, it was just 5 separate files and a few frame tags. It felt like cheating.

## 4. Stimulus is the "Modest" JS I Needed
I still need JavaScript. I need it for modals, for copy-to-clipboard buttons, and for dropdowns. 

But I don't want JS to manage my entire application architecture. **Stimulus.js** is the perfect "sprinkles" framework. It doesn't try to take over the page; it just gives me a clean, organized way to add small bits of interactivity to my HTML. It’s the JavaScript I actually enjoy writing.

## 5. The "One-Person" Velocity
As a solo developer, **Velocity is my only currency.** 

Hotwire allows me to build features in a few hours that used to take me days in React. I stay in the "Ruby Flow." I don't have to switch contexts between languages, build tools, or testing frameworks. 

Hotwire enables the **One-Person Framework**. It allows me to build an app that looks and feels like it was made by a team of ten, while I’m just sitting here in my pajamas with a cup of coffee.

---

## Summary
Hotwire isn't a "regression" to the old days of the web. It’s an evolution. It’s a realization that we over-complicated the frontend, and that the server-side monolith is actually the most efficient way to build most apps.

I love Hotwire because it lets me focus on the **Product**, not the **Plumbing**. 

***

*Are you a Hotwire convert or a SPA loyalist? I’d love to hear your "Aha!" moment in the comments! 👇*
