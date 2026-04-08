---
title: "AdonisJS vs Ruby on Rails: Which MVC Framework Wins?"
categories: selfnote
tags: [rails, nodejs, javascript, webdev]
image:
 path: /assets/images/2026-04-09-Adonisjs-Vs-Ruby-On-Rails-Which-Mvc-Framework-Wins/feature.webp
---

Very often I see JavaScript developers getting tired of building backend APIs with Express.js. Express is incredibly fast, but it has zero structure. You have to figure out where to put your routes, how to connect to the database, and how to handle authentication completely by yourself.

Eventually, these developers discover **AdonisJS**. 

Adonis is literally famous for being the "Ruby on Rails of Node.js". It gives you a beautiful MVC (Model-View-Controller) structure, an ORM for the database, and everything comes pre-configured. It is, without a doubt, the best backend framework in the JavaScript ecosystem.

But if it is so good, why do I still use Ruby on Rails in 2026? 

I have built projects with both. While Adonis is a massive upgrade for Node.js developers, here is my honest breakdown of why Rails is still the ultimate tool for getting things done.

## 1. The Language: Ruby vs TypeScript

AdonisJS is built entirely with TypeScript. For a lot of people, this is a huge plus. TypeScript catches errors before you even run your code, which is great for massive teams.

But for a solo developer or a small startup, TypeScript can feel like wearing handcuffs. You have to define types, write interfaces, and constantly satisfy the compiler. It slows down your prototyping.

Ruby, on the other hand, was built for **Developer Happiness**. It is expressive and reads almost like plain English. 

```ruby
# ruby
3.days.ago
users.map(&:name)
if user.active? && user.subscribed?
```

When I write Ruby, I feel like I am just writing down my thoughts. When I write TypeScript, I feel like I am filling out legal paperwork.

## 2. The ORM: ActiveRecord vs Lucid

Adonis comes with a fantastic ORM called **Lucid**. It is heavily inspired by Rails and Laravel. It handles migrations, models, and relationships very well.

```typescript
// adonis (TypeScript)
const users = await User.query()
  .where('is_active', true)
  .orderBy('created_at', 'desc')
```

It is very good. But **ActiveRecord** in Rails is simply magic. It has been polished for over 20 years. The sheer amount of built-in features, scopes, and association helpers in ActiveRecord makes querying the database effortless. 

```ruby
# rails
@users = User.active.order(created_at: :desc)
```

Plus, Rails handles database migrations slightly better. If you need to roll back a migration, Rails almost always knows how to reverse it automatically. In Adonis, you often have to write the "up" and "down" logic manually.

## 3. The Frontend Setup

AdonisJS pairs beautifully with **Inertia.js** (which lets you build your frontend in React, Vue, or Svelte without an API). If you love the Javascript ecosystem, this is a dream setup.

But it still means you have a complex build step. You still have a `package.json` file with 50 dependencies. You still have to wait for Vite or Webpack to compile your frontend code.

Rails 8 takes a completely different path. With **Hotwire** and **Importmaps**, Rails eliminates the build step entirely. 

You write standard HTML (ERB) views, and Hotwire makes the page feel as fast as a React app without writing any custom JavaScript. If you want to add a library, you just pin it with Importmaps. Your computer's hard drive isn't clogged with massive `node_modules` folders, and your app boots instantly.

## 4. The Ecosystem and "The Rails Way"

The NPM (Node Package Manager) registry is huge. You can find a package for literally anything. 
The problem? A lot of NPM packages are tiny, abandoned, or don't play nicely together. 

In the Ruby world, gems are usually built specifically for Rails. 
*   Need authentication? Use `devise` or `has_secure_password`. 
*   Need an admin panel? Use `avo`.
*   Need background jobs? Rails 8 has `solid_queue` built right in.

Because Rails enforces "The Rails Way" (Convention over Configuration), almost every gem plugs into your app perfectly. You don't have to waste a weekend writing glue code to make a library work with your framework. 

## Summary: Which one should you use?

I have a lot of respect for AdonisJS. It brings much-needed sanity to the chaotic Node.js world. 

*   **Choose AdonisJS** if you already know TypeScript, you absolutely love React/Vue, and you want to use a single language (Javascript) across your entire stack. It is the best choice in the Node ecosystem.
*   **Choose Ruby on Rails** if you value your time above everything else. If you are a solo founder, an indie hacker, or you just want to take an idea and turn it into a profitable product as fast as humanly possible, Rails is still undefeated. 

I tried the "Rails of Node", but it turns out, I just prefer the real thing.