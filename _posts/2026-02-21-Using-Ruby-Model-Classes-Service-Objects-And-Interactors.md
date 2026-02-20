---
title: Using Ruby Model Classes, Service Objects and Interactors
categories: selfnote
tags: [ruby, rails,  'service object', 'model class', interactor]
image:
  feature: /assets/images/2026-02-21-Using-Ruby-Model-Classes-Service-Objects-And-Interactors/feature.webp
---

## The Selenium Struggle
If you’ve done any browser automation in Ruby, you know the "Selenium Dance.

![Cover Image of the Article]({{ site.url }}{{ site.baseurl }}/assets/images/2026-02-21-Using-Ruby-Model-Classes-Service-Objects-And-Interactors/feature.webp)" 
1. You try to click a button. 
2. The test fails because the element wasn't "ready" yet. 
3. You add `sleep(2)`.
4. It works for a week, then fails again. 
5. You add `wait.until { ... }` and your code becomes a mess of nested blocks.

Selenium was built for a different era of the web—an era before heavy React/Vue apps and complex asynchronous state. It requires a clunky "WebDriver" middleman to talk to the browser, which adds latency and instability.

**It’s time to move over.** Playwright has arrived in the Ruby ecosystem, and it changes everything.

---

## Why Playwright Wins
Playwright (developed by Microsoft) was designed for the modern web. In the Ruby world, we use the excellent `playwright-ruby-client` gem. Here is why it is superior:

### 1. Auto-Waiting (The "Sleep" Killer)
Playwright performs "actionability checks" before every interaction. If you tell it to click a button, it automatically waits for that button to be visible, enabled, and stop moving before it tries to click. You can finally delete all your `sleep` calls.

### 2. Fast Network Interception
Playwright allows you to see, modify, or block network requests. As we discussed in previous articles about **internal APIs**, this is a superpower. You can tell Playwright to ignore all CSS and Image requests to make your scraper 5x faster.

### 3. Multiple Contexts
You can open 10 "Browser Contexts" within a single browser instance. These are like completely isolated incognito windows. This is perfect for testing different user roles or scraping sites that require multiple separate sessions without the overhead of booting 10 browsers.

---

## Getting Started

First, add the gem to your Gemfile:
```ruby
gem 'playwright-ruby-client'
```

Then, install the browsers (this is a one-time setup):
```bash
bundle install
bundle exec playwright install
```

---

## The Basic Script
Here is how clean a Playwright script looks compared to the verbose Selenium setup:

```ruby
require 'playwright'

Playwright.create(playwright_cli_executable_path: './bin/playwright') do |playwright|
  # Launch Chromium (or firefox / webkit)
  playwright.chromium.launch(headless: true) do |browser|
    page = browser.new_page
    page.goto('https://github.com/login')

    # No 'sleep' needed! Playwright waits for the input to appear.
    page.fill('input[name="login"]', 'your_username')
    page.fill('input[name="password"]', 'your_password')
    page.click('input[type="submit"]')

    puts "Logged in as: #{page.title}"
  end
end
```

---

## Killer Feature: Codegen
One of the best things about Playwright is **Codegen**. You can run a command that opens a browser, records your clicks, and **generates the Ruby code for you.**

```bash
bundle exec playwright codegen https://example.com
```
As you click around, the terminal will live-stream the Ruby code required to replicate those actions. It’s the fastest way to build a scraper.

---

## Advanced: Intercepting JSON
Remember how we talked about scraping internal APIs? Playwright makes this trivial. You can listen for the exact moment the website fetches its data:

```ruby
page.on('response') do |response|
  if response.url.include?('/api/v1/products')
    puts "Caught the data: #{response.json}"
  end
end

page.goto('https://example.com/products')
```

---

## Selenium vs. Playwright: The Comparison

| Feature | Selenium | Playwright |
| :--- | :--- | :--- |
| **Speed** | Slow (HTTP overhead) | Fast (Direct Pipe) |
| **Waiting** | Manual / Brittle | **Native Auto-waiting** |
| **Browsers** | All (via WebDrivers) | Chromium, Firefox, WebKit |
| **Mobile** | Limited | Native Emulation |
| **Network Control** | Very Hard | First-class citizen |

---

## Summary
If you are starting a new project in 2026, there is almost no reason to choose Selenium. Playwright is faster, more reliable, and built for the way we build websites today. 

It turns "browser automation" from a frustrating chore into a reliable part of your Ruby stack.

***

*Have you made the switch to Playwright yet? What was the biggest "Aha!" moment for you? Let's discuss in the comments! 👇*