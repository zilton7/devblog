---
title: "Stripe-Style IDs in Rails: A Guide to the custom_id Gem"
categories: selfnote
tags: [rails, ruby, security, database]
image:
 path: /assets/images/2026-06-09-Stripe-Style-Ids-In-Rails-A-Guide-To-The-Make-Id-Gem/feature.webp
---

If you have ever used the Stripe API, you’ve noticed their IDs look awesome. Instead of a random number or a long, confusing UUID, they look like this: `cus_M1p7abc123` or `ch_3Oixyz456`.

These are called **Prefixed IDs**. They are great for two reasons:
1.  **Context:** When you see `inv_...` in your logs, you immediately know it’s an Invoice without looking at the table name.
2.  **Security:** It hides your business volume. Hackers can't guess that your next user is ID 501.

In the past, setting this up in Rails required a lot of custom code in your models. But recently, I found a gem that makes this process incredibly simple: **[custom_id](https://github.com/pniemczyk/custom_id)**.

Here is how to implement professional, Stripe-style IDs in your Rails 8 app in 4 steps.

## STEP 1: Install the Gem

Add the gem to your Gemfile:

```ruby
gem "custom_id"
```
Run  in your terminal 
```
bundle install
rails custom_id:install
```

## STEP 2: The Migration

Just like with ULIDs or Snowflake IDs, we need to tell the database that our primary key is a `string` and not an `integer`.

```bash
rails g model Project name:string
```

Open the migration file and disable the automatic ID:

```ruby
# db/migrate/XXXXXXXXXXXXXX_create_projects.rb
class CreateProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :projects, id: false do |t|
      # We use string for the prefixed ID
      t.string :id, primary_key: true
      t.string :name
      t.timestamps
    end
  end
end
```

## STEP 3: Configure the Model

This is where the gem shines. You just use the `custom_id` macro. You tell it what prefix you want to use, and it handles the rest.

```ruby
# app/models/project.rb
class Project < ApplicationRecord
  # This tells the gem to generate an ID starting with 'prj_'
  cid "usr"
end
```

By default, the gem uses a collision-resistant loop with database uniqueness check.

## STEP 4: Seeing it in Action

Open your Rails console (`bin/rails c`) and create a project:

```ruby
project = Project.create(name: "Cloud Empire")

puts project.id
# => "prj_7k2n9zp1m5r8"
```

It looks professional, it’s easy to read in your logs, and it’s perfectly unique.

## Advanced: Customizing your IDs

The `custom_id` gem is very flexible. You can change the length of the random part if you have a massive amount of data and want to avoid collisions.

```ruby
class User < ApplicationRecord
  # Use a 3-letter prefix and a longer 20-character random string
  cid :usr, size: 32
end
```

## Why I prefer this over UUIDs?

I love UUIDs for their uniqueness, but I hate how they look in URLs. 
`/users/550e8400-e29b-41d4-a716-446655440000` is ugly and hard to double-click and copy.

`/users/usr_7k2n9zp1m5r8` is clean, tells me exactly what the object is, and fits perfectly in a mobile app UI or a support email.

## Summary

The `custom_id` gem is a "Quality of Life" improvement for Rails developers. It takes an enterprise-level feature (Prefixed IDs) and turns it into a one-line setup.

1.  **Install** the gem.
2.  Set your primary key to **string**.
3.  Add **`cid 'prefix'`** to your model.

It’s a tiny change that makes your Rails monolith feel significantly more polished and "pro."
