---
title: "Rails 8: How to Auto-Generate Social Media Preview Cards"
categories: selfnote
tags: [rails, ruby, seo, tutorial]
image:
 path: /assets/images/2026-04-27-Rails-8-How-To-Auto-Generate-Social-Media-Preview-Cards/feature.webp
---

Very often I find myself sharing a link to my new Rails project on Twitter, Discord, or LinkedIn. But when I paste the link, the preview just shows a blank, boring gray box. 

If you want your SaaS to look professional, you need OpenGraph (`og:image`) images. The problem is, if you have a blog with 500 posts, or a directory with 10,000 user profiles, you cannot design 10,000 images manually in Figma. 

You could use a third-party API service to generate these screenshots, but they usually charge around $29/month. As a solo developer, I hate adding unnecessary monthly subscriptions.

We can actually build a dynamic screenshot generator directly inside our Rails 8 app using HTML, Tailwind, and a headless browser. Here is exactly how to do it in 5 steps.

## STEP 1: The "Card" View

First off, we need to design what our image will look like. Instead of trying to draw images with complex Ruby image-magick libraries, we are just going to build a standard Rails webpage. 

Let's create a special route that renders a specific post as a card. The trick here is that standard Twitter/LinkedIn cards are exactly **1200x630 pixels**.

```ruby
# config/routes.rb
resources :posts do
  member do
    get :card_preview # e.g., /posts/1/card_preview
  end
end
```

Now, create a very simple layout just for these cards so they don't load your app's navbar or footer.

```erb
<!-- app/views/layouts/card.html.erb -->
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="w-[1200px] h-[630px] m-0 p-0 flex items-center justify-center bg-slate-900 text-white">
    <%= yield %>
  </body>
</html>
```

And the view itself:

```erb
<!-- app/views/posts/card_preview.html.erb -->
<div class="p-16 w-full h-full flex flex-col justify-between">
  <h1 class="text-8xl font-bold"><%= @post.title %></h1>
  <div class="flex items-center text-4xl text-gray-400">
    <span>By <%= @post.author_name %></span>
  </div>
</div>
```
*(In your controller, just remember to render this with `render layout: 'card'`)*

## STEP 2: The Screenshot Engine (Ferrum)

Now we have a webpage that looks exactly like our desired image. We just need our Rails app to "take a photo" of it. 

We will use the **Ferrum** gem. We talked about Ferrum in my web scraping articles - it connects directly to Chrome without needing slow Selenium webdrivers. It is incredibly fast.

Add it to your Gemfile:

```ruby
gem 'ferrum'
```
Run `bundle install`. *(Note: Your server will need Chromium/Chrome installed. If you deploy with Kamal, you just add it to your Dockerfile).*

## STEP 3: The Generator Service

Let's write a plain Ruby object to handle the screenshot. We want to point Ferrum at our `card_preview` URL, set the window size to 1200x630, and capture the image.

```ruby
# app/services/card_generator.rb
require 'ferrum'

class CardGenerator
  def self.capture(url)
    # Boot the headless browser
    browser = Ferrum::Browser.new(
      window_size:[1200, 630],
      timeout: 10
    )

    # Go to our special Rails view
    browser.goto(url)

    # Optional: Wait for any custom fonts or images to load
    browser.network.wait_for_idle 

    # Take the screenshot and save it to a temporary file
    temp_file = Tempfile.new(['card', '.png'])
    browser.screenshot(path: temp_file.path, format: :png)
    
    browser.quit

    temp_file
  end
end
```

## STEP 4: Attaching the Image (ActiveStorage)

We do not want to boot up a headless browser every single time someone shares our link on Twitter. That will instantly crash your database and eat all your server RAM. 

We need to generate the image **once** when the Post is created, and save it using ActiveStorage.

Ensure your `Post` model is ready:

```ruby
# app/models/post.rb
class Post < ApplicationRecord
  has_one_attached :og_image
end
```

Now, let's use a background job (Solid Queue) to generate and attach the image right after the post is saved.

```ruby
# app/jobs/generate_og_image_job.rb
class GenerateOgImageJob < ApplicationJob
  queue_as :default

  def perform(post_id)
    post = Post.find(post_id)
    
    # We use Rails routing helpers to get the full URL
    url = Rails.application.routes.url_helpers.card_preview_post_url(post, host: 'https://myapp.com')
    
    # Run our Ferrum service
    file = CardGenerator.capture(url)

    # Attach the image to the post
    post.og_image.attach(
      io: File.open(file.path), 
      filename: "og_image_#{post.id}.png", 
      content_type: 'image/png'
    )
    
    file.close
    file.unlink # Clean up the tempfile
  end
end
```

Just call `GenerateOgImageJob.perform_later(self.id)` in an `after_create_commit` callback on your Post model.

## STEP 5: The Meta Tags

The hard part is done! You now have a dynamically generated image attached to your database record. 

When a user visits the actual `show` page of your Post, you just need to tell Twitter and LinkedIn where to find that image. 

Open your main application layout file and add the OpenGraph meta tags inside the `<head>`:

```erb
<!-- app/views/layouts/application.html.erb -->
<head>
  <!-- Other standard meta tags... -->

  <% if @post&.og_image&.attached? %>
    <meta property="og:image" content="<%= url_for(@post.og_image) %>">
    <meta name="twitter:card" content="summary_large_image">
  <% end %>
</head>
```

## Summary

That's pretty much it. 
Instead of paying a monthly fee to an external API, we used the tools we already have in Rails 8. 

1. We created a **1200x630 HTML view**.
2. We used **Ferrum** to take a screenshot of that view.
3. We used **Solid Queue** to run it in the background.
4. We used **ActiveStorage** to save the file permanently.

Your application links will now stand out perfectly on social media, and because you are building the cards using standard ERB and Tailwind, you have 100% control over exactly how they look.

***

*Do you use dynamically generated images for your apps? Let me know your workflow in the comments! 👇*