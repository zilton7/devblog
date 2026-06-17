---
title: "Datastar in Rails 8: Real-Time UI Without the WebSocket Headache"
categories: selfnote
tags: [rails, datastar, hotwire, webdev]
image:
 path: /assets/images/2026-06-17-Datastar-In-Rails-8-Real-Time-Ui-Without-The-Websocket-Headache/feature.webp
---

I am a huge fan of Hotwire. It’s what allowed me to stop writing massive React apps and go back to enjoying Ruby. But recently, a new player has entered the "Hypermedia" world that every Rails developer should keep an eye on: **Datastar**.

If you think of **HTMX** as the "venerable grandfather" and **Hotwire** as the "official Omakase choice," then **Datastar** is the "high-performance specialist." 

The biggest difference? While Hotwire uses WebSockets (ActionCable) for real-time updates, Datastar uses **Server-Sent Events (SSE)** by default. It is incredibly lightweight (only 13kb), requires zero dependencies, and makes fine-grained reactivity feel like magic.

Here is how to get Datastar running in your Rails 8 app in 4 easy steps.

## The Concept: What makes Datastar different?

In Hotwire, when you want real-time updates, you have to set up a WebSocket connection. WebSockets are powerful, but they are "stateful" - they keep a heavy connection open. 

Datastar uses SSE. This is a standard HTTP connection that stays open just to "stream" data from the server to the browser. It’s much easier to scale, easier to debug in your Network tab, and it feels faster because it uses a technology called **"Signals"** (like Solid.js or Preact) to update only the tiny parts of the page that changed.

## STEP 1: Installation (The No-Build Way)

Since we are on Rails 8, we don't want `node_modules`. We just pin the library using Importmaps.

```bash
bin/importmap pin @starfederation/datastar
```

Then, in your `app/javascript/application.js`, just import it to initialize the global listeners:

```javascript
import "@starfederation/datastar"
```

## STEP 2: The Frontend "Signal"

Datastar uses attributes that look a lot like Alpine.js or Vue. Let’s build a simple counter that updates on the server.

```erb
<!-- app/views/counters/show.html.erb -->
<div data-signals="{count: 0}">
  <h2 data-text="$count">0</h2>
  
  <button data-on-click="@post('/increment')">
    Increment on Server
  </button>
</div>
```

**What is happening here?**
*   `data-signals`: This is a tiny piece of client-side memory.
*   `data-text`: This binds the header text to that memory.
*   `data-on-click`: This sends a POST request to our Rails controller.

## STEP 3: The Rails Controller (Streaming SSE)

This is where the magic happens. We aren't returning a regular HTML page or a Turbo Stream. We are returning a **Datastar SSE stream**.

You’ll want to add a tiny helper or a gem like `datastar-rails` to handle the formatting, but here is what the raw response looks like:

```ruby
# app/controllers/counters_controller.rb
class CountersController < ApplicationController
  include ActionController::Live # Allows us to keep the connection open

  def increment
    # 1. Update your logic
    new_count = params[:count].to_i + 1

    # 2. Set the correct header for SSE
    response.headers['Content-Type'] = 'text/event-stream'
    
    # 3. Send the Datastar "Fragment"
    # This tells Datastar to update the 'count' signal on the client
    response.stream.write "event: datastar-merge-signals\ndata: signals {count: #{new_count}}\n\n"
  ensure
    response.stream.close
  end
end
```

## STEP 4: The Real-Time Win

Because Datastar is built on SSE, you can keep the connection open and "push" updates as many times as you want. 

Imagine a background job is processing an image. You can keep the `increment` method open and send:
*   `data: signals {status: 'Processing...'}`
*   Wait 2 seconds...
*   `data: signals {status: 'Done!', progress: 100}`

The browser will update the UI every time a new line is sent from Ruby, without the user ever clicking anything again.

## Why try this over Hotwire?

1.  **Fine-grained control:** You can update individual variables (Signals) inside an HTML element without re-rendering the whole element.
2.  **No WebSocket Overhead:** SSE is just plain HTTP. It works perfectly with standard load balancers and doesn't require "Sticky Sessions" or complex Redis setups (though Rails 8 `Solid Cable` helps with that!).
3.  **Client-side logic:** You get a little bit of client-side state (`data-signals`) for things like toggling menus or form validation without needing to write a full Stimulus controller.

## Summary

Datastar is perfect for the **"Pragmatic Solo Developer"** who wants real-time features but finds ActionCable or heavy JS frameworks a bit too much. 

It keeps the logic in Ruby, uses the browser's native streaming capabilities, and results in a UI that feels incredibly snappy. If you are starting a new project this weekend, give Datastar a look-it might just become your new favorite tool in the hypermedia stack.