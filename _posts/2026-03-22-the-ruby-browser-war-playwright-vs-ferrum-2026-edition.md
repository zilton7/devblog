---
title: "The Ruby Browser War: Playwright vs. Ferrum (2026 Edition)"
categories: selfnote
tags: [ruby, scraping, testing, webdev]
image:
 path: /assets/images/2026-03-22-The-Ruby-Browser-War-Playwright-Vs-Ferrum-2026-Edition/feature.webp
---

## The New Guard
For a decade, **Selenium** was the king of browser automation. It was slow, clunky, and flaky, but it was all we had.

In 2026, the king is dead.
Two new challengers have taken the throne in the Ruby world: **Ferrum** and **Playwright**.

Both allow you to control a headless Chrome browser. Both are faster than Selenium. But they have very different philosophies. Which one should you choose for your next scraper or test suite?

Let's break it down.

---

## Contender 1: Ferrum (The Native Hero)
**Ferrum** is a pure Ruby driver for Chrome. It connects directly to the **Chrome DevTools Protocol (CDP)** using a WebSocket.

### The Good
1.  **Pure Ruby:** There is no "WebDriver" binary to install. There is no Node.js server running in the background. It is just a Gem and Chrome.
2.  **Lightweight:** Because it has zero dependencies, it boots instantly. It uses very little RAM.
3.  **CDP Access:** It gives you low-level access to the browser protocol. If you need to intercept a specific packet or trick a fingerprint, Ferrum gives you the raw tools to do it.

### The Bad
1.  **Manual Waiting:** Like the old days, Ferrum doesn't always know when an animation is finished. You often have to write `browser.network.wait_for_idle` or loop until an element appears.
2.  **Chrome Only:** It doesn't support Firefox or Safari (WebKit).

**Code Style:**
```ruby
browser = Ferrum::Browser.new
browser.goto("https://google.com")
input = browser.at_css("input[name='q']")
input.type("Ruby Ferrum")
input.type(:enter)
```

---

## Contender 2: Playwright (The Industry Titan)
**Playwright** is Microsoft's automation tool. The `playwright-ruby-client` is a wrapper that communicates with the Playwright driver.

### The Good
1.  **Auto-Waiting:** This is the killer feature. If you tell Playwright to click a button, it automatically waits for the button to be visible, enabled, and stable. **Flakiness disappears.**
2.  **Trace Viewer:** When a test fails, Playwright gives you a "Trace" - a time-travel recording of exactly what the browser saw, the network logs, and the console errors at that millisecond.
3.  **Codegen:** You can record your clicks and generate Ruby code automatically.

### The Bad
1.  **Heavier Install:** You have to install the Playwright binaries (`npx playwright install`). It’s a larger package to deploy to Heroku or AWS Lambda.
2.  **Not "Pure" Ruby:** Under the hood, it's talking to a driver server. It feels native, but strict Rubyists sometimes dislike the extra layer.

**Code Style:**
```ruby
Playwright.create(playwright_cli_executable_path: './bin/playwright') do |p|
  p.chromium.launch do |browser|
    page = browser.new_page
    page.goto("https://google.com")
    # It waits for the input automatically!
    page.fill("input[name='q']", "Ruby Playwright") 
    page.press("input[name='q']", "Enter")
  end
end
```

---

## The Decision Matrix

### Scenario A: The "One-Off" Scraper
You need to scrape a specific React site, extract some prices, and save them to a CSV. You want to run this on a cheap $5 VPS.

**Winner: Ferrum**
*   **Why:** It has a smaller footprint. You don't need to install the Playwright dependencies on your server. It’s "bundle install and go."

### Scenario B: The Enterprise Test Suite
You are building a massive Rails app. You need End-to-End (E2E) tests to ensure the checkout flow works.

**Winner: Playwright**
*   **Why:** **Auto-waiting** saves you hours of debugging "element not found" errors. The **Trace Viewer** allows your team to debug failures in CI instantly. Ferrum is too manual for large test suites.

### Scenario C: The Heavy Crawler
You are building a system to crawl 100,000 pages (using **Vessel**).

**Winner: Ferrum (via Vessel)**
*   **Why:** Vessel is built on Ferrum. It handles the concurrency and pool management for you. Playwright is great, but managing 50 concurrent Playwright contexts manually is difficult.

---

## Summary
*   **Choose Ferrum** if you want simplicity, low memory usage, and a pure Ruby dependency tree.
*   **Choose Playwright** if you want reliability, powerful debugging tools, and cross-browser support (Firefox/Safari).

Personally? I use **Ferrum** for scraping scripts and **Playwright** for Rails system tests. Use the right tool for the job.

***

*Which side of the war are you on? Team Native or Team Microsoft? Let me know in the comments! 👇*