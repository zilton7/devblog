---
title: "How to Use ActiveRecord Without Rails"
categories: selfnote
tags: [ruby, activerecord, database, tutorial]
image:
 path: /assets/images/2026-03-20-How-To-Use-Activerecord-Without-Rails/feature.webp
---

Very often I find myself writing small Ruby scripts to scrape data, process CSV files, or build a tiny Sinatra API. In these situations, generating a massive Rails application with ActionMailer, ActionCable, and Webpack is just overkill.

But at the same time, I really don't want to write raw SQL queries by hand. I want the magic of ActiveRecord (`User.where(active: true)`), just without the heavy Rails framework attached to it.

The good news is that Rails is basically just a collection of independent gems. You can completely rip ActiveRecord out of Rails and use it in a plain Ruby script. It only takes a few steps.

## STEP 1: The Dependencies
First off, let's create a new directory for our script and create a `Gemfile`. We only need two gems: ActiveRecord itself, and a database adapter (I will use SQLite for this example to keep it simple).

```ruby
# Gemfile
source 'https://rubygems.org'

gem 'activerecord'
gem 'sqlite3'
```

Run `bundle install` in your terminal.

## STEP 2: The Connection
Create a new file called `script.rb`. The first thing we need to do is require our gems and tell ActiveRecord how to connect to our database.

```ruby
# script.rb
require 'active_record'
require 'sqlite3'

# This connects to a local SQLite file, or creates it if it doesn't exist
ActiveRecord::Base.establish_connection(
  adapter: 'sqlite3',
  database: 'my_database.sqlite3'
)
```

## STEP 3: The Database Schema
In a normal Rails app, we use `rails db:migrate` from the terminal to create our tables. Without Rails, we don't have those terminal commands by default. 

The easiest way to create tables for a standalone script is to use `ActiveRecord::Schema.define` directly inside our code.

Add this right below your connection:

```ruby
# script.rb
ActiveRecord::Schema.define do
  # force: true will drop the table if it already exists, 
  # which is great for testing small scripts!
  create_table :users, force: true do |t|
    t.string :name
    t.string :email
    t.timestamps
  end
end
```

## STEP 4: The Model
Now that we have a database and a table, we just create a standard Ruby class and inherit from `ActiveRecord::Base`. This is exactly how it looks in Rails.

```ruby
# script.rb
class User < ActiveRecord::Base
  validates :name, presence: true
  validates :email, uniqueness: true
end
```

## STEP 5: Using It
That's pretty much it. Now you can use all the ActiveRecord magic you are used to. You can create records, query them, and update them.

Let's add some test code to the bottom of our file:

```ruby
# script.rb

# 1. Create a user
User.create(name: 'Zil', email: 'zil@example.com')
User.create(name: 'John', email: 'john@example.com')

# 2. Query the database
puts "Total users: #{User.count}"

zil = User.find_by(name: 'Zil')
puts "Found user email: #{zil.email}"

# 3. Use validations
bad_user = User.new(email: 'no_name@example.com')
if bad_user.save
  puts "Saved!"
else
  puts "Failed to save: #{bad_user.errors.full_messages}"
end
```

Running the Script
Go to your terminal and run the script just like any normal Ruby file:

```bash
ruby script.rb
```

You will see the output in your terminal, and you will notice a new file in your folder called `my_database.sqlite3`. All your data is safely saved there.

Why I like this approach?
Understanding how to do this makes you a much better Rails developer. It removes the "magic" and shows you that ActiveRecord is just a Ruby library. 

Next time you need to build a Telegram bot, a web scraper, or a background worker, you don't need to load the entire Rails framework. You just need a connection, a schema, and a model.