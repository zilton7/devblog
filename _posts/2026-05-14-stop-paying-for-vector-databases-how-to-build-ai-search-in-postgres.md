---
title: "Stop Paying for Vector Databases: How to Build AI Search in Postgres"
categories: selfnote
tags: [rails, ai, database, postgresql]
image:
 path: /assets/images/2026-05-14-Stop-Paying-For-Vector-Databases-How-To-Build-Ai-Search-In-Postgres/feature.webp
---

I see developers trying to build "AI Chatbots" that know about their specific company data. They want the AI to read their PDFs, their internal wikis, or their past customer support tickets, and answer questions based on that data. 

This technique is called **RAG** (Retrieval-Augmented Generation).

When the AI hype first started, developers thought they had to pay for expensive, dedicated "Vector Databases" like Pinecone or Milvus to do this. They added a massive layer of complexity to their stack just to store some AI data.

In 2026, the Rails way to do this is much simpler. **You just use PostgreSQL.**

By using the `pgvector` extension and a brilliant Ruby gem called `neighbor`, you can keep all your AI data perfectly synced inside your standard Rails database. You get the power of RAG without leaving the comfort of ActiveRecord.

Here is exactly how to build "Chat with your Database" in 4 steps.

## The Mental Model: What are Embeddings?

Before we code, you need to understand how AI "searches" text. 

AI does not read words; it reads math. When you send a paragraph of text to an AI (like OpenAI's embedding model), it returns an **Embedding** - a massive array of 1,536 numbers. 

Think of this array as a set of coordinates on a map. Paragraphs that talk about similar things are placed closer together on this map. To search for an answer, we turn the user's question into coordinates, and ask the database: *"Which paragraphs are physically closest to this question on the map?"*

## STEP 1: The Database Setup

First, we need to tell PostgreSQL that it is allowed to store these massive arrays of numbers. We do this by enabling the `vector` extension.

Add the gems to your `Gemfile`:
```ruby
gem 'ruby-openai' # To talk to ChatGPT
gem 'neighbor'    # To add vector search to ActiveRecord
```
Run `bundle install`.

Next, generate a migration to enable the extension and add a vector column to the table we want to search (let's use a `Document` model).

```bash
rails g migration AddEmbeddingsToDocuments
```

```ruby
# db/migrate/20260506120000_add_embeddings_to_documents.rb
class AddEmbeddingsToDocuments < ActiveRecord::Migration[8.0]
  def change
    # 1. Enable the Postgres extension
    enable_extension "vector"

    # 2. Add the column. OpenAI's standard models output 1536 dimensions.
    add_column :documents, :embedding, :vector, limit: 1536
  end
end
```
Run `rails db:migrate`. 

Now, open your model and tell the `neighbor` gem to track that column:

```ruby
# app/models/document.rb
class Document < ApplicationRecord
  has_neighbors :embedding
end
```

## STEP 2: Generating the Embeddings

When a user creates a new Document in your app, we need to turn its text into an embedding and save it to the database. *(Note: Because API calls are slow, you should do this in a Solid Queue background job!)*

```ruby
# app/services/embedding_service.rb
class EmbeddingService
  def self.generate(document)
    client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])
    
    response = client.embeddings(
      parameters: {
        model: "text-embedding-3-small",
        input: document.content
      }
    )
    
    # Extract the array of 1536 floats
    vector = response.dig("data", 0, "embedding")
    
    # Save it directly to our Postgres column
    document.update!(embedding: vector)
  end
end
```

## STEP 3: The Vector Search (Finding the Context)

Now for the magic. A user asks a question: *"What is our company's refund policy?"*

First, we must turn their question into a vector using the exact same OpenAI model. Then, we use the `neighbor` gem's `.nearest_neighbors` method to search Postgres.

```ruby
# app/services/rag_search_service.rb
class RagSearchService
  def self.search(question)
    client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])
    
    # 1. Turn the question into coordinates
    question_vector = client.embeddings(
      parameters: { model: "text-embedding-3-small", input: question }
    ).dig("data", 0, "embedding")
    
    # 2. Ask Postgres to find the 3 closest documents
    # "inner_product" is the fastest distance metric for OpenAI embeddings
    relevant_docs = Document.nearest_neighbors(:embedding, question_vector, distance: "inner_product").limit(3)
    
    relevant_docs
  end
end
```

Because of the `neighbor` gem, searching vectors feels exactly like a standard ActiveRecord query!

## STEP 4: The RAG Prompt

We have the user's question, and we have the 3 documents that contain the answer. Now, we just smash them together into one giant prompt and send it to ChatGPT to generate a human-sounding response.

```ruby
# app/controllers/chats_controller.rb
class ChatsController < ApplicationController
  def create
    user_question = params[:question]
    
    # 1. Get the relevant data from Postgres
    docs = RagSearchService.search(user_question)
    
    # 2. Build the context string
    context = docs.map(&:content).join("\n\n---\n\n")
    
    # 3. Build the RAG Prompt
    system_prompt = <<~PROMPT
      You are a helpful company assistant. Answer the user's question 
      using ONLY the context provided below. If the answer is not in 
      the context, say "I don't know."
      
      CONTEXT:
      #{context}
    PROMPT
    
    # 4. Ask the AI
    client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])
    response = client.chat(
      parameters: {
        model: "gpt-4o",
        messages:[
          { role: "system", content: system_prompt },
          { role: "user", content: user_question }
        ]
      }
    )
    
    @answer = response.dig("choices", 0, "message", "content")
    
    # Render your Hotwire view here...
  end
end
```

## Summary

The entire multi-billion dollar "RAG" industry boils down to this incredibly simple pipeline:

1. Text -> OpenAI -> Numbers (Saved in Postgres).
2. Question -> OpenAI -> Numbers.
3. Find closest Numbers in Postgres using `neighbor`.
4. Send Question + Found Text -> OpenAI -> Final Answer.

By leveraging `pgvector` and ActiveRecord, we avoid adding a completely new piece of infrastructure to our stack. Your AI data lives right next to your user data, it is backed up together, and it is queried using the same Ruby syntax you already know and love.

The "One Person Framework" strikes again.