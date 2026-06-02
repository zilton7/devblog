---
title: "Stop Using JS for Everything: Harnessing the Power of Pure CSS in 2026"
categories: selfnote
tags: [css, javascript, webdev, performance]
image:
 path: /assets/images/2026-06-02-Stop-Using-Js-For-Everything-Harnessing-The-Power-Of-Pure-Css-In-2026/feature.webp
---

I remember when building a simple dropdown menu or a sticky header required a library like jQuery. Later, we moved to writing Stimulus controllers or React hooks for every single tiny interaction on the screen. 

As a developer, my instinct was always: *"If it moves, write JavaScript."*

But in 2026, the browser has changed. CSS has evolved so much that many of the things we used to do in JS are now built natively into the stylesheet. Moving this logic to CSS isn't just about being "cool" - it makes your site significantly faster, reduces "layout shift," and means you have less code to maintain.

Here is how I’ve started replacing JavaScript with pure CSS in my Rails 8 projects.

## 1. The "Parent" Selector (`:has`)

For decades, we wanted a way to style an element based on what was *inside* it. 

**The Old Way (JS):**
You would write a script to check if a checkbox was ticked, then add a class like `.is-active` to the parent container.

**The 2026 Way (CSS):**
We now have the `:has()` selector. It is a game-changer.

```css
/* Style the card only if it contains a checked checkbox */
.card:has(input[type="checkbox"]:checked) {
  background-color: #f0fdf4;
  border-color: #22c55e;
}
```
This replaces hundreds of lines of "state-toggling" JavaScript. You can use it for form validation, menu states, and complex grid layouts.

## 2. Native Popovers (The `popover` Attribute)

Tooltips and dropdowns are usually the first things people use JavaScript for. In 2026, we don't need a JS library for this anymore.

**The Modern Way:**
You use the HTML `popover` attribute and target it with CSS.

```html
<button popovertarget="my-menu">Open Menu</button>

<div id="my-menu" popover class="p-4 rounded-lg shadow-xl">
  <p>This is a pure CSS/HTML dropdown!</p>
</div>
```

With zero lines of JavaScript, the browser automatically handles:
*   Showing/hiding the element.
*   "Light dismiss" (closing when you click outside).
*   Putting the menu on the "top layer" so it isn't cut off by parent containers.

## 3. Container Queries (No more JS Resize Listeners)

We used to use JavaScript `ResizeObserver` to change a component's layout if its container got too small (like a sidebar moving to the bottom).

**The 2026 Way:**
Container queries allow an element to style itself based on its **own size**, not the size of the whole browser window.

```css
.card-container {
  container-type: inline-size;
}

@container (max-width: 400px) {
  .card {
    flex-direction: column;
    padding: 1rem;
  }
}
```
This is perfect for Rails developers using **ViewComponents**. Your component can now be "smart" and responsive no matter where you drop it in your layout.

## 4. Scroll-Driven Animations

I used to hate writing JS scroll listeners. They are terrible for performance and often feel "janky" on mobile phones. 

In 2026, we can link animations directly to the scroll position using pure CSS. Want a progress bar at the top of your blog post?

```css
@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.progress-bar {
  animation: grow-progress auto linear;
  animation-timeline: scroll();
}
```
The browser handles the math. It is buttery smooth and consumes zero CPU cycles compared to a JS `scroll` event.

## 5. Native Smooth Scrolling and Snap

If you are building a landing page with a carousel or a "back to top" button, you might be tempted to use a JS library. 

Don't. 

```css
html {
  scroll-behavior: smooth;
}

.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.carousel-item {
  scroll-snap-align: center;
}
```
This gives you that premium, "app-like" sliding feel natively.

## Summary: Why this matters for Rails 8

When we use **Hotwire and Turbo**, we want to keep the "State" on the server as much as possible. Every time we add a custom Stimulus controller for a tiny UI animation, we are adding "Client-side State" that we have to manage.

By using these 2026 CSS features:
1.  Your **HTML is cleaner**.
2.  Your **JavaScript bundle is smaller**.
3.  Your **UX is more resilient** (CSS doesn't "crash" like JS does).

Next time you are about to run `rails generate stimulus`, ask yourself: *"Can I do this with `:has()` or a container query instead?"* Most of the time, the answer is now yes.