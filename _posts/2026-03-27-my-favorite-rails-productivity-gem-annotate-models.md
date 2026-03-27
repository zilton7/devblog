---
title: "My Favorite Rails Productivity Gem: annotate_models"
categories: selfnote
tags: [ruby, rails, productivity, gems]
image:
 path: /assets/images/2026-03-27-My-Favorite-Rails-Productivity-Gem-Annotate-Models/feature.webp
---

Very often I find myself working inside a Rails model, and I need to write a validation or a custom method. But I suddenly forget the exact name of my database column. Is it `first_name` or just `name`? Is the status an `integer` or a `string`?

Usually, to find this out, you have to open your `db/schema.rb` file, search for the table, and read the columns. It is not too hard to do it, but when you do it 50 times a day, it gets very annoying.

This is where the **annotate_models** (usually just called `annotate`) gem comes in. It is one of the first gems I add to any new Rails project. It automatically writes a commented-out summary of your database table right inside your model file.

Here is how to set it up and use it in 3 easy steps.

## STEP 1: Installation

First off, let's install the gem. We only need this in our development environment, because it just generates text comments for us developers to read. It doesn't do anything in production.

Add the following to your Gemfile:

```ruby
group :development do
  gem 'annotate'
end
```

and run `bundle install` in your terminal.

## STEP 2: The Magic Command

Once the gem is installed, you can annotate your models manually by running this simple command in your terminal:

```bash
bundle exec annotate
```

What does this do? It looks at your database and updates your model files. 
Before running the command, your `User` model might look like this:

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_many :posts
end
```

After running `annotate`, the gem modifies the file to look like this:

```ruby
# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  name       :string
#  email      :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class User < ApplicationRecord
  has_many :posts
end
```

Now, every time you open your model, you can instantly see exactly what columns you have, what type they are, and if they have any limits or defaults.

## STEP 3: Automate It (Auto-Annotate)

Running `bundle exec annotate` manually every time you create a new migration is easy to forget. It is much better to make Rails do it automatically.

To set up auto-annotation, run this generator command in your terminal:

```bash
rails g annotate:install
```

This creates a new file at `lib/tasks/auto_annotate_models.rake`. 

Inside this file, you can configure exactly how you want the gem to behave. For example, I prefer my annotations at the very top of the file. You can find the `position_in_class` setting in that rake file and change it:

```ruby
# lib/tasks/auto_annotate_models.rake
'position_in_class' => 'top', # You can change this to 'bottom' if you prefer
```

**The best part:** Because we ran the install generator, the annotate gem now hooks into ActiveRecord migrations automatically. 

From now on, whenever you run:
```bash
rails db:migrate
```
...or...
```bash
rails db:rollback
```

Rails will automatically run the annotate gem in the background and update all your model comments to match your new database schema. 

## Bonus: It does more than just Models

If you look at the generated `.rake` file, you will see that `annotate` doesn't just work on models. By default, it will also add these helpful schema comments to your:
*   RSpec/Minitest test files
*   FactoryBot factories
*   Model routing files

That's pretty much it. Adding the `annotate` gem takes about 2 minutes, but it will save you hours of context-switching and searching through your `schema.rb` file. It is a massive productivity boost for any Rails developer.