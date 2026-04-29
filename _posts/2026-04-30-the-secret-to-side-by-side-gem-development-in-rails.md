---
title: "The Secret to Side-by-Side Gem Development in Rails"
categories: selfnote
tags: [ruby, rails, gems, webdev]
image:
 path: /assets/images/2026-04-30-The-Secret-To-Side-By-Side-Gem-Development-In-Rails/feature.webp
---

# Stop Pushing to GitHub: How to Test Ruby Gems Locally

Very often I find myself writing a piece of code in a Rails app and thinking: *"I use this in all my projects. I should extract this into a Ruby Gem."*

Building a gem is a great way to clean up your codebase and contribute to open-source. But the first time you try to build one, the testing process feels awful. 

Most beginners write some code in their gem, push it to GitHub, go to their Rails app, run `bundle update my_gem`, restart the server, and see if it worked. If there is a typo, they have to do the whole 5-minute loop all over again.

You do not need to do this. You can develop your gem and your Rails app side-by-side on your local machine, and see your changes instantly. Here is exactly how to set it up.

## STEP 1: The Folder Structure

To keep things organized, both your gem and your Rails app should live in the same parent directory on your computer.

Open your terminal and create a new gem using Bundler's built-in generator:

```bash
bundle gem awesome_tool
```

This creates a folder called `awesome_tool` with all the boilerplate code you need for a gem. Next, go back to the parent folder and create a dummy Rails app to test it on:

```bash
rails new test_app
```

Now your folder structure looks like this:
*   `~/projects/awesome_tool` (Your Gem)
*   `~/projects/test_app` (Your Rails App)

## STEP 2: The Magic Link (`path`)

Now we need to tell our Rails app to use the local folder instead of downloading the gem from the internet.

Open the `Gemfile` inside your `test_app` and add this line:

```ruby
# test_app/Gemfile

gem 'awesome_tool', path: '../awesome_tool'
```

The `path:` option is the secret sauce. It tells Bundler to look in the neighboring folder on your hard drive. 

Run `bundle install` in your Rails app. You will see Bundler confirm that it is using the local source.

## STEP 3: Write Code in the Gem

Let's add a simple feature to our gem to make sure they are connected. 

Open the main file inside your gem directory (`awesome_tool/lib/awesome_tool.rb`) and write a simple method:

```ruby
# awesome_tool/lib/awesome_tool.rb
require_relative "awesome_tool/version"

module AwesomeTool
  def self.say_hello
    "Hello from the local gem!"
  end
end
```

## STEP 4: Test it in Rails

Go back to your `test_app` terminal and open the Rails console:

```bash
rails console
```

Type `AwesomeTool.say_hello`. It will output `"Hello from the local gem!"`. 

If you go back to your gem, change the text to `"Wow, this is fast!"`, and then restart your Rails console, the new text will be there instantly. No Git commits, no pushing to the internet. 

## STEP 5: The Pro Move (`bundle config`)

The `path:` trick is perfect when you are building a brand new gem from scratch. 

But what if you are contributing to a huge open-source gem (like `devise` or `sidekiq`)? You want to test your bug fix on your company's real Rails app. 
However, you **cannot** change the `Gemfile` to `path: '../devise'`, because if you accidentally commit that `Gemfile` to GitHub, you will break the app for all your coworkers!

For this, we use the `bundle config local` trick.

Leave your Rails `Gemfile` pointing to GitHub normally:
```ruby
# Gemfile
gem 'sidekiq', github: 'sidekiq/sidekiq'
```

Then, in your terminal, tell Bundler to *override* that specific gem locally on your computer:

```bash
bundle config local.sidekiq /Users/yourname/projects/sidekiq
```

Now, every time you run your Rails app, it will silently use your local folder instead of GitHub. Your `Gemfile` stays perfectly clean, so you can never accidentally commit a broken path to production. 

To turn this off when you are done testing, just run:
```bash
bundle config --delete local.sidekiq
```

## Summary

Building gems doesn't have to be a slow, frustrating process. 

1. Use `gem 'name', path: '../name'` for quick, brand new gems you are building yourself.
2. Use `bundle config local.name /path` when testing changes to established gems without messing up your team's `Gemfile`.

Extracting your complex logic into local gems is a fantastic way to clean up a messy Rails monolith, and this workflow makes it completely painless.