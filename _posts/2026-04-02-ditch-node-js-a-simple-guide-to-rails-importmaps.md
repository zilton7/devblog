---
title: "Ditch Node.js: A Simple Guide to Rails Importmaps"
categories: selfnote
tags: [rails, ruby, javascript, webdev]
image:
 path: /assets/images/2026-04-02-Ditch-Node-Js-A-Simple-Guide-To-Rails-Importmaps/feature.webp
---

# How Importmaps Work in Rails (And Why You Don't Need Webpack)

When I first started building modern Rails apps, managing JavaScript was always the most annoying part. We had Webpacker, `package.json`, and massive `node_modules` folders that took up gigabytes of space on my computer. 

Very often I found myself tired of waiting for Webpack to compile my code just to see a small JavaScript change in the browser. It felt very heavy, especially for solo developers.

Then Rails introduced **Importmaps**. At first, I was very confused. How could I use libraries like Lodash, Chart.js, or Stimulus without running `npm install`? 

Once I understood how it actually works under the hood, I realized it is a genius solution. Here is a simple explanation of how Importmaps work in Rails and how to use them.

## The Core Concept: A Dictionary for the Browser

Modern web browsers are actually very smart now. They natively understand ES Modules. This means if you write `import canvasConfetti from 'canvas-confetti'`, modern Chrome or Firefox knows what to do.

But there is one problem. The browser doesn't know **where** to find that file on the internet. 

An Importmap is basically just a dictionary that lives in your HTML `<head>`. It tells the browser: *"Hey, if the Javascript code asks for 'canvas-confetti', please download it from this specific CDN URL."*

Here is how we set this up in Rails in 4 simple steps.

## STEP 1: Pinning a Library

Instead of using `npm install` or `yarn add`, Rails gives us a simple terminal command to add a Javascript library to our app. We call this "pinning".

Let's say we want to add the popular `canvas-confetti` library. Go to your terminal and run:

```bash
bin/importmap pin canvas-confetti
```

When you run this, Rails goes to a fast CDN (like `jspm.io`), finds the exact URL for that library, and saves it to your configuration.

## STEP 2: The Configuration File

If you open the file `config/importmap.rb`, you will see what Rails actually did in the background.

```ruby
# config/importmap.rb

# These are your local files
pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"

# This is the new library we just pinned!
pin "canvas-confetti", to: "https://ga.jspm.io/npm:canvas-confetti@1.9.2/dist/confetti.module.mjs"
```

This file is just a list of names and URLs. You can even manually edit this file to point to different CDNs if you want.

## STEP 3: Using it in your Code

Now that the library is "pinned", we can use it anywhere in our JavaScript files just like we would in a React or Node.js app.

Open your `app/javascript/application.js` (or a Stimulus controller) and simply import it:

```javascript
// app/javascript/application.js

import confetti from "canvas-confetti";

// Let's trigger it!
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});
```

Because we pinned the name `"canvas-confetti"`, the browser knows exactly what we are talking about.

## STEP 4: The Magic in the HTML

So how does the browser actually read this dictionary? 

In your `app/views/layouts/application.html.erb`, you should have this standard Rails helper in the `<head>` section:

```erb
<%= javascript_importmap_tags %>
```

When a user visits your website, Rails turns that helper into a literal JSON script tag. If you inspect your page source in the browser, it looks like this:

```html
<script type="importmap">
  {
    "imports": {
      "application": "/assets/application-xyz123.js",
      "canvas-confetti": "https://ga.jspm.io/npm:canvas-confetti@1.9.2/dist/confetti.module.mjs"
    }
  }
</script>
```

When the browser hits your `application.js` file and sees `import confetti from "canvas-confetti"`, it looks at this JSON map, finds the URL, downloads the file directly from the CDN, and executes it.

## Why I like this approach?

There are a few massive reasons why I prefer Importmaps over the old Webpack/Node.js way:

1.  **No Build Step:** You don't have to wait for your JavaScript to compile. You hit "Save" in your editor, refresh the browser, and the changes are there instantly. 
2.  **No `node_modules`:** Your Rails project stays incredibly small and clean. You don't have a 500MB folder of Javascript dependencies sitting on your hard drive.
3.  **Fast for Users:** Because libraries are downloaded from public CDNs, there is a very high chance the user's browser already has that library cached from visiting another website. 

Importmaps remove a huge layer of complexity from frontend development. If you are building a standard Rails app with Hotwire and Stimulus, you really don't need a JavaScript bundler anymore. 