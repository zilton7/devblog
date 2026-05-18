---
title: "Rails 8 Built-in Auth vs. Devise: Why the Default Finally Wins"
categories: selfnote
tags: [rails, ruby, security, webdev]
image:
 path: /assets/images/2026-05-18-Rails-8-Built-In-Auth-Vs-Devise-Why-The-Default-Finally-Wins/feature.webp
---

For almost 15 years, if you wanted to build a Rails app with a login system, the answer was always the same: **Devise**. 

Devise is a legend. It is battle-tested, secure, and handles everything from "Forgot Password" to "Account Locking." But Devise also comes with a heavy price. It is a "black box" of magic. If you want to change the way a simple login redirect works, you often find yourself digging through 10 layers of documentation and overriding internal controllers that you don't even own.

With the release of **Rails 8**, the game has changed. Rails now has a built-in authentication generator. It isn't a "gem" that hides code from you; it is a tool that writes clean Ruby code directly into your app.

Here is why Rails 8 authentication is finally better than Devise for the solo developer.

## 1. Ownership vs. Magic

When you install Devise, you are adding a massive dependency. The logic for signing in, signing out, and sessions lives inside the gem’s folder, not your app.

In Rails 8, you run one command:

```bash
rails generate authentication
```

This command generates a `Session` model, a `SessionsController`, and an `Authenticated` concern. **The code lives in your `app/` folder.** 

If you want to change how the login works, you don't have to look up "Devise overrides." You just open `app/controllers/sessions_controller.rb` and change the code. There is no magic - just plain Ruby.

## 2. No More "Gem Bloat"

Devise is heavy. It brings in several other dependencies (like Warden) and adds a lot of routes and helpers to your app that you probably don't use. 

As a solo developer building a "One-Person Framework" app, you want your stack to be as lean as possible. Rails 8 auth uses what is already built into the framework: `has_secure_password`. 

It uses the standard Rails way of handling cookies and sessions. Because it is native, it works perfectly with **Turbo** and **Mission Control** without any extra configuration.

## 3. Rate Limiting is Built-In

One reason people stuck with Devise was for security features like "Lockable" (preventing brute force attacks).

Rails 8 handles this at the routing level. The generator automatically adds rate limiting to your login actions:

```ruby
# app/controllers/sessions_controller.rb
class SessionsController < ApplicationController
  # This stops bots from trying 1,000 passwords a minute
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_session_url, alert: "Try again later." }

  def create
    if user = User.authenticate_by(params.permit(:email_address, :password))
      start_new_session_for user
      redirect_to after_authentication_url
    else
      redirect_to new_session_url, alert: "Try again."
    end
  end
end
```

You get professional-grade security without the overhead of a massive external library.

## 4. Easy to Upgrade to Passkeys

[As I wrote in a previous article](https://norvilis.com/killing-the-password-how-to-add-passkeys-to-your-rails-8-app/), passwords are dying. In 2026, users want to log in with **FaceID or TouchID (Passkeys)**. 

Upgrading Devise to support Passkeys is a nightmare because you have to fight Devise's internal session handling. 

Because the Rails 8 auth code is just a regular controller, adding Passkeys is simple. You just add a few lines to your `SessionsController` to verify the hardware signature. You don't have to ask a gem for permission to change how your users log in.

## Summary: Which one should you pick?

*   **Stick with Devise** if you are working on a massive legacy app that already uses it, or if you need very complex features like "Omniauth with 10 different providers" and don't want to write any code.
*   **Use Rails 8 Auth** for every new project. 

The "generator" approach is the ultimate win for the solo developer. It gives you a secure starting point, but lets you keep total control over the most important part of your app: the gateway to your users.