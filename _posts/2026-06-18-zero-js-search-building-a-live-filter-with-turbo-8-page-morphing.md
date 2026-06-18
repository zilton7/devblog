---
title: "Zero-JS Search: Building a Live-Filter with Turbo 8 Page Morphing"
categories: selfnote
tags: [rails, hotwire, search, webdev]
image:
 path: /assets/images/2026-06-18-Zero-Js-Search-Building-A-Live-Filter-With-Turbo-8-Page-Morphing/feature.webp
---

I’ve lost count of the number of hours I’ve spent in the past building "Live Search" features. 

In the old days, you had to write custom AJAX listeners, handle the "white flash" of reloads, and manually manage the browser's history. Later, with Turbo 7, we used `Turbo Frames`, but that meant wrapping everything in specific tags and losing the "state" of the rest of the page.

In 2026, the game has changed. With **Turbo 8 Page Morphing**, we can build a live-filtering search bar that feels like a heavy React app, but uses 100% standard Rails controllers and almost zero custom JavaScript.

The secret is that Turbo 8 can "morph" the page - it refreshes the HTML but keeps your scroll position and the focus inside the search input perfectly intact. Here is how to build it in 3 steps.

## STEP 1: Enable Morphing

First, we need to tell our application that we want to use the new Morphing behavior instead of the old "Replace" behavior. 

Open your main application layout and add these two tags to the `<head>`.

```erb
<!-- app/views/layouts/application.html.erb -->
<head>
  <!-- ... -->
  <%= turbo_refreshes_with method: :morph, scroll: :preserve %>
  <%= yield :head %>
</head>
```

## STEP 2: The Search Form and Controller

We are going to use a standard HTML form. No `remote: true`, no complex setups. Just a simple `GET` request.

```ruby
# app/controllers/products_controller.rb
class ProductsController < ApplicationController
  def index
    @products = Product.all
    
    if params[:query].present?
      @products = @products.where("name ILIKE ?", "%#{params[:query]}%")
    end
  end
end
```

In your view, create the search bar. The "trick" here is that we want the form to submit as the user types. Since HTML doesn't do this natively, we use a tiny 2-line **Stimulus** controller that I keep in every project as a "utility" tool.

```erb
<!-- app/views/products/index.html.erb -->
<div class="p-8">
  <div data-controller="autosave">
    <%= form_with url: products_path, method: :get, 
                  data: { autosave_target: "form", turbo_frame: "_top" } do |f| %>
      
      <%= f.text_field :query, 
            placeholder: "Search products...", 
            value: params[:query],
            data: { action: "input->autosave#save" },
            class: "border-2 border-black p-2 w-full" %>
    <% end %>
  </div>

  <div id="products_list" class="mt-8 grid grid-cols-3 gap-4">
    <%= render @products %>
  </div>
</div>
```

## STEP 3: The Utility Controller (The only JS you need)

This is the only JavaScript we need. It is a reusable "autosave" controller that simply submits the form whenever you type.

```javascript
// app/javascript/controllers/autosave_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["form"]

  save() {
    // This triggers the standard Rails form submission
    this.formTarget.requestSubmit()
  }
}
```

## How it works (The Magic)

In the old days, calling `requestSubmit()` as you typed would be a disaster. The page would reload, you would lose focus on the text box, and the cursor would jump to the beginning of the line.

**With Turbo 8 Morphing:**
1. You type the letter "A".
2. Stimulus tells the form to submit.
3. Rails returns the *entire* index page with only the "A" products.
4. Turbo 8 compares the new HTML to the current page.
5. It sees that the text input is the same, so it **leaves it alone** (preserving your cursor and focus).
6. It sees the product list has changed, so it **morphs** those elements seamlessly.

The user perceives a lightning-fast, reactive live filter, but you are just writing standard, boring Rails code.

## Summary

As a solo developer, your goal is to stay out of "JavaScript Land" as much as possible. By leveraging Turbo 8 Page Morphing:

1.  **No JSON APIs:** You don't need to build a search endpoint.
2.  **No Manual DOM Updates:** You don't have to write code to append or remove items.
3.  **No Focus Issues:** Browsers handle the state of the input automatically.

This is the "One-Person Framework" at its best: high-end features with zero-maintenance code.