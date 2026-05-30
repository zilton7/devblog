---
title: "From ERB to Phlex: 5 Steps to Pure Ruby Views"
categories: selfnote
tags: [rails, ruby, frontend, performance]
image:
 path: /assets/images/2026-05-30-From-Erb-To-Phlex-5-Steps-To-Pure-Ruby-Views/feature.webp
---

I love Rails, but I’ve always found ERB to be a bit messy. You spend your whole day jumping between the "Backend" (clean Ruby code) and the "Frontend" (a mixture of HTML and weird `<% %>` tags). 

It is annoying to manage indentation, and if you make a typo inside an ERB tag, you usually don't find out until the page crashes in the browser. 

In 2026, many solo developers are moving to **Phlex**. Phlex is a view framework that lets you write your HTML in **Pure Ruby**. It is 10x faster than ERB and allows you to use standard Ruby tools (like Mixins and inheritance) to build your UI.

If you want to try it out, here is how to move from ERB to Phlex in 5 easy steps.

## STEP 1: Installation

First, add the gem to your project:

```ruby
bundle add phlex-rails
```

Then, run the generator to create the basic folder structure:

```bash
bin/rails g phlex:install
```

This creates an `app/views/layouts/application_view.rb` file which acts as the base for all your new views.

## STEP 2: The Mental Model (Syntax Translation)

Before we convert a file, you need to understand the translation. In Phlex, every HTML tag is just a Ruby method.

*   **ERB:** `<h1>Hello</h1>`
*   **Phlex:** `h1 { "Hello" }`

*   **ERB:** `<div class="container">...</div>`
*   **Phlex:** `div(class: "container") { ... }`

You don't need to worry about closing tags or escaping HTML. Ruby handles it all automatically.

## STEP 3: Converting a Simple Template

Let's take a standard "Show" page and convert it.

**The Old ERB (`app/views/posts/show.html.erb`):**
```erb
<div class="p-8">
  <h1><%= @post.title %></h1>
  <p><%= @post.body %></p>
  <%= link_to "Edit", edit_post_path(@post) %>
</div>
```

**The New Phlex View (`app/views/posts/show_view.rb`):**
```ruby
class Views::Posts::ShowView < ApplicationView
  def initialize(post:)
    @post = post
  end

  def view_template
    div(class: "p-8") do
      h1 { @post.title }
      p { @post.body }
      
      # You can still use Rails helpers!
      helpers.link_to "Edit", helpers.edit_post_path(@post)
    end
  end
end
```

## STEP 4: Handling Loops and Logic

The cool thing about Phlex is that loops are just... Ruby loops. You don't need special syntax.

```ruby
def view_template
  ul do
    @posts.each do |post|
      li { post.title }
    end
  end

  # Standard Ruby IF statement
  if @user.admin?
    button { "Delete Everything" }
  end
end
```

## STEP 5: Rendering from the Controller

Now that your view is a Ruby class, you need to tell your controller to use it. In Rails 8, this is very clean.

```ruby
# app/controllers/posts_controller.rb
def show
  @post = Post.find(params[:id])
  
  # Instead of 'render :show', we render the Ruby object
  render Views::Posts::ShowView.new(post: @post)
end
```

## Why is this better?

1.  **Speed:** Phlex doesn't have to "parse" a text file like ERB does. It just executes Ruby methods. It is incredibly fast.
2.  **Organization:** You can use Ruby **Modules** to share pieces of UI. No more messy partials.
3.  **Testing:** Since your view is a class, you can test it like a normal Ruby object without booting a whole browser.
4.  **No Context Switching:** You stay in "Ruby Mode" all day. Your brain doesn't have to switch between HTML rules and Ruby rules.

## Summary

Moving to Phlex feels a bit strange for the first hour, but once you realize that you have the full power of the Ruby language in your views, you won't want to go back. 

Start small. Convert one simple "Settings" page or a "Profile" page. You can run ERB and Phlex side-by-side in the same app without any problems. 