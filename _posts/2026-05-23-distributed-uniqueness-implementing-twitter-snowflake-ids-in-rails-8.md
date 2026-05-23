---
title: "Distributed Uniqueness: Implementing Twitter Snowflake IDs in Rails 8"
categories: selfnote
tags: [rails, ruby, database, architecture]
image:
 path: /assets/images/2026-05-23-Distributed-Uniqueness-Implementing-Twitter-Snowflake-Ids-In-Rails-8/feature.webp
---

When you run `rails generate model`, Rails defaults to using a standard auto-incrementing integer for your primary keys. Your first user is `ID: 1`, your second is `ID: 2`, and so on.

For a long time, this was fine. But as you grow, auto-incrementing IDs become a problem for two reasons:
1.  **Security:** A competitor can see you only have 500 orders by looking at the URL `/orders/500`. They can even "scrape" your entire database by just incrementing the ID in the URL.
2.  **Distributed Systems:** If you ever need to scale to multiple databases or allow offline creation (like in a mobile app), two different databases might try to assign `ID: 501` to different things at the same time.

Many developers switch to **UUIDs** to fix this. But UUIDs are huge, they are slow to index in Postgres, and they look ugly in URLs (`/users/550e8400-e29b-41d4-a716-446655440000`).

In 2026, the "Goldilocks" solution for the solo developer is the **Snowflake ID**.

## What is a Snowflake ID?

Originally created by Twitter, a Snowflake ID is a 64-bit integer that is **guaranteed to be unique** without needing a central "counter" in the database.

The magic is in how the 64 bits are broken down:
*   **41 bits** for a timestamp (gives you ~69 years of IDs).
*   **10 bits** for a "Worker ID" (identifies which server generated the ID).
*   **12 bits** for a sequence number (allows 4,096 IDs per millisecond, per server).

Because the first part of the ID is time, Snowflake IDs are **roughly time-ordered**. This makes them much faster for databases to index than random UUIDs.

## STEP 1: The Ruby Implementation

You don't need to write the bit-shifting logic yourself. There is a great, lightweight gem called `snowflake_id`.

Add it to your `Gemfile`:
```ruby
gem 'snowflake_id'
```

You can now generate an ID anywhere in Ruby:
```ruby
SnowflakeId.generator.next_id
# => 1782345678912345678 (A clean, big integer)
```

## STEP 2: Making it the Primary Key in Rails

To use Snowflake IDs as your primary keys, we need to tell Rails to stop using auto-increment and instead generate a Snowflake ID before saving the record.

First, create a **Concern** to make this reusable across all your models.

```ruby
# app/models/concerns/has_snowflake_id.rb
module HasSnowflakeId
  extend ActiveSupport::Concern

  included do
    # Set the ID before the record is created in the DB
    before_create :assign_snowflake_id
  end

  private

  def assign_snowflake_id
    self.id ||= SnowflakeId.generator.next_id
  end
end
```

## STEP 3: The Migration

When you generate a new model, you need to tell the migration *not* to use auto-increment.

```ruby
# db/migrate/20260101000000_create_posts.rb
class CreatePosts < ActiveRecord::Migration[8.0]
  def change
    # id: false stops the default auto-increment
    create_table :posts, id: false do |t|
      t.primary_key :id, :bigint, primary_key: true
      t.string :title
      t.timestamps
    end
  end
end
```

Then, in your model:
```ruby
class Post < ApplicationRecord
  include HasSnowflakeId
end
```

## Why this is a Win for Solo Devs

### 1. Cleaner URLs
Your URLs go from `/posts/123` (insecure) or `/posts/550e8400...` (ugly) to `/posts/4829104928172349`. It looks professional and hides your business volume from prying eyes.

### 2. Native Performance
Because it's just a `bigint` (a 64-bit integer), PostgreSQL handles it natively and extremely fast. It takes up half the space of a UUID, which keeps your database smaller and your backups faster.

### 3. Frontend Friendly
Since it’s just a number, JavaScript handles it easily (though be careful with very large numbers in JS - always return them as strings in your JSON API to avoid precision loss!).

## Summary

Snowflake IDs give you the best of both worlds: the distributed uniqueness of a UUID and the performance of an integer. 

If you are building a new Rails 8 app today, consider ditching auto-increment on day one. It’s one of those architectural choices that makes your app feel like a "real" enterprise product from the very first commit.