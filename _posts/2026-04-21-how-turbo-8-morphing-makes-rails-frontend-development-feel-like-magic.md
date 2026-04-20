---
title: "How Turbo 8 Morphing Makes Rails Frontend Development Feel Like Magic"
categories: selfnote
tags: [rails, hotwire, frontend, webdev]
image:
 path: /assets/images/2026-04-21-How-Turbo-8-Morphing-Makes-Rails-Frontend-Development-Feel-Like-Magic/feature.webp
---

When Hotwire first came out, it felt like a superpower. We could finally update our web pages without full browser reloads, and we didn't have to write a single line of React or Vue.

But after building a few apps with it, a new problem appeared. 

To update the page dynamically, we had to write **Turbo Streams**. If a user added a new comment to a post, you had to write a specific `.turbo_stream.erb` file that told the browser: *"Find the div with the ID of `comments_list`, and append this new HTML to the bottom of it. Oh, and also find the `comments_counter` div and replace it."*

Very often I found myself writing tons of these little manual instructions. It started to feel just as annoying as writing custom JavaScript. 

With the release of **Turbo 8**, the Rails team solved this completely. They introduced **Page Morphing**. It allows you to delete almost all of your Turbo Stream files and go back to writing plain, simple Rails controllers. 

Here is exactly how it works and how to use it.

## The Problem with Turbo Streams

In the old way (Turbo 7), if you wanted to like a post without losing your scroll position, your controller looked like this:

```ruby
# app/controllers/likes_controller.rb
def create
  @post = Post.find(params[:post_id])
  @post.likes.create(user: current_user)

  respond_to do |format|
    # You had to explicitly render a stream
    format.turbo_stream 
  end
end
```

Then you had to create a matching view:

```erb
<!-- app/views/likes/create.turbo_stream.erb -->
<%= turbo_stream.replace "post_#{@post.id}_likes", partial: "likes/count", locals: { post: @post } %>
```

This is fine for one button. But if an action updates 5 different parts of the screen (the sidebar, the navbar, the main content), you have to write 5 different stream instructions.

## What is Page Morphing?

Page Morphing asks a very simple question: **What if we just reload the entire page, but the browser is smart enough to only update the pixels that actually changed?**

Under the hood, Turbo 8 uses a library called `idiomorph`. When your server sends back a fresh HTML page, the browser compares the new HTML to the old HTML currently on your screen. It finds the differences, and *smoothly morphs* the DOM. 

It does not blink. It does not lose your scroll position. It does not delete the text you are currently typing in an input box. It just updates the data seamlessly.

## STEP 1: Enabling Morphing

To use this magic, you don't need complex JavaScript. You just need to add two `meta` tags to the `<head>` of your application layout.

```erb
<!-- app/views/layouts/application.html.erb -->
<head>
  <!-- ... other tags ... -->
  
  <%= turbo_refreshes_with method: :morph, scroll: :preserve %>
</head>
```

This tells Turbo: *"Whenever a form is submitted or a link is clicked, don't do a hard page replace. Morph the page, and keep my scroll position exactly where it is."*

## STEP 2: Simplifying the Controller

Now that morphing is turned on, we can delete our `.turbo_stream.erb` file entirely. 

Our controller goes back to looking like a classic, boring Rails 4 controller. We just redirect back to the page!

```ruby
# app/controllers/likes_controller.rb
def create
  @post = Post.find(params[:post_id])
  @post.likes.create(user: current_user)

  # No more respond_to. Just redirect.
  redirect_to posts_path
end
```

When the redirect happens, Rails sends the fresh HTML for the `posts_path`. Turbo catches it, diffs it against your current screen, and updates the like counter instantly. Your user doesn't even notice the page reloaded. 

## STEP 3: Real-Time Magic (`broadcasts_refreshes`)

This is where it gets absolutely insane. 

What if you want the screen to update when *someone else* likes the post? Like a real-time WebSocket update?

In the old days, you had to use `broadcast_replace_to` inside your model. Now, you just add one line to your ActiveRecord model:

```ruby
# app/models/like.rb
class Like < ApplicationRecord
  belongs_to :post
  belongs_to :user

  # This replaces all manual broadcasting!
  broadcasts_refreshes
end
```

When a new Like is created in the database, Rails automatically sends a tiny WebSocket signal to anyone currently looking at that post. The signal simply says: *"Hey, something changed. Please refresh your page."*

The user's browser silently fetches the new HTML in the background and morphs the screen. The new like appears instantly. You achieved full real-time reactivity with **one line of Ruby code**.

## Summary

As a solo developer, your goal is to write as little code as possible while delivering the best possible user experience. 

Manual Turbo Streams (`append`, `replace`, `remove`) are still useful for very specific, complex animations. But for 95% of your application, you should be using **Morphing**.

1. Add the `<%= turbo_refreshes_with %>` tag to your layout.
2. Delete your `.turbo_stream.erb` files.
3. Use `redirect_to` in your controllers.
4. Use `broadcasts_refreshes` in your models for real-time updates.

Stop trying to manually manage the state of your HTML. Let the browser do the heavy lifting for you.