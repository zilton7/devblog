---
title: "Killing the Password: How to Add Passkeys to Your Rails 8 App"
categories: selfnote
tags: [rails, security, webdev, authentication]
image:
 path: /assets/images/2026-05-10-Killing-The-Password-How-To-Add-Passkeys-To-Your-Rails-8-App/feature.webp
---

Very often I see users struggling with the absolute worst part of the internet: **Passwords**. 

They forget them. They use "Password123" and get hacked. They get annoyed when your app forces them to include a special character and an uppercase letter. As a solo developer, building "Forgot Password" flows and dealing with compromised accounts is a massive waste of time.

In 2026, the industry is finally killing the password. Apple, Google, and Microsoft have all standardized **Passkeys** (WebAuthn). 

This means your users can log into your Rails app using their laptop's TouchID, FaceID, or Windows Hello. It is incredibly secure (phishing-proof) and the UX is magical. 

Adding this to a Rails app sounds terrifying because cryptography is hard. But thanks to the `webauthn` gem, we can implement it without needing a PhD in math. Here is the step-by-step guide to adding Passkeys to your Rails app.

## The Mental Model: How Passkeys Work

Before we write code, you must understand the flow. It is a simple two-step dance:
1. **The Challenge:** Your Rails server generates a random string of gibberish (a "challenge") and sends it to the browser.
2. **The Signature:** The browser asks the user for their fingerprint. The hardware securely signs the gibberish and sends it back. Rails verifies the signature. 

You never store a password. You only store a Public Key.

## STEP 1: The Database Setup

We need to store the devices (Passkeys) that the user registers. A user can have many passkeys (e.g., their iPhone and their Macbook).

First, our `User` model needs a unique, random ID for WebAuthn.
```bash
rails g migration AddWebauthnIdToUsers webauthn_id:string:uniq
```

Second, we need a model to store the actual Passkey hardware devices.
```bash
rails g model Passkey user:references external_id:string:uniq public_key:string sign_count:integer
rails db:migrate
```

*Note: Ensure your `User` model automatically generates a `webauthn_id` (like `SecureRandom.uuid`) when a new user is created.*

## STEP 2: The Gem and Configuration

Add the official WebAuthn gem to your `Gemfile`:
```ruby
gem 'webauthn'
```
Run `bundle install`.

Now, we need a quick initializer to tell the gem what our website's domain is. 
Create `config/initializers/webauthn.rb`:

```ruby
WebAuthn.configure do |config|
  # This should be your actual production domain
  config.origin = "http://localhost:3000" 
  config.rp_name = "My Awesome SaaS"
end
```

## STEP 3: The Backend Logic (Registration)

When a user wants to register their fingerprint, they click a button. This triggers a request to our controller.

We need two actions: one to generate the "Challenge", and one to verify the "Response" the browser sends back.

```ruby
# app/controllers/passkeys_controller.rb
class PasskeysController < ApplicationController
  # 1. Generate the options and the challenge
  def create_options
    options = WebAuthn::Credential.options_for_create(
      user: { 
        id: current_user.webauthn_id, 
        name: current_user.email 
      }
    )

    # We must save the challenge in the session so we can verify it later
    session[:creation_challenge] = options.challenge

    render json: options
  end

  # 2. Verify the fingerprint response
  def create
    webauthn_credential = WebAuthn::Credential.from_create(params[:credential])

    begin
      webauthn_credential.verify(session[:creation_challenge])

      # If it passes, save the public key to the database!
      current_user.passkeys.create!(
        external_id: webauthn_credential.id,
        public_key: webauthn_credential.public_key,
        sign_count: webauthn_credential.sign_count
      )

      render json: { status: "ok" }
    rescue WebAuthn::Error => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end
end
```

## STEP 4: The Javascript (Stimulus)

This is usually where developers get stuck. The native browser API for WebAuthn expects raw binary data (ArrayBuffers), but Rails sends JSON. 

To make this perfectly smooth, GitHub created a tiny wrapper library that handles the conversion. We pin it using Importmaps:

```bash
bin/importmap pin @github/webauthn-json
rails g stimulus passkey
```

Now we write a clean Stimulus controller. It fetches the options from Rails, asks the browser for the fingerprint, and sends the result back.

```javascript
// app/javascript/controllers/passkey_controller.js
import { Controller } from "@hotwired/stimulus"
import { create, get } from "@github/webauthn-json"

export default class extends Controller {
  
  async register() {
    // 1. Get the challenge from our Rails controller
    const response = await fetch('/passkeys/create_options', { method: 'POST' })
    const options = await response.json()

    try {
      // 2. This triggers the MacOS TouchID / Windows Hello popup!
      const credential = await create({ publicKey: options })

      // 3. Send the hardware signature back to Rails
      const verifyResponse = await fetch('/passkeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credential })
      })

      if (verifyResponse.ok) {
        alert("Passkey registered successfully!")
      }
    } catch (error) {
      console.error("Passkey registration failed", error)
    }
  }
}
```

In your view, you just add a button:
```erb
<div data-controller="passkey">
  <button data-action="click->passkey#register">
    Register Fingerprint / FaceID
  </button>
</div>
```

## What about Logging In?

The login flow is exactly the same concept, just using `options_for_get` instead of `options_for_create`. 

1. User types their email.
2. Rails generates a login challenge.
3. Stimulus calls `get({ publicKey: options })` which prompts TouchID.
4. Rails verifies the signature, looks up the `Passkey` by its `external_id`, finds the attached `User`, and logs them in!

## Summary

Killing the password entirely might be too aggressive for a brand new startup (you still need a fallback for older devices). But adding Passkeys as an alternative login method makes your app feel incredibly premium.

1. **Security:** No database leaks can expose passwords, because you only store public keys.
2. **UX:** Clicking a button and touching a fingerprint scanner takes 1 second. Typing a 16-character password takes 15 seconds.
3. **The Tools:** By combining `webauthn-ruby`, `@github/webauthn-json`, and Stimulus, we avoid all the painful cryptography math.

Embrace the future. Let your users log in with their faces.