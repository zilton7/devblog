---
title: "Stop Building Ugly Admin Panels: Why Avo is the Future of Rails Admins"
categories: selfnote
tags: [rails, ruby, webdev, productivity]
image:
 path: /assets/images/2026-03-17-Stop-Building-Ugly-Admin-Panels-Why-Avo-Is-The-Future-Of-Rails-Admins/feature.webp
---

## The "Admin Panel" Ticket
We all know the feeling. You are building an exciting new SaaS. The core product is looking great. Then, you look at your backlog and see the ticket you’ve been dreading:

> **Task:** Build Internal Admin Dashboard
> **Reqs:** Need to ban users, refund payments, and view logs.

You have three choices:
1.  **Build it from scratch:** Waste 2 weeks building CRUD controllers and Views instead of working on your product.
2.  **Use ActiveAdmin/RailsAdmin:** Get it done fast, but it looks like it was built in 2011, and customizing it involves learning a weird DSL.
3.  **Use Avo.**

In 2026, **Avo** has firmly established itself as the premier choice for Rails developers who want a professional-grade admin panel without the headache.

## What is Avo?
[Avo](https://avohq.io/) is a framework for building admin panels in Ruby on Rails.

Unlike the "No-Code" tools that try to connect to your database externally (Retool, Forest Admin), Avo lives **inside your Rails app**. It knows your models, your policies, and your database schema.

It basically gives you a superpower: **"I need a UI for this Model"** becomes a 30-second task.

## Why it beats the "Dinosaurs" (ActiveAdmin)
I used ActiveAdmin for years. It is a legendary gem. But let’s be honest: styling it is painful, and writing `Arbre` (its XML-like Ruby syntax) feels alien.

Avo is different because:
1.  **It uses standard Rails concepts:** You configure resources using simple Ruby classes.
2.  **It is beautiful by default:** It is built with Tailwind CSS. It supports Dark Mode, responsive layouts, and modern interactions out of the box.
3.  **It doesn't hide the Rails:** If you need to customize a view, you just use ERB/Phlex and standard Rails helpers.

## How it Works
To add an admin interface for your `User` model, you simply run:

```bash
rails generate avo:resource User
```

This creates a resource file. You define what fields you want to show:

```ruby
# app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
  self.title = :name
  self.search_query = -> { scope.ransack(id_eq: params[:q], name_cont: params[:q], m: "or").result(distinct: false) }

  def fields
    field :id, as: :id
    field :avatar, as: :file, is_image: true, as_avatar: true
    field :name, as: :text
    field :email, as: :text
    field :is_admin, as: :boolean
    field :posts, as: :has_many
    
    # Modern fields built-in!
    field :bio, as: :trix # Rich Text Editor
    field :code, as: :code # Syntax highlighting
  end
end
```

**That’s it.** 
You now have a fully functional CRUD interface with search, pagination, filtering, and associations.

## The Killer Features

### 1. Actions (The "Button" Problem)
Usually, admins need to *do* things, not just look at data. "Reset Password," "Mark as Paid," "Export CSV."
Avo handles this with **Actions**. You write a tiny class, and Avo generates a button in the UI that runs your Ruby code safely.

### 2. Dashboards
Managers love charts. Avo has a metric system that lets you drop in "New Users per Day" line charts or "Revenue" value cards with just a few lines of ActiveRecord queries.

### 3. Authorization
It integrates natively with **Pundit**. If your Pundit policy says a user cannot delete a `Post`, the "Delete" button automatically disappears from the Avo UI. You don't have to duplicate logic.

## Community vs. Pro
Avo has a very generous **Community Edition** (Free). It includes all the basic CRUD fields, associations, and grid views. For 90% of indie hackers, this is enough.

The **Pro/Advanced** editions are for teams that need:
*   Advanced fields (Map integration, Trix editor).
*   Resource tools (Custom layouts).
*   Menu editors (RBAC for the sidebar).

This business model is actually a **pro**, not a con. It means the developer (Adrian Marin) is paid to maintain it, ensuring the library won't be abandoned like so many open-source UI kits.

## Summary
If you value your time, stop building admin panels from scratch.
If you value your eyesight, stop using the default ActiveAdmin theme.

Avo makes building internal tools feel like building a product. It’s the "Rails Way" to do admin panels in the modern era.

***

*Have you switched to Avo yet? Or are you sticking with the classics? Let me know in the comments! 👇*