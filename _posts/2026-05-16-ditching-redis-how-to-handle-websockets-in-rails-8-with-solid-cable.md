---
title: "Ditching Redis: How to Handle WebSockets in Rails 8 with Solid Cable"
categories: selfnote
tags: [rails, webdev, hotwire, architecture]
image:
 path: /assets/images/2026-05-16-Ditching-Redis-How-To-Handle-Websockets-In-Rails-8-With-Solid-Cable/feature.webp
---

# Real-Time Rails Without Redis: A Guide to Solid Cable

For years, adding a single real-time feature to a Rails app felt like signing a deal with the devil. 

You just wanted a simple notification bell to update without a page refresh, or a basic live chat. But the moment you decided to use ActionCable, you had to invite a completely new piece of infrastructure into your stack: **Redis**.

Managing Redis meant paying for another server, monitoring its memory usage, and ensuring your production environment was wired up correctly. For a solo developer trying to keep costs and complexity low, it was a massive headache.

In Rails 8, the "One-Person Framework" philosophy struck again. DHH and the Rails team decided that requiring Redis just for basic WebSockets was a mistake. 

Enter **Solid Cable**.

Solid Cable replaces Redis by using your existing SQL database (PostgreSQL, MySQL, or SQLite) as the Pub/Sub backend for ActionCable. Here is how it works, and how to set it up in 3 simple steps.

## The Mental Model: How can a Database handle WebSockets?

When you hear "Database-backed WebSockets," your first instinct as an engineer is probably panic. *"Won't polling the database 50 times a second completely crash my Postgres server?"*

A decade ago, the answer was yes. But hardware has evolved. 

Today's servers run on blazing-fast NVMe SSDs. Furthermore, Solid Cable is incredibly optimized. It doesn't do dumb, heavy table scans. It keeps messages in a lightweight table and uses an efficient pruning mechanism to delete old messages immediately after they are broadcasted. 

Unless you are building the next WhatsApp or a high-frequency trading platform, your standard PostgreSQL database (or even SQLite in WAL mode) can handle thousands of concurrent WebSocket connections without breaking a sweat.

## STEP 1: Installation and Database Setup

If you generate a brand new Rails 8 app, Solid Cable is already included. But if you are upgrading an older app or adding it manually, here is the process.

Add the gem to your `Gemfile`:
```ruby
gem "solid_cable"
```
Run `bundle install`.

Next, we need to create the table where Solid Cable will temporarily hold the WebSocket messages. Run the installation generator:

```bash
bin/rails solid_cable:install
```

This generates a configuration file and a database migration. Apply the migration:
```bash
bin/rails db:migrate
```

*Note: Just like Solid Queue, Rails 8 encourages keeping this table in a separate database file or logical database (e.g., `cable` instead of `primary`) to keep your main application data isolated from the heavy read/write load of WebSockets.*

## STEP 2: The Configuration (`cable.yml`)

Now we need to tell ActionCable to stop looking for Redis and start using our database. 

Open your `config/cable.yml` file. You will see different environments. Update your `production` (and `development` if you want to test it locally) to use the new adapter:

```yaml
# config/cable.yml
development:
  adapter: solid_cable
  polling_interval: 0.1.seconds
  message_retention: 1.day

test:
  adapter: test

production:
  adapter: solid_cable
  polling_interval: 0.1.seconds
  message_retention: 1.day
```

That is literally it for the infrastructure. You have successfully deleted Redis from your application. 

## STEP 3: Using It (The Code Stays the Same!)

The absolute best part about Solid Cable is that it is just a backend adapter. Your frontend and backend Ruby code **do not change at all**. You still use the exact same Hotwire and Turbo Stream methods you already know.

Let's say we have a `Comment` model, and we want it to show up on the user's screen in real-time.

In the View, we listen to a channel:
```erb
<!-- app/views/posts/show.html.erb -->
<%= turbo_stream_from @post, "comments" %>

<div id="comments_list">
  <%= render @post.comments %>
</div>
```

In the Model, we tell it to broadcast:
```ruby
# app/models/comment.rb
class Comment < ApplicationRecord
  belongs_to :post

  # When a comment is created, send the HTML over Solid Cable!
  after_create_commit -> { 
    broadcast_append_to post, "comments", 
    target: "comments_list", 
    partial: "comments/comment" 
  }
end
```

Behind the scenes, when `broadcast_append_to` is called, Rails writes a fast row to the `solid_cable_messages` database table. The Solid Cable worker instantly picks it up, pushes it through the WebSocket connection to the browser, and then cleans up the database row.

## Summary

The entire Rails 8 era is defined by one word: **Consolidation**. 

We got rid of Webpack by using Importmaps. We got rid of Node.js for frontend building. We got rid of Redis for background jobs with Solid Queue. And now, we have gotten rid of Redis for WebSockets with Solid Cable.

Your entire production stack can now consist of exactly two things:
1. A Linux Server (Running Docker/Kamal).
2. A Database.

By eliminating complex infrastructure, you free up your mental bandwidth to do the only thing that actually matters: building a product that people want to pay for.