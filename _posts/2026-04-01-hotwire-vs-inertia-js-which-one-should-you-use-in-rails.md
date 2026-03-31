---
title: "Hotwire vs Inertia.js: Which One Should You Use in Rails?"
categories: selfnote
tags: [rails, hotwire, inertia, webdev]
image:
 path: /assets/images/2026-04-01-Hotwire-Vs-Inertia-Js-Which-One-Should-You-Use-In-Rails/feature.webp
---

For a long time, if you wanted to build a fast, modern web application without page reloads, you had to build two completely separate apps. You had to build a Rails API for the backend, and a React or Vue Single Page Application (SPA) for the frontend. 

Very often I found myself tired of this approach. Managing JSON responses, CORS issues, and duplicating routing logic is just annoying.

Thankfully, the industry realized this was too complex for solo developers. Two massive solutions appeared to fix this: **Hotwire** (created by the Rails team) and **Inertia.js** (popularized by the Laravel community). 

Both of these tools let you build modern "SPA-like" apps without building an API. But they work in very different ways. Here is my breakdown of how they compare, and why I personally favor Hotwire.

## The Inertia.js Approach (The Modern Monolith)

Inertia.js acts as a glue between your backend (Rails/Laravel) and your frontend (React/Vue/Svelte). 

With Inertia, you still use Rails for your routes and controllers. But instead of rendering an HTML file (`.html.erb`), your controller sends data to a JavaScript component. 

Here is how an Inertia controller looks in Rails:

```ruby
# app/controllers/dashboards_controller.rb
class DashboardsController < ApplicationController
  def show
    @user = current_user
    # Instead of rendering ERB, we render a React/Vue component
    render inertia: 'Dashboard', props: {
      user: @user.as_json
    }
  end
end
```

And your frontend is a standard React file:

```javascript
// app/javascript/Pages/Dashboard.jsx
import React from 'react';

export default function Dashboard({ user }) {
  return (
    <div>
      <h1>Welcome back, {user.name}!</h1>
    </div>
  );
}
```

**The Good:** You get to use React or Vue. If you love the React ecosystem and want to use components like Material UI or Tailwind UI React, this is amazing.
**The Bad:** You are sending JSON over the wire. Your browser still has to download the heavy JavaScript framework, parse the JSON, and build the HTML on the user's device. 

## The Hotwire Approach (HTML Over The Wire)

Hotwire takes the opposite approach. It says: "JavaScript is too heavy. Let the server do the work."

With Hotwire, you just write standard Rails controllers and standard ERB views. 

```ruby
# app/controllers/dashboards_controller.rb
class DashboardsController < ApplicationController
  def show
    @user = current_user
    # Rails automatically renders show.html.erb
  end
end
```

```erb
<!-- app/views/dashboards/show.html.erb -->
<div>
  <h1>Welcome back, <%= @user.name %>!</h1>
</div>
```

When a user clicks a link, Hotwire intercepts the click, fetches the new HTML from the server in the background, and instantly swaps out the `<body>` of the page. 

## Why I Favor Hotwire

Both tools are great, but for a solo developer or a small team using Rails, I think Hotwire is the clear winner. Here is why.

### REASON 1: No Context Switching
If you use Inertia, you have to write Ruby in your controllers, and then switch your brain to write JavaScript/React for your views. You have to remember two different syntaxes, two different ways to loop through arrays, and two different ways to format dates. 
With Hotwire, you stay in Ruby and HTML almost 100% of the time. 

### REASON 2: The Build Step (Node.js)
To use Inertia, you must have Node.js, Webpack, or Vite running to compile your React/Vue code. This means dealing with `package.json` and `node_modules`. 
With Rails 7 and Rails 8, Hotwire uses Importmaps. You literally do not need Node.js installed on your computer. You write plain code, and it just works in the browser. It makes your development environment much simpler.

### REASON 3: State Management
In Inertia (or any React app), you have to worry about "State". If you update a user's name, you have to write Javascript to update that variable on the screen. 
In Hotwire, the database is your only state. If something changes, you just tell the server to render that small piece of HTML again using a `Turbo Stream`. It deletes an entire category of bugs.

### REASON 4: It is the Rails Default
If you use Inertia in Rails, you are fighting against the current. The `inertia_rails` gem is good, but you miss out on built-in Rails features like standard form helpers and ActionCable broadcasting. 
Hotwire is built directly into Rails by the creators of Rails. Everything works perfectly out of the box.

## Summary

*   Use **Inertia.js** if you are moving from a dedicated React/Vue frontend and you already have a massive library of React components you want to reuse, but you are tired of writing API endpoints.
*   Use **Hotwire** if you want to build things incredibly fast, keep your codebase simple, and stay inside the Ruby ecosystem.

That's pretty much it. For me, removing the Javascript build step and keeping all my logic in Ruby makes Hotwire the ultimate productivity tool.