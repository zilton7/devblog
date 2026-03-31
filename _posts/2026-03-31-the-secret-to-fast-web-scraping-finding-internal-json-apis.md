---
title: "The Secret to Fast Web Scraping: Finding Internal JSON APIs"
categories: selfnote
tags: [ruby, scraping, webdev, tutorial]
image:
 path: /assets/images/2026-03-31-The-Secret-To-Fast-Web-Scraping-Finding-Internal-Json-Apis/feature.webp
---

When I first started web scraping, my workflow was always the same. I would use `Nokogiri` to download the HTML page, and then I would spend hours writing crazy CSS selectors to extract the text I needed. 

If the website was built with React or Vue and the data loaded dynamically, I would boot up a heavy headless browser like Selenium or Playwright just to wait for the page to render.

Very often I find myself frustrated because websites change their CSS classes all the time, breaking my scraper. But recently, I changed my approach completely. 

Modern websites are basically just empty shells that fetch data from **internal, hidden APIs**. If you can find that API, you can skip the HTML completely and just download perfectly structured JSON data. It is 100x faster and much more reliable.

Here is how to find and scrape hidden APIs in 4 easy steps.

## STEP 1: The Detective Work (Network Tab)

You don't need any special hacking tools for this. Just use your browser. Let's say you want to scrape a list of products from an e-commerce store.

1. Open the website in Google Chrome.
2. Right-click anywhere on the page and select **Inspect** to open DevTools.
3. Go to the **Network** tab.
4. Click the filter button that says **Fetch/XHR**. (This hides all the images, CSS, and fonts, showing only data requests).
5. Now, refresh the page or scroll down to load more products.

You will see a list of requests appear. Click on them one by one and look at the **Preview** or **Response** tab. You are looking for the one that returns a clean JSON object containing the product data. 

## STEP 2: Copy as cURL

Once you find the correct API request, you can't just copy the URL and paste it into your Ruby script. Internal APIs usually require specific headers to work, like a `User-Agent`, an `Accept` header, or an authorization token.

Chrome makes it very easy to grab all of this.

1. Right-click the successful request in the Network tab.
2. Go to **Copy** -> **Copy as cURL**.

Now you have the exact command, including all the secret headers the browser used, copied to your clipboard.

## STEP 3: Convert to Ruby Code

Now we need to translate that cURL command into a Ruby script. 
You can do this manually, but the fastest way is to go to a free site like [curlconverter.com](https://curlconverter.com/ruby/) and paste your cURL command. It will instantly generate the Ruby code for you.

Here is what a typical request looks like using the `http` gem:

```ruby
# scraper.rb
require 'http'
require 'json'

url = "https://api.example-store.com/v1/products"

# We pass the headers we copied from Chrome
headers = {
  "User-Agent" => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
  "Accept" => "application/json",
  "Referer" => "https://example-store.com/category/shoes"
}

# Make the request to the hidden API
response = HTTP.headers(headers).get(url)

if response.status.success?
  # Parse the JSON response
  data = JSON.parse(response.body)
  
  # Loop through the data easily!
  data["items"].each do |product|
    puts "Name: #{product['name']} - Price: $#{product['price']}"
  end
else
  puts "Failed to fetch data."
end
```

## STEP 4: Pagination (The Infinite Scroll)

Usually, the first API request only gives you 20 or 50 items. If you want to scrape the whole category, you need to figure out how the API handles pagination.

Go back to your Chrome Network tab and look at the **Payload** (or the URL parameters) of the request. 

You will usually see something like this:
*   `?page=1`
*   `?offset=20`
*   `?cursor=abc123xyz`

To scrape all the pages, you just wrap your Ruby request in a simple loop, incrementing the page number or cursor each time until the API returns an empty array.

```ruby
# Example of a simple pagination loop
page = 1
loop do
  response = HTTP.headers(headers).get("#{url}?page=#{page}")
  data = JSON.parse(response.body)
  
  break if data["items"].empty? # Stop when no more products
  
  # Process items here...
  
  page += 1
  sleep(1) # Be nice to their server!
end
```

## Why I like this approach?

There are a few reasons why I prefer scraping hidden APIs over parsing HTML:

1.  **Speed:** You are not downloading megabytes of images, fonts, and javascript files. You are just downloading tiny text files. It is incredibly fast.
2.  **Stability:** Frontend developers change HTML structure and CSS classes all the time to update the design. They rarely change the internal API structure, so your scraper won't break as often.
3.  **Hidden Data:** Very often, the JSON API returns *more* data than the website actually displays on the screen. You might find exact stock counts, internal product IDs, or hidden categories that are super useful for your project.

That's pretty much it. Next time you need to scrape a modern website, don't reach for Nokogiri or Selenium right away. Spend 5 minutes in the Network tab first. It might save you hours of work.