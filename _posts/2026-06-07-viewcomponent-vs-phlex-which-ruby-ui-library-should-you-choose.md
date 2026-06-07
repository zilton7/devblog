---
title: "ViewComponent vs. Phlex: Which Ruby UI Library Should You Choose?"
categories: selfnote
tags: [rails, ruby, frontend, webdev]
image:
 path: /assets/images/2026-06-07-Viewcomponent-Vs-Phlex-Which-Ruby-Ui-Library-Should-You-Choose/feature.webp
---

I remember when my `app/views` folder was a complete disaster. I had deeply nested partials, instance variables floating everywhere, and logic hidden inside HTML tags. If I wanted to change the color of a button, I had to search through 50 different files.

In 2026, we don't build Rails apps like that anymore. We use **Components**. 

Components allow you to treat your UI like Lego blocks. You build a "Button" once, and you reuse it everywhere. It makes your code cleaner, easier to test, and much faster to write. 

Here are the best Rails component libraries you should be using today to keep your monolith organized.

## 1. ViewComponent (The Gold Standard)

Created by the team at GitHub, **ViewComponent** is the most popular choice. It turns your views into Ruby objects.

**Why I like it:**
Instead of a "dumb" partial, you get a Ruby class and an HTML file. You can pass data into the class, and Ruby will yell at you if you forget a required parameter. It makes your UI "Type Safe."

```ruby
# app/components/button_component.rb
class ButtonComponent < ViewComponent::Base
  def initialize(title:, url:)
    @title = title
    @url = url
  end
end
```

```erb
<!-- app/components/button_component.html.erb -->
<%= link_to @title, @url, class: "bg-blue-500 text-white p-2 rounded" %>
```

The best part? You can **Unit Test** your UI. You don't need a slow browser test just to see if a button has the right text. You can test it in milliseconds using standard Minitest.

## 2. Phlex (The Speed Demon)

If you hate context-switching between Ruby and ERB, you will love **Phlex**. 

Phlex is a new challenger that is taking the Rails world by storm. It doesn't use `.html.erb` files at all. You write your HTML in **Pure Ruby**.

```ruby
# app/components/card.rb
class Card < Phlex::HTML
  def template
    div(class: "p-4 border rounded shadow") do
      h1 { "Hello from Phlex" }
      p { "This is 10x faster than ERB." }
    end
  end
end
```

**Why I like it:**
*   **Performance:** It is significantly faster than rendering ERB templates.
*   **No context switching:** You stay in Ruby land. You can use standard Ruby loops, conditions, and methods without the messy `<% %>` tags.
*   **High ROI:** For a solo developer, Phlex makes building complex UI kits feel like writing a normal script.

## 3. Lookbook (The Designer's Secret)

If you are using ViewComponent or Phlex, **Lookbook** is a mandatory tool. 

Think of it as a "Storybook" but for Rails. It creates a private dashboard in your development environment where you can see every component you've built. 

**How to use it:**
1.  Install the gem.
2.  Mount the engine in your `routes.rb`.
3.  Visit `/lookbook`.

You can now click through your buttons, modals, and navigation bars to see how they look with different data. It is the best way to maintain a consistent design system without getting lost in your own code.

## 4. Tailwind-Stimulus-Components

Components aren't just about HTML; they are also about **Behavior**. 

If you use Tailwind CSS (which you should), you don't want to write custom JavaScript for every single dropdown or modal. This library gives you pre-written Stimulus controllers that handle the "boring" stuff.

Instead of writing a "modal-open" script, you just add a data attribute:
```html
<div data-controller="modal">
  <button data-action="click->modal#open">Open</button>
  <div data-modal-target="container" class="hidden">
     <!-- Modal Content -->
  </div>
</div>
```

It is a perfect match for the "One-Person Framework" philosophy: use standard, battle-tested behavior so you can focus on the business logic.

## Summary: Which one should you pick?

If you are a solo developer trying to choose a stack today, here is my recommendation:

*   **Choose ViewComponent** if you want the safest, most documented option. It is used by GitHub and Shopify, so it isn't going anywhere.
*   **Choose Phlex** if you are a Ruby purist who wants the absolute maximum speed and hates ERB syntax.
*   **Always use Lookbook** to keep yourself organized. 

Moving from partials to components is the single biggest "Level Up" you can take as a Rails developer. It turns your messy views into a professional, modular system.