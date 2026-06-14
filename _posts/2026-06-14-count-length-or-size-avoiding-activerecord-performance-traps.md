---
title: "Count, Length, or Size? Avoiding ActiveRecord Performance Traps"
categories: selfnote
tags: [rails, ruby, activerecord, performance]
image:
 path: /assets/images/2026-06-14-Count-Length-Or-Size-Avoiding-Activerecord-Performance-Traps/feature.webp
---

I remember when I first started with Rails, I thought `.count`, `.length`, and `.size` were exactly the same thing. I used them instead of each other in my views and controllers. If I wanted to know how many users were in the database, I would just pick one and move on.

But as my app grew and I started checking my server logs, I realized I was making a big performance mistake. While these three methods look the same, they work very differently under the hood. One hits your database every time, one might crash your server’s memory, and one is "smart" enough to choose the best way.

Here is the breakdown of when to use which so you can keep your Rails app fast.

## 1. `.count` (The Database Hitter)

When you call `.count`, ActiveRecord ignores any data you might already have loaded. It goes straight to the database and runs a SQL query: `SELECT COUNT(*) FROM users`.

```ruby
users = User.where(active: true)
users.count # SQL: SELECT COUNT(*) FROM users WHERE active = true
```

**When to use it:** Use this when you *only* need the number and you don't plan to use the actual records.
**The Trap:** If you call `.count` and then immediately loop through the records with `.each`, you are doing double work. You hit the DB for the count, and then you hit it again to load the users.

## 2. `.length` (The Memory Loader)

Calling `.length` is like saying: "Give me everything right now." 

ActiveRecord will fetch every single column for every record in that query and load them all into your computer's RAM. Only after everything is loaded does it count how many items are in the array.

```ruby
users = User.where(active: true)
users.length # SQL: SELECT * FROM users WHERE active = true
# Every user object is now sitting in your RAM.
```

**When to use it:** Use this only if you have **already** loaded the records (for example, if you already called `@users.to_a`).
**The Trap:** If you have 100,000 users and you just want to show a number in the navbar, calling `.length` will try to load all 100,000 users at once. This is the fastest way to get an "Out of Memory" error and crash your production server.

## 3. `.size` (The "Smart" Manager)

This is the method I recommend for 90% of cases. It is the "omakase" choice because it changes its behavior based on the situation.

*   If the records are **already loaded** in memory, it acts like `.length` (it just counts the items in the array without touching the database).
*   If the records are **not loaded**, it acts like `.count` (it runs the efficient `SELECT COUNT(*)` query).

```ruby
users = User.where(active: true)

# Records aren't loaded yet, so it runs a COUNT query
users.size 

# Later in the view...
users.each { |u| ... } # Data is loaded here

# Records are now loaded, so .size doesn't hit the DB again!
users.size 
```

**When to use it:** This should be your **default** choice. It protects you from making mistakes and ensures you aren't hammering the database with unnecessary queries.

## Summary: The Decision Matrix

| Method | What it does | Best for... |
| :--- | :--- | :--- |
| **`.count`** | Always runs `SELECT COUNT(*)` | Checking totals without using data. |
| **`.length`** | Always runs `SELECT *` | When data is already in an array. |
| **`.size`** | **Smart:** Depends on state | Safe default for almost everything. |

As a solo developer, you want to spend your time building features, not debugging slow database queries. Changing your habit from `.count` to `.size` is a tiny change that can save you a lot of headache as your database grows.