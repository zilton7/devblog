---
title: "The Faster Way to Scrape: Finding 'Hidden' APIs in Modern Websites"
categories: selfnote
tags: [ruby, javascript, webdev, scraping]
image:
 path: /assets/images/2026-03-07-The-Faster-Way-To-Scrape-Finding-Hidden-Apis-In-Modern-Websites/feature.webp
---

## The Headless Browser Trap
If you want to scrape a modern React or Vue website, the "standard" advice is to use a headless browser like Selenium or Playwright. These tools boot up a literal browser, wait for JavaScript to execute, and then let you parse the HTML.

**It works, but it’s terrible for scaling.**
*   It’s **slow** (you have to wait for assets to load).
*   It’s **resource-heavy** (RAM goes through the roof).
*   It’s **flaky** (elements don't always load in time).

There is a better way. Modern websites are almost always "shells" - they load a blank page and then make a second request to an **internal API** to get the data as JSON.

If you can find that API, you get perfectly structured data at 100x the speed.

---

## Step 1: The Detective Work (The Network Tab)
Open the website you want to scrape in Chrome or Firefox. Let's say you're looking at a real estate site or a stock market dashboard.

1.  Right-click -> **Inspect**.
2.  Go to the **Network** tab.
3.  Filter by **Fetch/XHR**.
4.  Refresh the page.

Watch the requests. You are looking for a response that returns **JSON**. Look for names like `/api/v1/products`, `/graphql`, or `/search`. 

Click on the request and look at the "Preview" tab. If you see the data you’re looking for in a neat nested object, **you’ve won.**

---

## Step 2: The "Copy as cURL" Trick
You can't just copy the URL and paste it into a Ruby script. Modern APIs usually require specific headers (like a `User-Agent` or a `JWT Token`) to prevent unauthorized access.

1.  Right-click the successful request in the Network tab.
2.  Select **Copy** -> **Copy as cURL**.
3.  Go to [curlconverter.com](https://curlconverter.com/ruby/).
4.  Paste the cURL and get the Ruby code instantly.

---

## Step 3: Implementing in Ruby
Using a gem like `Faraday` or `HTTP`, you can replicate that request perfectly.

```ruby
require 'http'
require 'json'

url = "https://api.example.com/v2/products?category=electronics"

# Most internal APIs check for these three things:
headers = {
  "User-Agent" => "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
  "Accept" => "application/json",
  "Referer" => "https://example.com/electronics"
}

response = HTTP.headers(headers).get(url)

if response.status.success?
  data = JSON.parse(response.body)
  data["products"].each do |product|
    puts "#{product['name']} - #{product['price']}"
  end
end
```

---

## Why This is Superior

### 1. No CSS Selectors
You don't have to worry about the website changing a class name from `.price-tag` to `.product-cost`. APIs are generally more stable than HTML structures because the frontend team relies on them too.

### 2. Extreme Performance
A headless browser might take 5 seconds to load a page. A direct API call usually takes **100ms to 300ms**. You can scrape thousands of pages in minutes on a single CPU core.

### 3. Hidden Data
Internal APIs often return *more* data than the UI actually shows. You might find "Internal IDs," "Exact stock counts," or "Created at" timestamps that aren't visible on the webpage.

---

## The Obstacles (And How to Clear Them)

### 1. CSRF and Auth Tokens
Some sites require a CSRF token. You might need to make one initial request to the home page to grab the `Set-Cookie` header, and then pass that cookie along in your API request.

### 2. Rate Limiting
Since you are now 100x faster, you are 100x easier to catch. **Be a good citizen.** 
*   Add a `sleep(rand(1..3))` between requests.
*   Use a proxy rotation service if you are scraping at scale.

### 3. GraphQL
If the site uses GraphQL, the URL will always be `/graphql`. You’ll need to copy the **Payload** (the query string) from the Network tab and send it as a POST request.

---

## Summary
Before you reach for Selenium or Playwright, spend 60 seconds in the Network tab. If you find the internal JSON API, you've saved yourself hours of debugging brittle CSS selectors and wasted CPU cycles.

**Happy (responsible) scraping!**

***

*Have you found a "hidden API" that made your life easier? Tell us about it in the comments! 👇*