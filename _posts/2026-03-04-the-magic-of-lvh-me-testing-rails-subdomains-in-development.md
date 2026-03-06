---
title: "The Magic of lvh.me: Testing Rails Subdomains in Development"
categories: selfnote
tags: [rails, webdev, productivity, devops]
image:
  path: /assets/images/2026-03-04-The-Magic-Of-Lvh-Me-Testing-Rails-Subdomains-In-Development/feature.webp
---

## The `/etc/hosts` Headache
If you are building a SaaS that uses subdomains (like `app.mysite.com` or `tenant.mysite.com`), testing them locally is usually a pain. 

The traditional way is to edit your `/etc/hosts` file:
```text
127.0.0.1  mysite.local
127.0.0.1  app.mysite.local
```
This is tedious, requires sudo privileges, and you have to remember to do it for every new tenant or project.

**There is a better way.** It’s called `lvh.me`.

## What is lvh.me?
`lvh.me` (Local Virtual Host) is a free service that simply points its DNS "A" record to `127.0.0.1`.

Because it is a real registered domain name, it supports **wildcards**. This means:
*   `lvh.me` points to `127.0.0.1`
*   `app.lvh.me` points to `127.0.0.1`
*   `any-thing-you-want.lvh.me` points to `127.0.0.1`

You don't have to install anything. You don't have to configure any DNS. It just works.

## Step 1: The Rails Security Barrier
Since Rails 6, there is a security feature that blocks "Host Header Attacks." If you try to visit `http://lvh.me:3000` right now, Rails will show you a "Blocked Host" error page.

You need to whitelist the domain in your development configuration:

```ruby
# config/environments/development.rb

# Allow the main domain and all subdomains
config.hosts << ".lvh.me"
```
*Note the dot before `lvh.me` - this is the wildcard that allows any subdomain.*

## Step 2: Accessing your App
Restart your Rails server. Now, instead of `localhost:3000`, open your browser and go to:

`http://lvh.me:3000`

If you want to test your subdomain logic:

`http://app.lvh.me:3000`
`http://blog.lvh.me:3000`

## Step 3: Handling Subdomains in Code
If you are using the routing constraints we discussed in the previous article, Rails will now correctly identify the subdomain.

You can test this in your controller:
```ruby
class ApplicationController < ActionController::Base
  before_action :check_subdomain

  def check_subdomain
    puts "Current subdomain: #{request.subdomain}"
  end
end
```

## Step 4: Session & Cookie Sharing
If you need to stay logged in while moving between `lvh.me` and `app.lvh.me`, ensure your session store is configured to handle the domain correctly:

```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store, 
  key: '_your_app_session', 
  domain: :all,
  tld_length: 2 # This is important for lvh.me
```
**Why `tld_length: 2`?** 
Standard Rails assumes a TLD like `.com` or `.org` (length 1). Since `lvh.me` has two parts, you tell Rails to look two levels deep to find the "root" domain.

## Bonus: SSL with Puma-dev
If your app *requires* HTTPS locally (for example, if you are testing Stripe webhooks or Secure Cookies), `lvh.me` might not be enough because it doesn't provide an SSL certificate for your local machine.

In that case, look into **Puma-dev**. It acts as a local DNS server and provides a self-signed SSL certificate for `.test` domains. But for 90% of development work, `lvh.me` is the fastest "zero-config" solution.

## Summary
1.  Stop manually editing `/etc/hosts`.
2.  Add `config.hosts << ".lvh.me"` to your development config.
3.  Use any subdomain you want instantly.

***

*Do you use lvh.me or do you prefer puma-dev? Share your local setup tips below! 👇*