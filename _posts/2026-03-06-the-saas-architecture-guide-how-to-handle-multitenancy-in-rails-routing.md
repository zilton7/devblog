---
title: "The SaaS Architecture Guide: How to Handle Multitenancy in Rails Routing"
categories: selfnote
tags: [rails, ruby, architecture, webdev]
image:
  feature: /assets/images/2026-03-06-The-Saas-Architecture-Guide-How-To-Handle-Multitenancy-In-Rails-Routing/feature.webp
---

Most Rails developers stop learning routing after `resources :posts`.

But if you are building a SaaS platform, an API, or a multi-tenant application, `resources` isn't enough. You need to control **who** enters your application and **where** they land before a Controller is even instantiated.

This is the power of **Routing Constraints**. It is the bouncer at the door of your application. Here is how to use it like a pro.

## Level 1: The Basics (Regex Constraints)
You want `/products/1` to be valid, but `/products/iphone-15` to be invalid (or routed differently).

By default, `:id` accepts anything. You can restrict this using Regex.

```ruby
# config/routes.rb

# Only allow numeric IDs
resources :products, constraints: { id: /\d+/ }

# Allow "slugs" for this specific route
get 'products/:slug', to: 'products#show', constraints: { slug: /[a-z0-9\-]+/ }
```

**Why do this?**
It prevents your database from getting hit with queries that are guaranteed to fail. If a user visits `/products/SELECT * FROM`, the router rejects it immediately (404) without spinning up the controller.

## Level 2: The Subdomain Strategy (Multitenancy)
This is the most common requirement for B2B SaaS apps (e.g., `slack.com` vs `mycompany.slack.com`).

You need to route the "root" domain to your marketing site, and "subdomains" to the actual app.

```ruby
# config/routes.rb

Rails.application.routes.draw do
  # 1. The Tenant App (subdomain present, and it's NOT 'www')
  constraints ->(req) { req.subdomain.present? && req.subdomain != "www" } do
    scope module: 'tenant' do
      root to: "dashboard#show", as: :tenant_root
      resources :projects
    end
  end

  # 2. The Marketing Site (no subdomain or 'www')
  root to: "pages#home"
  get "pricing", to: "pages#pricing"
end
```

**What just happened?**
*   **`scope module: 'tenant'`**: This tells Rails to look for controllers inside `app/controllers/tenant/`. This keeps your code clean: `Tenant::DashboardController` is separate from `PagesController`.

## Level 3: The "Admin Gate" (Request-Based)
You installed Sidekiq or GoodJob. They come with a web dashboard mounted at `/sidekiq`.
**Problem:** You don't want the public to see it.
**Solution:** Use a constraint to check the user session *inside the router*.

```ruby
# config/routes.rb
require 'sidekiq/web'

# Define a class for the logic (Cleaner than a lambda)
class AdminConstraint
  def matches?(request)
    # 1. Get the user ID from the session cookie
    return false unless request.session[:user_id]
    
    # 2. Check the DB (Cache this if possible!)
    user = User.find(request.session[:user_id])
    user && user.admin?
  end
end

Rails.application.routes.draw do
  mount Sidekiq::Web => '/sidekiq', constraints: AdminConstraint.new
end
```

**Note:** For this to work, the route must have access to the `session` middleware. In Rails 7/8 API-only mode, you might need to re-enable session middleware for this specific functionality.

## Level 4: API Versioning (Header Constraints)
If you are building a mobile app backend, you will eventually break your API. You need `v1` and `v2` to coexist.
Don't put version logic in the URL (`/api/v1/...`). Put it in the **Headers**.

```ruby
# lib/constraints/api_version.rb
class ApiVersion
  def initialize(version:, default: false)
    @version = version
    @default = default
  end

  def matches?(request)
    # Check for "Accept: application/vnd.myapp.v1+json"
    @default || request.headers['Accept']&.include?("application/vnd.myapp.#{@version}")
  end
end
```

```ruby
# config/routes.rb
Rails.application.routes.draw do
  scope module: :v2, constraints: ApiVersion.new(version: 'v2', default: true) do
    resources :products
  end

  scope module: :v1, constraints: ApiVersion.new(version: 'v1', default: false) do
    resources :products
  end
end
```

**Why is this better?**
The URL stays clean (`/products`). The client simply changes a header to switch versions.

## Level 5: Segment Constraints (Advanced)
Sometimes you want a route to match *only* if a certain condition in the URL is met, but it's dynamic.

Example: You are building a blog platform.
*   `domain.com/rails` -> Shows the "Rails" category.
*   `domain.com/2026` -> Shows the "2026" archive.

These look the same to the router (`/:slug`). You can disambiguate them with a constraint that checks against a known list.

```ruby
class ArchiveConstraint
  def matches?(request)
    year = request.path_parameters[:slug]
    year.match?(/^\d{4}$/) # Is it a 4-digit number?
  end
end

Rails.application.routes.draw do
  get ':slug', to: 'archives#show', constraints: ArchiveConstraint.new
  get ':slug', to: 'categories#show' # Fallback
end
```

## Summary: The "Router First" Philosophy
The Router is not just a map; it is a firewall.

1.  **Regex:** Stop bad data early.
2.  **Subdomains:** Separate your marketing site from your app logic.
3.  **Classes:** Extract complex logic (Admin checks, API versions) into Ruby classes in `lib/constraints`.

By moving logic out of your controllers and into the router, your app becomes more secure, faster, and easier to read.

***

*Do you use subdomains in your app? How do you handle local testing? (Hint: `lvh.me`) Let me know in the comments! 👇*