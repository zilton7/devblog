---
title: "Building a World-Class Search Engine in Rails with Searchkick"
categories: selfnote
tags: [rails, elasticsearch, ruby, tutorial]
image:
 path: /assets/images/2026-04-11-Building-A-World-Class-Search-Engine-In-Rails-With-Searchkick/feature.webp
---

# Stop Using SQL LIKE: A Step-by-Step Guide to Elasticsearch in Rails

When you build a standard Rails app, searching your database usually starts with a simple ActiveRecord query: `Product.where("name ILIKE ?", "%#{params[:q]}%")`. 

This works fine when you have 100 products. But when you have 100,000 products, it gets very slow. Even worse, if a user searches for "iphne" instead of "iphone", your database returns zero results. Users expect Google-level search with auto-complete and typo forgiveness. Postgres can do basic Full Text Search, but setting it up perfectly is painful.

This is where **Elasticsearch** comes in. 

Elasticsearch is essentially a secondary, NoSQL database completely optimized for searching text. Integrating it with Rails sounds intimidating, but thanks to an amazing gem called **Searchkick**, you can build enterprise-grade search in about 10 minutes.

Here is the step-by-step guide to adding Elasticsearch to your Rails app without losing your mind.

## STEP 1: The Setup

First off, you need Elasticsearch running on your computer. The absolute easiest way to do this without messing up your Mac or Linux machine is to use Docker. Run this in your terminal to start a local server:

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.13.0
```

Now, let's add the gems to your Rails app. We need the official client and the Searchkick wrapper.

```ruby
# Gemfile
gem 'elasticsearch'
gem 'searchkick'
```

Run `bundle install`.

## STEP 2: Tell Your Model to Listen

Elasticsearch does not magically read your Postgres database. It is a separate engine. We need to tell our Rails model to sync its data to Elasticsearch.

Open your model (let's use a `Product` model) and add one word:

```ruby
# app/models/product.rb
class Product < ApplicationRecord
  searchkick
end
```

That's it. From now on, whenever you `create`, `update`, or `destroy` a Product, Searchkick will automatically send a background request to Elasticsearch to keep the search index perfectly in sync with your database.

## STEP 3: Index Your Existing Data

Because you just added the gem, Elasticsearch is currently empty. It doesn't know about the products you created yesterday. 

You need to push your existing database records into Elasticsearch. Open your Rails console (`rails c`) and run:

```ruby
Product.reindex
```

You will see a progress bar as Searchkick grabs all your products and sends them to the search engine. Anytime you make massive database changes (like a raw SQL bulk update), you should run this command.

## STEP 4: The Search Query

Now for the fun part. Let's replace that ugly `ILIKE` query in our controller. 

Searchkick gives us a `.search` method that feels just like ActiveRecord, but it queries Elasticsearch instead of Postgres.

```ruby
# app/controllers/products_controller.rb
class ProductsController < ApplicationController
  def index
    query = params[:q].presence || "*"
    
    @products = Product.search(query, 
      fields: [:name, :description],
      match: :word_start,
      misspellings: { edit_distance: 2 }
    )
  end
end
```

Look at how powerful this is:
*   `fields:` We tell it to only look at the name and description.
*   `match: :word_start` allows for auto-complete. If they type "lap", it matches "laptop".
*   `misspellings:` This is the magic. If they type "lpatop", Elasticsearch knows they meant "laptop" because the "edit distance" (number of wrong letters) is within our limit.

## STEP 5: Customizing the Index (The Pro Move)

By default, Searchkick sends every single column of your database to Elasticsearch. If you have a `secret_cost` column or a `user_password` column, you absolutely do not want that in your search index. 

You should always control exactly what data gets indexed. You do this by overriding the `search_data` method in your model.

```ruby
# app/models/product.rb
class Product < ApplicationRecord
  searchkick

  belongs_to :category

  def search_data
    {
      name: name,
      description: description,
      price: price,
      # We can even index associated data!
      category_name: category.name,
      in_stock: stock_count > 0
    }
  end
end
```

Now, when you run `Product.reindex`, only this specific JSON block is sent to Elasticsearch. Because we included `category.name`, users can now type "Electronics" in the search bar, and it will return the products belonging to that category, without doing any complex SQL `JOIN` queries.

## Summary

That's pretty much it. Adding Elasticsearch used to require hundreds of lines of configuration and complex JSON mapping files. 

With `Searchkick`, the workflow is incredibly simple:
1. Add the gem.
2. Add `searchkick` to your model.
3. Run `Model.reindex`.
4. Use `Model.search("query")`.

If your app relies heavily on user discovery - like an e-commerce store, a directory, or a massive blog-ditching SQL for a dedicated search engine is the biggest UX upgrade you can make.