---
title: "The Ultimate Ruby Scraping Stack: From Nokogiri to Ferrum"
categories: selfnote
tags: [ruby, scraping, webdev, productivity]
image:
 path: /assets/images/2026-03-08-The-Ultimate-Ruby-Scraping-Stack-From-Nokogiri-To-Ferrum/feature.webp
---

Web scraping in Ruby isn't a "one size fits all" task. If you use a headless browser for a static site, you’re wasting CPU. If you use Nokogiri for a React app, you’ll get zero data.

Here is the professional decision tree for choosing your scraping strategy.

---

## 1. The Decision Tree

*   **Does the page return HTML directly?** → Use **Nokogiri**.
*   **Is it a JavaScript Single Page App (SPA)?** → Check the **Network Tab** for an API.
*   **Is the data hidden behind complex JS/User Interaction?** → Use **Ferrum**.
*   **Are you scraping thousands of pages?** → Use **Kimurai**.

---

## 2. Level 1: The Speed King (HTTP + Nokogiri)
If the data is in the source code (View Source), don't overcomplicate it. Nokogiri is a C-extension based parser that is incredibly fast.

**The Stack:** `HTTP` (gem) + `Nokogiri`

```ruby
require 'http'
require 'nokogiri'

response = HTTP.get("https://news.ycombinator.com/")
doc = Nokogiri::HTML(response.body)

doc.css('.titleline > a').each do |link|
  puts "#{link.text}: #{link['href']}"
end
```
**Why it wins:** It uses almost no RAM and can process hundreds of pages per minute.

---

## 3. Level 2: The Modern Headless Choice (Ferrum)
If you *must* use a browser (to click buttons or wait for Vue/React to render), stop using Selenium. It’s slow and requires a clunky "WebDriver" middleman.

Use **[Ferrum](https://github.com/rubycdp/ferrum)**. It talks directly to Chrome via the **Chrome DevTools Protocol (CDP)**.

```ruby
require "ferrum"

browser = Ferrum::Browser.new(headless: true)
browser.goto("https://example.com/dynamic-charts")

# Wait for a specific element to appear
browser.network.wait_for_idle 
# Or: browser.at_css(".data-loaded")

puts browser.at_css(".price-display").text
browser.quit
```
**Why it wins:** It’s faster than Selenium, easier to install on Linux (just needs Chromium), and gives you much better control over the network and headers.

---

## 4. Level 3: High-Volume Orchestration (Kimurai)
If you are building a full-scale crawler that needs to handle proxies, rotating User-Agents, and multi-threading, don't build it from scratch.

Use **[Kimurai](https://github.com/vifreefly/kimurai)**. It’s a framework that brings "Scrapy-like" power to Ruby.

```ruby
class MySpider < Kimurai::Base
  @name = "ecommerce_spider"
  @engine = :mechanize # or :ferrum
  @start_urls = ["https://store.com/products"]

  def parse(response, url:, data: {})
    response.css(".product-card").each do |product|
      # Process data here
    end
  end
end

MySpider.crawl!
```

---

## 5. Pro-Tips for the Serious Scraper

### Use "Search" instead of "CSS"
Nokogiri supports `xpath`, which is more powerful than CSS selectors. If you need to find a button based on the text it contains, XPath is your best friend:
`doc.xpath("//button[contains(text(), 'Submit')]")`

### Identity Management
Always set a `User-Agent`. If you don't, some servers will see the default `Ruby` or `Faraday` user agent and block you instantly. Use a real browser string:
`"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."`

### Persistence
Don't just print to the console. If you are scraping a lot of data, stream it directly to a CSV or a JSONL (JSON Lines) file so that if the script crashes on page 500, you don't lose the first 499.

```ruby
require 'csv'
CSV.open("data.csv", "ab") do |csv|
  csv << [title, price, url]
end
```

---

## The Ethics Check
1.  **Check `robots.txt`:** Respect the `Crawl-delay`.
2.  **Don't DDOS:** Use `sleep(rand(1..3))` to mimic human behavior.
3.  **Check for an API:** As we discussed in the previous article, if they have a JSON API, use it. It’s better for everyone.

### Summary
*   **Static?** Nokogiri.
*   **Dynamic?** Ferrum.
*   **Massive?** Kimurai.
*   **Smart?** Find the hidden API.

***

*What’s the hardest site you’ve ever tried to scrape? Let's solve it in the comments! 👇*