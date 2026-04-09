---
title: "The Easiest Way to Add Drag and Drop to Your Rails App"
categories: selfnote
tags: [rails, javascript, stimulus, webdev]
image:
 path: /assets/images/2026-04-10-The-Easiest-Way-To-Add-Drag-And-Drop-To-Your-Rails-App/feature.webp
---

# Building Drag and Drop in Rails 8 with SortableJS and Importmaps

Very often I find myself building apps where users need to reorder things. Maybe it is a list of tasks, a gallery of images, or steps in a project. 

In the old days, we used `jQuery UI` for this. Then we moved to complex React drag-and-drop libraries. But if you are using modern Rails with Hotwire, adding drag and drop is actually incredibly simple. We don't even need Node.js or Webpack. 

We can use a lightweight library called **SortableJS**, load it via **Importmaps**, and connect it to our database using a single Stimulus controller. 

Here is exactly how to do it in 5 steps.

## STEP 1: The Database Setup

First off, our database needs to know the order of our items. Let's assume we have a `Task` model. We need to add a `position` column to it.

Run this migration in your terminal:

```bash
rails g migration AddPositionToTasks position:integer
rails db:migrate
```

*Pro tip: I highly recommend adding the `acts_as_list` gem to your Gemfile. It handles all the annoying math of shifting positions up and down in the database automatically.*

If you use the gem, just add this to your model:

```ruby
# app/models/task.rb
class Task < ApplicationRecord
  acts_as_list
end
```

## STEP 2: Pin SortableJS (Importmap)

Because we are using Importmaps, we do not need to run `npm install`. We just pin the library directly from the CDN.

Run this in your terminal:

```bash
bin/importmap pin sortablejs
```

This will automatically add the correct URL to your `config/importmap.rb` file.

## STEP 3: The HTML View

Now let's build the list in our view. We need to wrap our tasks in a `div` or `ul` and attach a Stimulus controller to it. We also need to give each item a data attribute so our Javascript knows which Task ID is being dragged.

```erb
<!-- app/views/tasks/index.html.erb -->

<h1>My Tasks</h1>

<!-- We attach the 'sortable' controller here -->
<ul data-controller="sortable">
  <% @tasks.order(:position).each do |task| %>
    
    <!-- We store the task ID on the list item -->
    <li data-id="<%= task.id %>" class="p-4 bg-white border mb-2 cursor-move">
      <%= task.name %>
    </li>

  <% end %>
</ul>
```

## STEP 4: The Stimulus Controller

Next, we generate our Stimulus controller:

```bash
rails g stimulus sortable
```

Open the newly created file at `app/javascript/controllers/sortable_controller.js`. This is where the magic happens. We import `SortableJS`, initialize it, and tell it to send a network request to Rails whenever the user drops an item.

```javascript
// app/javascript/controllers/sortable_controller.js
import { Controller } from "@hotwired/stimulus"
import Sortable from "sortablejs"

export default class extends Controller {
  connect() {
    // Initialize Sortable on the HTML element this controller is attached to
    this.sortable = Sortable.create(this.element, {
      animation: 150,
      onEnd: this.updatePosition.bind(this)
    })
  }

  updatePosition(event) {
    // Get the dragged item's ID and its new index in the list
    const id = event.item.dataset.id
    const newIndex = event.newIndex + 1 // ActsAsList is 1-indexed, JS is 0-indexed

    // Grab the CSRF token so Rails doesn't block our request
    const csrfToken = document.querySelector("[name='csrf-token']").content

    // Send an AJAX request to our Rails controller
    fetch(`/tasks/${id}/move`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({ position: newIndex })
    })
  }
}
```

## STEP 5: The Rails Controller & Route

The Javascript is sending a `PATCH` request to `/tasks/:id/move`. Let's create that route and the controller action to handle it.

Update your routes:

```ruby
# config/routes.rb
resources :tasks do
  member do
    patch :move
  end
end
```

And finally, update the database in your `TasksController`:

```ruby
# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  def move
    @task = Task.find(params[:id])
    
    # If you are using the acts_as_list gem, it is this simple:
    @task.insert_at(params[:position].to_i)
    
    # We don't need to render a view, just tell JS it was successful
    head :ok
  end
end
```

## Summary

That's pretty much it! 

1. We pinned the library via Importmap.
2. We initialized `SortableJS` in a 10-line Stimulus controller.
3. We used a standard `fetch` request to update the position in the database.

No massive React setups, no JSON API wrappers, and absolutely zero Webpack configurations. Just plain HTML, a tiny bit of Javascript, and standard Rails routing. This is why the modern Hotwire stack is so incredibly fast for building features.