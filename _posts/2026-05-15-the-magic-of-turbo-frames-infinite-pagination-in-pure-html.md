---
title: "The Magic of Turbo Frames: Infinite Pagination in Pure HTML"
categories: selfnote
tags: [rails, hotwire, tutorial, webdev]
image:
 path: /assets/images/2026-05-15-The-Magic-Of-Turbo-Frames-Infinite-Pagination-In-Pure-Html/feature.webp
---

# Building an Infinite Scroll in Rails 8 (Zero Custom JavaScript)

Every modern web application eventually needs a feed. Whether it's a list of articles, a timeline of comments, or a gallery of products, users expect an "Infinite Scroll" experience. They scroll to the bottom, and the next batch of items magically appears.

In the past, implementing this was a nightmare for backend developers. You had to:
1. Write JavaScript to listen to the window scroll event (and debounce it so it didn't crash the browser).
2. Calculate if the user was 100 pixels away from the bottom of the screen.
3. Fire an AJAX request.
4. Parse a JSON response.
5. Append new DOM elements to the page.

It was messy and prone to bugs. 

If you are using Rails 8, you can throw all of that JavaScript away. By combining standard Rails pagination with a powerful feature of Hotwire called **Lazy-Loaded Turbo Frames**, we can build a perfect infinite scroll in about 5 minutes, writing absolutely zero custom JS.

Here is exactly how to do it.

## The Strategy

The concept is brilliantly simple. We are going to put our list of items inside a `<turbo-frame>`. At the very bottom of that list, we will put *another* turbo frame. 

This second frame will have an attribute called `loading="lazy"`, and its `src` will point to the URL of "Page 2". 

When the user scrolls down, and that empty frame enters the browser viewport, Turbo automatically fetches the URL and replaces the empty frame with the contents of Page 2 (which includes the next batch of items, plus a new lazy frame pointing to Page 3).

## STEP 1: The Controller

First, we need standard pagination in our controller. You can use the `pagy` gem or the built-in Rails `limit/offset`. For this example, let's use the popular `kaminari` gem because it is very explicit.

```ruby
# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  def index
    # Load 10 posts at a time based on the ?page= parameter
    @posts = Post.order(created_at: :desc).page(params[:page]).per(10)
  end
end
```

## STEP 2: The View (The Magic Frame)

Now, open your index view. This is where the magic happens. 

We need to wrap our content in a `<turbo-frame>` that has a dynamic ID based on the current page number. If we are on Page 1, the ID is `posts_page_1`. 

```erb
<!-- app/views/posts/index.html.erb -->

<h1>The Infinite Feed</h1>

<!-- The main feed container -->
<div id="posts_feed">
  
  <!-- The dynamic Turbo Frame for the current page -->
  <turbo-frame id="posts_page_<%= @posts.current_page %>">
    
    <!-- Render the actual posts -->
    <% @posts.each do |post| %>
      <div class="p-4 border-b">
        <h3><%= post.title %></h3>
      </div>
    <% end %>

    <!-- The Lazy-Loading Trigger -->
    <% unless @posts.last_page? %>
      <!-- This frame points to the NEXT page and loads lazily -->
      <turbo-frame id="posts_page_<%= @posts.next_page %>" 
                   src="<%= posts_path(page: @posts.next_page) %>" 
                   loading="lazy">
        
        <!-- A simple loading spinner to show while fetching -->
        <p class="text-center text-gray-500 py-4 animate-pulse">Loading more...</p>
        
      </turbo-frame>
    <% end %>

  </turbo-frame>

</div>
```

## How It Actually Works (Step-by-Step)

When a user visits `/posts`, here is exactly what happens:

1.  Rails renders Page 1. The ID of the outer frame is `posts_page_1`.
2.  At the bottom of the 10 items, there is an empty frame with `id="posts_page_2"` and `loading="lazy"`.
3.  The user scrolls down. As soon as that empty frame becomes visible on the screen, Turbo sees the `loading="lazy"` attribute and fires an HTTP request to `src="/posts?page=2"`.
4.  Rails receives the request and renders `index.html.erb` for Page 2.
5.  Turbo receives the HTML response for Page 2. It looks for the frame named `posts_page_2`.
6.  It extracts the contents of `posts_page_2` (which contains posts 11-20, plus a new lazy frame for `posts_page_3`) and swaps it seamlessly into the original page.

The user experiences a buttery smooth infinite scroll, and you didn't have to write a single line of JavaScript.

## STEP 3: Optimization (The Pro Move)

The code above works perfectly. However, there is one small performance optimization we should make.

When Turbo requests Page 2, Rails is rendering the entire `index.html.erb` layout (including your navbar, footer, and sidebars). Turbo is smart enough to throw away the navbar and only use the specific `<turbo-frame>`, but rendering that extra HTML on the server wastes CPU cycles.

We can tell our Rails controller to skip the application layout if the request is coming from a Turbo Frame.

```ruby
# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  def index
    @posts = Post.order(created_at: :desc).page(params[:page]).per(10)
    
    # If Turbo is asking for this page (e.g. infinite scroll), 
    # don't render the heavy application layout.
    if turbo_frame_request?
      render partial: "posts/page", locals: { posts: @posts }
    end
  end
end
```
*(You would then extract the turbo-frame logic from Step 2 into a `_page.html.erb` partial).*

## Summary

This is the beauty of the modern Rails 8 stack. By understanding how HTML over the wire works, you can delete entire categories of frontend complexity. 

*   You don't need a Javascript Intersection Observer.
*   You don't need to parse JSON.
*   You just use a `<turbo-frame>` with `loading="lazy"`.

As a solo developer, finding these "low-code" solutions is the only way to ship features fast enough to compete. Keep it simple, and let the browser do the heavy lifting.