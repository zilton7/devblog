---
title: "The Importmap Guide to Shadcn: Beautiful UI with Zero Build Step"
categories: selfnote
tags: [rails, frontend, tailwind, stimulus]
image:
 path: /assets/images/2026-05-01-The-Importmap-Guide-To-Shadcn-Beautiful-Ui-With-Zero-Build-Step/feature.webp
---

# How to Use Shadcn UI in Rails 8 (Without React or Webpack)

If you have looked at frontend design anytime recently, you have definitely seen **shadcn/ui**. It is the most popular UI library in the world right now. It looks beautiful, minimal, and highly professional.

Very often I find myself wanting to use these beautiful components in my Rails apps. But immediately, I hit a massive wall. 

Shadcn is built strictly for **React**. Its installation instructions ask you to run `npx`, install a bunch of Node.js dependencies, and compile JSX code. 

If you are using Rails 8 with **Importmaps**, you do not have a build step. You do not have Node.js. You cannot just run `bin/importmap pin shadcn` because browsers do not understand React JSX natively.

Does this mean we can't use it? No. 
Shadcn is just a combination of two things: **Tailwind CSS** (for the design) and **Radix UI** (for the JavaScript behavior). We can easily replicate this in pure Rails using Importmaps and Stimulus. 

Here is exactly how to get the Shadcn experience in a modern Rails 8 app.

## STEP 1: The Reality Check (What are we actually doing?)

Because we are not using React, we are going to do what I call "Design Extraction." 

We are going to steal the beautiful HTML and Tailwind classes from Shadcn, and we are going to replace the heavy React JavaScript with lightweight **Stimulus** controllers.

To do this, your Rails 8 app needs to have Tailwind CSS installed. If you generated your app with Tailwind, you are ready to go. If not, you can add it easily:

```bash
bundle add tailwindcss-rails
rails tailwindcss:install
```

## STEP 2: Pin the Stimulus Helpers (Importmap)

Shadcn components like Modals, Dropdowns, and Tabs need JavaScript to open and close. We don't want to write this Javascript from scratch.

Instead, we will use an amazing open-source library called `tailwindcss-stimulus-components`. It provides pre-written Stimulus controllers that do exactly what Shadcn's React code does (toggling classes, handling clicks, managing focus).

Since we are using Importmaps, we install it straight from the terminal:

```bash
bin/importmap pin tailwindcss-stimulus-components
```

Now, we need to register these controllers in our Javascript file.

```javascript
// app/javascript/controllers/index.js
import { application } from "controllers/application"
import { Dropdown, Modal, Tabs, Popover } from "tailwindcss-stimulus-components"

application.register('dropdown', Dropdown)
application.register('modal', Modal)
application.register('tabs', Tabs)
application.register('popover', Popover)
```

## STEP 3: Stealing the Shadcn Design

Let's build a Shadcn-style **Dropdown Menu**. 

If you go to the Shadcn documentation, you will see a beautiful React component. We ignore the React code. We just look at the design: white background, subtle border, small shadows, and rounded corners.

We write plain HTML, apply those exact Tailwind classes, and wrap it in our new Stimulus `dropdown` controller:

```erb
<!-- A Shadcn-style Dropdown in pure Rails -->
<div data-controller="dropdown" class="relative inline-block text-left">
  
  <!-- The Trigger Button -->
  <button data-action="click->dropdown#toggle click@window->dropdown#hide" 
          class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-200 bg-white px-4 py-2 hover:bg-gray-100 hover:text-gray-900 transition-colors">
    Open Menu
  </button>

  <!-- The Dropdown Content (Hidden by default) -->
  <div data-dropdown-target="menu" 
       class="hidden absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-md p-1 z-50 transition transform origin-top-right">
    
    <a href="#" class="block px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-sm">
      Profile
    </a>
    <a href="#" class="block px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-sm">
      Settings
    </a>
    
    <div class="h-px bg-gray-200 my-1"></div> <!-- Divider -->
    
    <%= button_to "Log out", destroy_user_session_path, method: :delete, 
        class: "w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-gray-100 rounded-sm" %>
  </div>
</div>
```

**Why this works:**
1. The CSS gives it the exact premium, crisp look of Shadcn.
2. The `data-controller="dropdown"` uses the Stimulus library we pinned via Importmap to handle the open/close logic and clicking outside the menu. 
3. We didn't write a single line of custom Javascript or touch Webpack.

## STEP 4: Creating Reusable Components (The Rails Way)

The magic of Shadcn in React is that you just write `<Button>Click me</Button>`. 

If you copy-paste the massive Tailwind HTML above every time you need a dropdown, your views will become a nightmare. In Rails, we solve this by wrapping our new designs into **Rails Helpers** or **ViewComponents**.

Let's turn the famous Shadcn Button into a simple Rails helper.

```ruby
# app/helpers/ui_helper.rb
module UiHelper
  def shadcn_button(text, path, style: :primary, **options)
    base_classes = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 px-4 py-2"
    
    style_classes = case style
    when :primary
      "bg-slate-900 text-white hover:bg-slate-900/90"
    when :secondary
      "bg-slate-100 text-slate-900 hover:bg-slate-100/80"
    when :destructive
      "bg-red-500 text-white hover:bg-red-500/90"
    when :outline
      "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900"
    else
      ""
    end

    css_classes = "#{base_classes} #{style_classes} #{options[:class]}"
    
    link_to text, path, class: css_classes, **options.except(:class)
  end
end
```

Now, anywhere in your app, you can just write:
```erb
<%= shadcn_button "Save Changes", save_path, style: :primary %>
<%= shadcn_button "Delete", delete_path, style: :destructive %>
```

## Summary

Don't let the React community trick you into thinking you need a massive Javascript build step just to have beautiful buttons and modals.

1. **Shadcn is just a design system.** It is Tailwind CSS.
2. **React is just the engine.** We replace it with Stimulus via Importmaps.
3. **Components are just helpers.** We replace JSX with Rails Helpers or ViewComponents.

By combining `tailwindcss-stimulus-components` and some smart Rails helpers, you can get 100% of the visual beauty of Shadcn while keeping the blazing fast, no-build-step architecture of Rails 8.