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

## The Ruby Implementation

You don't need to write the bit-shifting logic yourself. There is a great gem called [snowflaked](https://github.com/luizkowalski/snowflaked).

Add it to your `Gemfile`:
```ruby
gem 'snowflaked'
```

You can now generate an ID anywhere in Ruby:
```ruby
Snowflaked.id
# => 1782345678912345678 (A clean, big integer)
```

## The Primary Key in Rails

Now all the models automatically generate a Snowflake ID for the :id attribute.
```
User.create!
# => #<User id: 7193489234823847936>
```
You can also define additional Snowflake columns in migrations:

```ruby
class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.snowflake :external_id
      t.bigint    :uid
    end
  end
end
```

Columns created with t.snowflake are automatically detected and will have Snowflake IDs generated for them.

## SQLite Warning

SQLite does not support column comments, which Snowflaked uses to auto-detect snowflake columns other than :id. When using SQLite, you must explicitly declare snowflake columns using the snowflake_id helper in your model.

If you want to generate Snowflake IDs for additional columns, you can do so by using the snowflake_id method, without having to migrate the table:

```ruby
class User < ApplicationRecord
  snowflake_id :uid
end
```

It is also possible to disable automatic :id generation by passing id: false to the snowflake_id method:

```ruby
class Post < ApplicationRecord
  snowflake_id id: false
end
```

Or generate Snowflake IDs for other columns but not :id:

```ruby
class Post < ApplicationRecord
  snowflake_id :external_id, id: false
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
