---
title: "The GraphQL Goldmine: How to Reverse Engineer APIs for Scraping"
categories: selfnote
tags: [ruby, graphql, scraping, webdev]
image:
 path: /assets/images/2026-03-21-The-Graphql-Goldmine-How-To-Reverse-Engineer-Apis-For-Scraping/feature.webp
---

## The "One Endpoint" Revolution
In the old REST world, if you wanted to scrape a user's profile, their posts, and their comments, you might have to hit three different endpoints: `/users/1`, `/users/1/posts`, and `/comments?post_id=5`.

In **GraphQL**, there is only one door: `/graphql`.

And the best part? The website explicitly tells the server *exactly* what data it wants in a structured language. If you can intercept that message, you can ask for the data yourself - and often, you can ask for **more** data than the website is showing.

Here is the 4-step process to cracking any GraphQL API.

---

## Step 1: Spotting the Target
Open your Chrome DevTools (**Network Tab**) and refresh the page.
Filter by **Fetch/XHR**.

You aren't looking for a dozen different requests. You are looking for a single request, usually named:
*   `graphql`
*   `api`
*   `query`

Click it. Look at the **Payload** tab.
If you see a JSON object with keys like `operationName`, `query`, and `variables`, you have struck gold.

**The Payload looks like this:**
```json
{
  "operationName": "GetProductDetails",
  "variables": {
    "slug": "awesome-sneakers-v2"
  },
  "query": "query GetProductDetails($slug: String!) { product(slug: $slug) { id name price stockLevel } }"
}
```

---

## Step 2: The "Introspection" Cheat Code
This is the biggest security flaw in most GraphQL implementations. Developers often forget to turn off **Introspection** in production.

Introspection allows you to ask the API: *"Tell me everything you know."*

**How to test it:**
1.  Copy the URL of the GraphQL endpoint.
2.  Download a GraphQL client like **[Altair](https://altairgraphql.dev/)** or **Insomnia**.
3.  Paste the URL and click "Reload Docs" (or "Schema").

**If it works:**
You will see a documentation sidebar appear on the right. You can now browse **every single data field** available in their database.
*   *UI shows "In Stock"?* The Schema might reveal `"exact_inventory_count": 542`.
*   *UI shows "User Name"?* The Schema might reveal `"email"`, `"created_at"`, or `"last_login"`.

You don't need to guess endpoints anymore. You have the map.

---

## Step 3: Replicating the Request in Ruby
Scraping GraphQL is just making a POST request with a specific JSON body.

```ruby
require 'http'
require 'json'

endpoint = "https://api.example.com/graphql"

# 1. The Query (Copy this from the Network Tab Payload)
query_string = <<~GRAPHQL
  query GetProducts($category: String, $cursor: String) {
    products(category: $category, first: 20, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
          price {
            amount
            currency
          }
        }
      }
    }
  }
GRAPHQL

# 2. The Variables (This is what we change to paginate!)
variables = {
  "category": "electronics",
  "cursor": nil
}

# 3. Send it
response = HTTP.headers(
  "Content-Type" => "application/json",
  "User-Agent" => "Mozilla/5.0..." # Always mimic a browser
).post(endpoint, json: { query: query_string, variables: variables })

data = JSON.parse(response.body)

# 4. Extract Data
data.dig("data", "products", "edges").each do |edge|
  puts edge.dig("node", "name")
end
```

---

## Step 4: Pagination (The Infinite Scroll)
GraphQL pagination is superior to REST pagination. It usually uses **Cursors** (a pointer to a specific record) rather than **Pages** (Page 1, Page 2).

Look at the `pageInfo` object in the response:
```json
"pageInfo": {
  "hasNextPage": true,
  "endCursor": "OPQ123=="
}
```

To get the next batch of data, you simply update your Ruby `variables` hash:
```ruby
cursor = data.dig("data", "products", "pageInfo", "endCursor")
variables["cursor"] = cursor
# ... make the request again ...
```

---

## Advanced: Defeating "Persisted Queries"
Sometimes, you look at the payload and you don't see a `query` string. Instead, you see this:
```json
{
  "operationName": "GetProduct",
  "extensions": {
    "persistedQuery": {
      "version": 1,
      "sha256Hash": "a3f89..."
    }
  }
}
```
This is a security feature called **Persisted Queries**. The server has cached the query strings and only accepts a specific Hash ID (`sha256Hash`) to execute them.

**How to beat it:**
1.  You cannot modify the query (add/remove fields).
2.  You **can** still modify the `variables`.
3.  Just copy the `sha256Hash` from the Network tab and send that in your Ruby payload instead of the `query` string. You can still iterate through pagination by changing the variables.

## Summary
GraphQL is a scraper's dream.
1.  **Check for Introspection:** It might give you the keys to the kingdom.
2.  **Copy the Query:** Don't write GraphQL by hand; copy it from the Network tab.
3.  **Loop the Cursor:** Pagination is standardized and easy to loop.
4.  **Extract:** Enjoy your perfectly structured, type-safe JSON data.

***

*Have you ever found exposed private data via GraphQL introspection? Share your war stories (anonymously!) in the comments. 👇*