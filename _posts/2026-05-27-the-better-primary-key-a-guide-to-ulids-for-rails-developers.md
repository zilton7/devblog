---
title: "The Better Primary Key: A Guide to ULIDs for Rails Developers"
categories: selfnote
tags: [rails, ruby, database, webdev]
image:
 path: /assets/images/2026-05-27-The-Better-Primary-Key-A-Guide-To-Ulids-For-Rails-Developers/feature.webp
---

In a previous article, I talked about **Snowflake IDs**. They are great, but they require a bit of configuration because you need to manage "Worker IDs." 

If you want something simpler that gives you the same benefits - secure URLs and fast database sorting-you should look at **ULIDs** (Universally Unique Lexicographically Sortable Identifiers).

## Why not just use UUIDs?

Most developers switch from auto-incrementing integers to **UUIDs** because they want to hide their business volume. If your order ID is `order/550e8400-e29b...`, no one knows if you have 1 customer or 1 million.

But UUIDs have a major problem: **they are completely random.** 
When you insert millions of random UUIDs into a database, the "B-Tree" index gets fragmented and slow. Your database has to jump all over the hard drive to find where to put the new data.

**ULIDs fix this.**
A ULID is 128 bits (just like a UUID), but the first part of the ID is a **timestamp**. This means ULIDs are chronological. They are unique like a UUID, but they sort like an Integer.

Here is how to implement ULIDs in your Rails 8 app in 4 easy steps.

## STEP 1: Install the Gem

We will use the `ulid` gem to generate the strings. Add this to your Gemfile:

```ruby
gem "ulid"
```
Run `bundle install` in your terminal.

## STEP 2: The ULID Concern

We want to make it very easy to add ULIDs to any model. The best way to do this is with a **Concern**. This code will ensure that every time we create a new record, a ULID is generated and assigned to the ID.

Create a new file at `app/models/concerns/has_ulid.rb`:

```ruby
# app/models/concerns/has_ulid.rb
module HasUlid
  extend ActiveSupport::Concern

  included do
    # Before we save to the DB, generate the ULID
    before_create :set_ulid
  end

  private

  def set_ulid
    # ULID.generate creates a string like: 01ARZ3NDEKTSV4RRFFQ69G5FAV
    self.id ||= ULID.generate
  end
end
```

## STEP 3: The Migration

When you create a new model, you need to tell Rails that the `id` is a `string`, and you must disable the default auto-increment logic.

```bash
rails g model Product name:string
```

Open the migration file and modify it like this:

```ruby
# db/migrate/XXXXXXXXXXXXXX_create_products.rb
class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    # id: false stops the automatic integer ID
    create_table :products, id: false do |t|
      # We use string for ULID primary key
      t.string :id, primary_key: true
      t.string :name

      t.timestamps
    end
  end
end
```

## STEP 4: Update the Model

Now, just include the concern we wrote in Step 2.

```ruby
# app/models/product.rb
class Product < ApplicationRecord
  include HasUlid
end
```

## STEP 5: See it in action

Open your Rails console (`bin/rails c`) and create a few products:

```ruby
Product.create(name: "Laptop")
Product.create(name: "Monitor")
Product.create(name: "Keyboard")

# Check the IDs
Product.pluck(:id)
# => ["01HQV...", "01HQV...", "01HQV..."]
```

If you look closely, the IDs all start with the same characters because they were created in the same minute. Because they are sortable, you can still run `Product.order(:id)` and they will be in the correct chronological order!

## Why I like ULIDs for Rails

1. **Better Performance:** Because the IDs are sortable, PostgreSQL (or SQLite) can append them to the end of the index. This is much faster for "Write-Heavy" apps than random UUIDs.
2. **Readability:** ULIDs use a special alphabet (Crockford's Base32) that excludes confusing letters like "I", "L", and "O". This makes them easier to read if a user has to type one in.
3. **No Setup:** Unlike Snowflake IDs, you don't need to configure server IDs or worker nodes. You just install the gem and go.

That's pretty much it. It’s a small architectural change that makes your app feel much more professional and scalable.