---
title: "A Beginner's Guide to ClickHouse in Ruby on Rails"
categories: selfnote
tags: [rails, database, analytics, clickhouse]
image:
 path: /assets/images/2026-03-28-A-Beginner-S-Guide-To-Clickhouse-In-Ruby-On-Rails/feature.webp
---

When you build a standard Rails app, PostgreSQL (or MySQL) is your best friend. It handles your users, your posts, and your billing perfectly. 

But what happens when you want to track analytics? Let's say you want to track every single time a user clicks a button, views a page, or triggers an API event. Very quickly, you will have millions (or billions) of rows. 

If you try to run `Event.where(action: 'click').count` on a PostgreSQL table with 50 million rows, your database will choke, your app will slow down, and your users will get annoyed.

This is where **ClickHouse** comes in. 

## What is ClickHouse and Why Use It?

ClickHouse is an open-source database specifically built for analytics. It is ridiculously fast. Queries that take 30 seconds in Postgres can take 0.05 seconds in ClickHouse.

How does it do this? **It stores data by Columns, not by Rows.**

*   **Postgres (Row-based):** If you ask Postgres to sum up the `price` of all orders, it pulls every single order row from the hard drive, looks at the price, and adds it up. It loads a lot of unnecessary data into memory.
*   **ClickHouse (Column-based):** ClickHouse stores all the `prices` together in one tight file. If you ask it to sum the prices, it grabs just that one file and does the math instantly.

**Important Note:** You do NOT replace Postgres with ClickHouse. You use them together. Postgres is for your core app data (which needs frequent updates). ClickHouse is for "append-only" data like logs, events, and analytics, where you just insert data and rarely update or delete it.

Here is how to set it up in your Rails app.

## STEP 1: The Gem

To make ClickHouse talk to Rails, we don't have to write raw SQL. We can use ActiveRecord! We just need a special database adapter.

Add this to your Gemfile:

```ruby
gem 'clickhouse-activerecord'
```

and run `bundle install`.

## STEP 2: Database Configuration

Next, we need to tell Rails how to connect to ClickHouse. We will use Rails' built-in multiple database support. 

Open your `config/database.yml` and add a new database connection alongside your primary one.

```yaml
# config/database.yml
default: &default
  adapter: postgresql
  # ... your normal postgres settings

development:
  primary:
    <<: *default
    database: my_app_development
  
  # Add the ClickHouse connection here
  clickhouse:
    adapter: clickhouse
    database: my_app_analytics_development
    host: localhost
    port: 8123
```

## STEP 3: Create a Base Model

We don't want our normal models (like `User`) saving to ClickHouse. We only want our analytics models to go there. 

To do this, we create a new Base class. All our ClickHouse models will inherit from this instead of `ApplicationRecord`.

Create a new file `app/models/clickhouse_record.rb`:

```ruby
class ClickhouseRecord < ActiveRecord::Base
  self.abstract_class = true

  # Tell Rails to send all queries for this class to the ClickHouse DB
  connects_to database: { writing: :clickhouse, reading: :clickhouse }
end
```

## STEP 4: Create your Analytics Model

Now let's say we want to track Page Views. We create a model that inherits from our new `ClickhouseRecord`.

```ruby
# app/models/page_view.rb
class PageView < ClickhouseRecord
  # ClickHouse tables don't usually have a standard 'id' primary key
  self.primary_key = 'date' 
end
```

*Note: You will need to create the actual table in ClickHouse. The `clickhouse-activerecord` gem does support Rails migrations, but the syntax is a bit different because ClickHouse uses different table engines (like `MergeTree`). You can read the gem's docs for the exact migration syntax.*

## STEP 5: Start Querying!

That's pretty much it. Now you can use standard ActiveRecord methods to query millions of rows in milliseconds.

You can insert data just like normal:

```ruby
PageView.create(
  user_id: 1, 
  path: '/pricing', 
  browser: 'Chrome', 
  created_at: Time.now
)
```

And you can query it extremely fast:

```ruby
# This will be blazing fast even with 100 million rows
chrome_users = PageView.where(browser: 'Chrome').count

# Grouping and aggregating is what ClickHouse does best
views_by_path = PageView.group(:path).count
```

## Summary

If your app is small, just stick to PostgreSQL. But the moment you start building dashboards, tracking user clicks, or storing massive amounts of API logs, standard databases will become your biggest bottleneck. 

Setting up ClickHouse alongside your Rails app takes a bit of work, but it completely solves the "too much data" problem. It lets you keep the nice ActiveRecord syntax while getting enterprise-level analytics speed.