---
title: "Background AI: Using Solid Queue for Slow OpenAI API Calls"
categories: selfnote
tags: [rails, ai, backgroundjobs, hotwire]
image:
 path: /assets/images/2026-05-13-Background-Ai-Using-Solid-Queue-For-Slow-Openai-Api-Calls/feature.webp
---

Very often I see developers integrating AI into their Rails apps for the first time, and they make a critical mistake that completely destroys their server performance.

They treat the OpenAI (or Anthropic) API like a regular database query. They put the API call directly inside their controller.

```ruby
# The "Server Killer" Approach
def create
  @document = Document.find(params[:id])
  
  # This might take 15 seconds!
  response = OpenAiClient.generate_summary(@document.text)
  
  @document.update(summary: response)
  redirect_to @document
end
```

When you do this, the Puma web thread handling that user's request **freezes**. It sits there doing absolutely nothing for 15 seconds while it waits for the AI to respond. If you have 5 users asking for summaries at the same time, your entire server will lock up. No one else will be able to load your website. The browser might even time out and show an error page.

AI calls are slow. You **must** put them in the background.

In 2026, Rails 8 makes this ridiculously easy because we have **Solid Queue** built-in. We don't need to install Redis. We just use our existing PostgreSQL database. Here is how to move your AI calls to the background and use Hotwire to update the user's screen in real-time.

## STEP 1: The Empty State View

When a user clicks "Generate Summary", we want the page to load instantly. We will show them a loading spinner while the AI thinks in the background.

To do this, we need to set up a Hotwire listener (`turbo_stream_from`) on our document page.

```erb
<!-- app/views/documents/show.html.erb -->
<h1><%= @document.title %></h1>

<!-- 1. Listen for WebSocket broadcasts attached to this specific document -->
<%= turbo_stream_from @document %>

<!-- 2. The target div that we will update later -->
<div id="<%= dom_id(@document, :summary) %>">
  
  <% if @document.summary.present? %>
    <p><%= @document.summary %></p>
  <% else %>
    <p class="text-gray-500 animate-pulse">🤖 AI is generating your summary...</p>
  <% end %>

</div>
```

## STEP 2: The Fast Controller

Now, we update our controller. Instead of calling the AI, we just tell our background queue to handle it, and we immediately render the page. 

```ruby
# app/controllers/summaries_controller.rb
class SummariesController < ApplicationController
  def create
    @document = Document.find(params[:document_id])
    
    # Send the heavy lifting to Solid Queue!
    GenerateSummaryJob.perform_later(@document.id)
    
    # Instantly redirect back to the show page
    redirect_to @document, notice: "Summary is generating..."
  end
end
```
Your controller now executes in `0.02` seconds instead of 15 seconds. Your server is happy.

## STEP 3: The Solid Queue Job

Now we create the actual job that will run in the background. 

```bash
rails generate job generate_summary
```

Inside this job, we make the slow API call, save the result to the database, and then broadcast the new HTML over WebSockets so the user's screen updates without them refreshing the page.

```ruby
# app/jobs/generate_summary_job.rb
class GenerateSummaryJob < ApplicationJob
  queue_as :default

  def perform(document_id)
    document = Document.find(document_id)
    
    # 1. The Slow API Call (Takes 10-15 seconds)
    client = OpenAI::Client.new(access_token: ENV['OPENAI_ACCESS_TOKEN'])
    response = client.chat(
      parameters: {
        model: "gpt-4o",
        messages:[{ role: "user", content: "Summarize this: #{document.text}" }]
      }
    )
    
    summary_text = response.dig("choices", 0, "message", "content")
    
    # 2. Save to database
    document.update!(summary: summary_text)
    
    # 3. The Hotwire Magic: Broadcast the new HTML to the user!
    Turbo::StreamsChannel.broadcast_replace_to(
      document, # Matches the turbo_stream_from in our view
      target: "document_#{document.id}_summary", # The ID of the div to replace
      partial: "documents/summary", # A partial containing the final text
      locals: { document: document }
    )
  end
end
```

## STEP 4: The Broadcast Partial

In the job above, we told Hotwire to render a partial called `documents/summary`. Let's create that tiny file so Hotwire knows what HTML to send over the WebSocket.

```erb
<!-- app/views/documents/_summary.html.erb -->
<div id="<%= dom_id(document, :summary) %>">
  <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
    <h3 class="font-bold text-green-800">AI Summary Complete:</h3>
    <p><%= document.summary %></p>
  </div>
</div>
```

## Summary

This is the ultimate workflow for the modern AI application. Look at what we achieved without writing a single line of custom JavaScript:

1. **User Experience:** The user clicks a button and gets instant feedback (the loading state). They don't stare at a frozen browser.
2. **Server Health:** The Puma web server is free to handle hundreds of other users because the 15-second AI wait time is offloaded to a background worker.
3. **Simplicity:** Because of Rails 8 and Solid Queue, we don't have to manage Redis servers or complex infrastructure. The jobs live right in our standard database.
4. **Real-Time UI:** Hotwire securely pushes the finished HTML directly into the user's browser the exact millisecond the AI finishes thinking.

If you are building AI wrappers, this exact pattern is your blueprint for success.