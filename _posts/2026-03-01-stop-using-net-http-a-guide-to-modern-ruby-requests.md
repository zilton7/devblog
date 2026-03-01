---
title: "Stop Using Net::HTTP: A Guide to Modern Ruby Requests"
categories: selfnote
tags: [ruby, rails, webdev, performance]
image:
  feature: /assets/images/2026-03-01-Stop-Using-Net-Http-A-Guide-To-Modern-Ruby-Requests/feature.webp
---

Ruby has a standard library for making web requests called `Net::HTTP`.
It is famously terrible.

The API is clunky, it requires too many lines of code to do simple things, and handling timeouts is a pain. Because of this, the Ruby ecosystem has exploded with gems to make HTTP requests easier.

But in 2026, which one should you actually use? Is `HTTParty` still the king? Is `Faraday` overkill? Here is the breakdown.

## 1. HTTParty (The Old Reliable)
For a long time, this was the default choice for beginners.

**The Vibe:** Quick, dirty, and fun.
**The Syntax:**
```ruby
require 'httparty'

response = HTTParty.get('https://api.stackexchange.com/2.2/questions?site=stackoverflow')
puts response.body
puts response.code
puts response.message
```

**Pros:**
*   **Class Methods:** You can `include HTTParty` in your own class to turn it into an API client instantly.
*   **Simplicity:** It parses JSON automatically if the content type is correct.

**Cons:**
*   **Performance:** It creates a lot of object garbage.
*   **Thread Safety:** Older versions had issues here; it's better now but still not the modern standard.

**Verdict:** Use it for **one-off scripts** or simple rake tasks. Don't use it for the core of a high-scale production app.

## 2. Faraday (The Industry Standard)
Faraday is unique. It isn't actually an HTTP client; it’s a **Wrapper** (Middleware) around other clients.

**The Vibe:** Professional, flexible, and robust.
**The Syntax:**
```ruby
conn = Faraday.new(
  url: 'https://api.example.com',
  headers: {'Content-Type' => 'application/json'}
) do |f|
  f.request :json # Encode request as JSON
  f.response :json # Decode response as JSON
  f.adapter :net_http # The actual driver
end

response = conn.get('/users')
```

**Pros:**
*   **The Middleware Stack:** This is the killer feature. You can inject logic *between* the request and the response. Want to automatically retry failed requests? Add `f.retry`. Want to log every request? Add `f.response :logger`.
*   **Swappable Backends:** You can start using `Net::HTTP` and switch to `Typhoeus` (for parallel requests) later without changing your application code.

**Cons:**
*   **Verbose:** Setting up the connection object takes more code than HTTParty.

**Verdict:** The best choice for **Building SDKs** or production integrations (e.g., Stripe and Slack usage Faraday).

## 3. The `http` Gem (The Modern Choice)
Often called `http.rb`, this gem gained popularity for being fast and having a beautiful "Chainable" syntax.

**The Vibe:** Elegant and Thread-Safe.
**The Syntax:**
```ruby
require "http"

response = HTTP.headers(accept: "application/json")
               .auth("Bearer my_token")
               .get("https://api.example.com/users")

puts response.parse
```

**Pros:**
*   **Chainable:** You build requests like you build ActiveRecord queries.
*   **Thread Safe:** Built with modern concurrency in mind.
*   **Fast:** It is significantly lighter than Faraday.

**Verdict:** My personal favorite for **Microservices** or internal API calls where I don't need the complexity of Faraday.

## 4. HTTPX (The Speed Demon)
This is the newcomer that is eating everyone's lunch regarding performance.

**The Vibe:** Bleeding edge and blazing fast.
**The Syntax:**
```ruby
require "httpx"

response = HTTPX.get("https://nghttp2.org/httpbin/get")
```

**Pros:**
*   **HTTP/2 and HTTP/3:** It supports modern protocols out of the box (most other gems are stuck on HTTP/1.1).
*   **Zero Dependencies:** It doesn't rely on `Net::HTTP` or OpenSSL extensions; it implements its own networking layer.
*   **Concurrency:** It can fire off 100 requests in parallel natively without threads.

**Verdict:** Use it for **High Performance** scraping or heavy data fetching.

## Summary: The Cheat Sheet

| Scenario | Recommendation | Why? |
| :--- | :--- | :--- |
| **Simple Script** | **HTTParty** | Lowest barrier to entry. |
| **Production App** | **Faraday** | Middleware is essential for logging/retries. |
| **Clean Code** | **HTTP.rb** | Best syntax (`HTTP.get`). |
| **Scraping/Speed** | **HTTPX** | HTTP/2 support and native concurrency. |

Stop struggling with `Net::HTTP`. Pick a tool that matches your needs and treat yourself to a better developer experience.

***

*Which gem is in your Gemfile right now? Are you Team Faraday or Team HTTParty? Let me know in the comments! 👇*