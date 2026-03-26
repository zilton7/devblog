---
title: "Why I Stopped Using Bootstrap and Moved to Tailwind CSS"
categories: selfnote
tags: [css, tailwind, webdev, frontend]
image:
 path: /assets/images/2026-03-26-Why-I-Stopped-Using-Bootstrap-And-Moved-To-Tailwind-Css/feature.webp
---

When I first started building web applications, Bootstrap was the absolute standard. Every tutorial used it, and it was the fastest way to get a decent-looking navbar or a grid layout. 

But over time, I found myself getting very annoyed with it. Every site I built looked like a "Bootstrap site", and trying to customize it was a nightmare of overriding classes and using `!important`.

Then I tried **Tailwind CSS**. At first, seeing 15 classes on a single HTML element looked terrible. But after giving it a real chance, it completely changed how I build user interfaces. I haven't written a custom `.css` file in months. 

Here is why I think Tailwind is the clear winner over Bootstrap for modern web development.

## The Bootstrap Problem: Fighting the Framework

Bootstrap is a "Component-based" framework. It gives you pre-built things.
If you want a button, you write this:

```html
<button class="btn btn-primary">Submit</button>
```

This is great, but what if your designer wants the button to have slightly more rounded corners and a specific shade of purple?
Now you have to open a separate CSS file, think of a class name, and fight Bootstrap's default styles:

```css
/* custom.css */
.my-custom-btn {
  background-color: #6b46c1 !important;
  border-radius: 12px !important;
}
```

As your app grows, your custom CSS file becomes a huge, messy dumping ground of overrides. You get scared to delete old CSS because you don't know if it will break some random page.

## The Tailwind Solution: Utility-First

Tailwind does not give you components. It gives you "Utilities" (tiny CSS classes that do exactly one thing).

If you want that same custom purple button in Tailwind, you build it directly in your HTML:

```html
<button class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl">
  Submit
</button>
```

Yes, it looks crowded. But here is why this approach is actually much better.

## Why I Prefer Tailwind

### REASON 1: No More Context Switching
Very often I find myself tired of jumping between `index.html.erb` and `application.css`. With Tailwind, you style the element exactly where you create it. You stay in one file. This makes building UI much, much faster.

### REASON 2: Naming Things is Hard
Naming CSS classes is one of the most annoying parts of frontend development. Is it `.header-inner-wrapper`? Or `.nav-container-main`? 
With Tailwind, you just stop naming things. You just apply the styles you need and move on.

### REASON 3: Tiny Production Files
When you include Bootstrap, you force the user's browser to download all the CSS for carousels, modals, and accordions, even if you don't use them. 
Tailwind has a built-in compiler. When you build your app for production, it scans your HTML, finds only the classes you actually used, and throws the rest away. Your final CSS file is often under 10kb.

### REASON 4: Your App Looks Unique
Because Bootstrap gives you pre-designed components, everything looks the same. Because Tailwind just gives you the building blocks, you naturally build unique designs. You aren't restricted by someone else's idea of what a "Card" should look like.

## What about the "Ugly HTML"?

This is the biggest complaint people have. *"My HTML is too messy now!"*

If you are writing pure HTML, yes, it gets messy. But we are usually building apps with Rails (or React, or Vue). We don't repeat HTML. We use Partials or ViewComponents.

Instead of writing that long button 50 times, you just write a Rails helper or a component once:

```ruby
# app/helpers/application_helper.rb
def primary_button(text)
  content_tag(:button, text, class: "bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl")
end
```

Now in your views, you just write `<%= primary_button("Submit") %>`. You get the clean code, plus all the benefits of Tailwind.

That's pretty much it. The learning curve for Tailwind takes a few days, because you have to learn their class names (`p-4` for padding, `flex` for flexbox, etc.). But once it clicks in your brain, you will never want to go back to writing custom CSS again.