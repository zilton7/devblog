---
title: "How to Fix N+1 Queries in Rails Like a Pro"
categories: selfnote
tags: [rails, ruby, activerecord, performance]
image:
 path: /assets/images/2026-04-12-How-To-Fix-N-1-Queries-In-Rails-Like-A-Pro/feature.webp
---

There are Rails applications that run incredibly fast on a developer's laptop, but the moment they are deployed to production, they crawl to a halt. The pages take 3 seconds to load, and the database CPU is at 100%.

Almost every single time, the culprit is the exact same thing: **The N+1 Query Problem.**

ActiveRecord is amazing because it hides the complex SQL from you. But because it is so easy to use, it is also very easy to accidentally hammer your database with hundreds of unnecessary queries. 

Here is exactly what the N+1 problem is, how to fix it using `.includes`, and how to handle complex nested data like a senior Rails developer.

## The Problem: What is N+1?

Imagine you have a `Post` model and a `User` model (the author). You want to list 50 posts on your homepage and show the author's name next to each one.

You write this in your controller:

```ruby
# app/controllers/posts_controller.rb
def index
  @posts = Post.limit(50)
end
```

And you write this in your view:

```erb
<!-- app/views/posts/index.html.erb -->
<% @posts.each do |post| %>
  <h2><%= post.title %></h2>
  <p>By: <%= post.user.name %></p>
<% end %>
```

This looks perfectly fine. But if you look at your terminal logs, you will see a nightmare. 

1. Rails runs **1 query** to fetch the 50 posts.
2. Then, as it loops through the HTML, it hits `post.user.name`. It doesn't have the user data in memory, so it asks the database: *"Hey, get me the user for post 1."*
3. Then it asks: *"Get me the user for post 2."*
4. It does this 50 times.

You just ran **51 queries** to load a single webpage. If you have 1,000 posts, you run 1,001 queries. This is the N+1 problem.

## LEVEL 1: The Basic Fix (`includes`)

To fix this, we need to tell ActiveRecord to fetch all the related data *before* we start looping in the view. We do this using **Eager Loading** via the `.includes` method.

Change your controller to this:

```ruby
# app/controllers/posts_controller.rb
def index
  # We tell Rails: "Fetch the posts, AND fetch their users right now."
  @posts = Post.includes(:user).limit(50)
end
```

Now, look at your server logs. Rails will only run **2 queries**:
1. `SELECT * FROM posts LIMIT 50`
2. `SELECT * FROM users WHERE id IN (1, 2, 3, 4...)`

Rails grabs all 50 users in one big query, and stitches them together in memory. The speed difference is massive.

## LEVEL 2: Nested Includes (Going Deeper)

What if your data is more complex? 
Let's say you want to show the Post, the User's name, the User's Profile picture, AND a list of all the Comments on the post.

If you just do `.includes(:user)`, the comments and the profile will still trigger N+1 queries. You have to pass a **Hash** to `.includes` to load nested relationships.

```ruby
def index
  @posts = Post.includes(
    comments: :author,    # Loads comments, AND the author of each comment
    user: :profile        # Loads the post user, AND the user's profile
  ).limit(50)
end
```

Using arrays and hashes, you can build a perfectly optimized data tree with a single line of code.

## LEVEL 3: includes vs preload vs eager_load (The Pro Stuff)

When you use `.includes`, Rails does something very clever. It looks at your query and decides the best way to fetch the data. But as you get more advanced, you should know exactly what is happening under the hood. 

ActiveRecord actually has three different methods for eager loading:

**1. `.preload` (The Default)**
This is what `.includes` usually does behind the scenes. It ALWAYS runs two separate queries. 
`SELECT * FROM posts` and then `SELECT * FROM users WHERE id IN (...)`. 
It is very fast and uses less memory. But, you **cannot** use a `where` clause on the preloaded table. If you try `Post.preload(:user).where(users: { active: true })`, your app will crash.

**2. `.eager_load` (The Giant Join)**
This forces Rails to use a `LEFT OUTER JOIN`. It grabs all the posts and all the users in **one single, massive query**. 
You use this when you specifically need to filter by the associated table:
`Post.eager_load(:user).where(users: { active: true })`

**3. `.includes` (The Smart Manager)**
`.includes` is the safe middle ground. By default, it acts like `.preload`. But if Rails sees that you added a `.where` referencing the joined table, it automatically switches to acting like `.eager_load`. 

*Rule of thumb:* Just stick to `.includes` 90% of the time, and let Rails do the thinking.

## LEVEL 4: Strict Loading (The Ultimate Safety Net)

Even senior developers accidentally introduce N+1 queries. You might add a new helper method in a view months later and forget to update the controller's `.includes`.

To prevent this from ever reaching production, modern Rails has a feature called **Strict Loading**.

If you turn this on, Rails will literally crash your app (raise an error) the moment it detects an N+1 query. It forces you to fix it immediately.

You can do this on a single record:
```ruby
@post = Post.strict_loading.first
@post.user # => Raises ActiveRecord::StrictLoadingViolationError!
```

Or, you can do what I do and turn it on globally for your `development` and `test` environments. 

```ruby
# config/environments/development.rb
config.active_record.strict_loading_by_default = true
```

Now, you can never accidentally write a view that triggers an N+1 query without your local server screaming at you to add `.includes`. It is the best performance habit you can build.

## Summary

ActiveRecord makes database interactions feel like magic, but you always have to pay attention to the logs. 

1. Check your terminal. If you see the same `SELECT` statement repeating 50 times in a row, you have an N+1 problem.
2. Use `.includes` in your controller to fetch the data upfront.
3. Use Hashes for deeply nested associations.
4. Turn on `strict_loading` in development to catch the bugs before your users do.

That's pretty much it. Fixing N+1 queries is usually the easiest way to make a slow Rails app feel 10x faster.