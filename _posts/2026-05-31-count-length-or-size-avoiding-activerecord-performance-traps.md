---
title: "Count, Length, or Size? Avoiding ActiveRecord Performance Traps"
categories: selfnote
tags: [rails, ruby, activerecord, performance]
image:
 path: /assets/images/2026-05-31-Count-Length-Or-Size-Avoiding-Activerecord-Performance-Traps/feature.webp
---

I remember when I first started with Rails, I thought `.count`, `.length`, and `.size` were exactly the same thing. I used them interchangeably in my views and controllers. If I wanted to know how many users were in the database, I would just pick one and move on.

But then, as my app grew and I started checking my server logs, I realized I was making a huge performance mistake. While these three methods look identical, they behave completely differently under the hood. One of them hits your database every single time, one of them might crash your server’s memory, and one of them is "smart" enough to choose the best path.

Here is the breakdown of when to use which so you can keep your Rails app fast.

## 1. `.count` (The Database Hitter)

When you call `.count`, ActiveRecord ignores any records you might already have loaded in memory. It goes straight to the database and runs a specific SQL query: `SELECT COUNT(*) FROM users`.

```ruby
users = User.where(active: true)
users.count # SQL: SELECT COUNT(*) FROM users WHERE active = true
```

**When to use it:** Use this when you *only* need the number and you have no intention of using the actual data.
**The Trap:** If you call `.count` and then immediately loop through the records with `.each`, you are doing double work. You hit the DB for the count, and then you hit it again to get the users.

## 2. `.length` (The Memory Loader)

Calling `.length` is the equivalent of saying: "Give me everything." 

ActiveRecord will fetch every single column for every single record in that query and load them all into your computer's RAM. Only after everything is loaded does it count how many items are in the array.

```ruby
users = User.where(active: true)
users.length # SQL: SELECT * FROM users WHERE active = true
# Every user object is now sitting in your RAM.
```

**When to use it:** Use this only if you have **already** loaded the records (for example, if you already called `@users.to_a`).
**The Trap:** If you have 100,000 users and you just want to show a number in the navbar, calling `.length` will try to load all 100,000 users at once. This is the fastest way to get an "Out of Memory" error and crash your production server.

## 3. `.size` (The "Smart" Manager)

This is the method I recommend for 90% of use cases. It is the "omakase" choice because it adapts to the situation.

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

**When to use it:** This should be your **default** choice. It protects you from making mistakes in your views and ensures you aren't hammering the database with redundant queries.

## Summary: The Decision Matrix

| Method | Behavior | Best for... |
| :--- | :--- | :--- |
| **`.count`** | Always runs `SELECT COUNT(*)` | One-off checks when you don't need the data. |
| **`.length`** | Always runs `SELECT *` | When data is already loaded in an array. |
| **`.size`** | **Smart:** Choice depends on state | Almost everything. It’s the safest default. |

As a solo developer, you want to spend your time building features, not debugging slow database queries. Switching your habit from `.count` to `.size` is a 1-second change that can save you a lot of headache in the future.