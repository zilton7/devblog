---
title: "The Shopify Goldmine: How to Build Your First App in Rails"
categories: selfnote
tags: [rails, shopify, ruby, webdev]
image:
 path: /assets/images/2026-08-07-The-Shopify-Goldmine-How-To-Build-Your-First-App-In-Rails/feature.webp
---

If you know Ruby on Rails, you are already sitting on a goldmine. 

Shopify is one of the biggest e-commerce platforms in the world, and here is a secret: **Shopify was built with Rails.** Because of this, the Shopify ecosystem is incredibly friendly to Rails developers. 

Building a Shopify app is basically building a standard Rails app that lives inside another website's dashboard. It is a fantastic way for a solo developer to make passive income because Shopify handles the customers, the billing, and the marketing for you.

Here is the quickest way to build your first Shopify app as a complete beginner.

## STEP 1: The Partner Account

Before you write any code, you need to join the club. 
1.  Go to the [Shopify Partners](https://partners.shopify.com/) website and create a free account.
2.  Create a "Development Store." This is a fake online store where you can install your app for free to test it.

## STEP 2: The Shopify App Gem

We don't build the connection to Shopify from scratch. Shopify provides an official gem that handles all the complex "handshake" logic (OAuth) for us.

Add this to your `Gemfile`:

```ruby
gem 'shopify_app'
```
Run `bundle install`.

Now, run the Shopify generator. This will turn your boring Rails app into a Shopify-ready engine:

```bash
rails generate shopify_app
```

This command will ask you for your **API Key** and **Secret Key**. You can find these in your Shopify Partner Dashboard under your App settings.

## STEP 3: Connecting Your Laptop (The Tunnel)

This is where beginners usually get stuck. Shopify needs to talk to your Rails app, but your Rails app is currently hidden inside your laptop (`localhost`). 

Shopify cannot see your laptop. You need to create a "Tunnel" to the internet. 

The Shopify CLI comes with a built-in tunnel tool. Run this in your terminal:
```bash
shopify app dev
```

This will give you a public URL like `https://random-words.cloudflare.com`. Copy this URL and paste it into the "App Setup" section of your Shopify Partner Dashboard. Now, Shopify can finally send data to your Rails code.

## STEP 4: Building the UI (Polaris)

When a shop owner opens your app, they expect it to look like Shopify. They don't want to see a custom "bootstrap" design. 

Shopify uses a design system called **Polaris**. In a previous article, I mentioned the `polaris_view_components` gem. This is the best way to make your app look professional instantly.

```erb
<!-- app/views/home/index.html.erb -->
<%= render Polaris::Page.new(title: "My Discount Tool") do %>
  <%= render Polaris::Card.new(sectioned: true) do %>
    <p>Welcome! This app will help you manage your store better.</p>
    <%= render Polaris::Button.new(primary: true) { "Create Discount" } %>
  <% end %>
<% end %>
```

With just a few lines of Ruby, your app now looks like a multi-million dollar software product.

## STEP 5: Webhooks (The "Listening" Ear)

This is the most important concept in Shopify apps. A "Webhook" is Shopify calling your app to say: *"Hey, a customer just bought something!"* or *"Hey, the store owner just deleted a product!"*

The `shopify_app` gem handles this for you. You just define which events you want to listen to in `config/initializers/shopify_app.rb`:

```ruby
config.webhooks = [
  { topic: 'orders/create', address: 'https://your-tunnel.com/webhooks/orders_create' }
]
```

Then, you create a simple background job (using **Solid Queue**) to process the data when the order comes in.

## Summary

Building a Shopify app is the ultimate "One-Person Framework" project. 
1.  **Rails** handles the logic.
2.  **Shopify App Gem** handles the security.
3.  **Polaris** handles the design.
4.  **Shopify App Store** handles the customers.

If you have a weekend and a good idea for a small store utility, you can have an app live and potentially making money by Monday morning.