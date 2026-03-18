---
title: "Stripe Connect Simplified: Routing Payments in Your Rails App"
categories: selfnote
tags: [rails, ruby, stripe, webdev]
image:
 path: /assets/images/2026-03-18-Stripe-Connect-Simplified-Routing-Payments-In-Your-Rails-App/feature.webp
---

Building a SaaS where users pay *you* is easy. But what if you want to build a marketplace? Like Airbnb, Fiverr, or a platform where users pay *other users*, and you just take a 10% cut?

Handling payouts, collecting tax documents, and verifying identities (KYC) is a legal nightmare. As a solo developer, you do not want to touch that data.

This is where **Stripe Connect** comes in. It allows you to route money through your platform, take your application fee, and let Stripe handle all the legal paperwork for your sellers. 

Here is how to set up Stripe Connect (Express accounts) in your Rails app in 4 steps.

## The Setup

First, add the Stripe gem to your `Gemfile`:

```ruby
gem 'stripe'
```

Run `bundle install`. Next, you need a place to save the seller's Stripe ID. Let's add it to our User model.

```bash
rails g migration AddStripeAccountIdToUsers stripe_account_id:string
rails db:migrate
```

Initialize Stripe in `config/initializers/stripe.rb`:

```ruby
Stripe.api_key = ENV['STRIPE_SECRET_KEY']
```

## STEP 1: Creating the Connected Account

Before a user can receive money, they need a "Connected Account" linked to your platform. We will use the **Express** account type because Stripe handles the UI, tax forms, and identity verification for us.

Let's create a method in our User model to generate this account.

```ruby
# app/models/user.rb
class User < ApplicationRecord
  def create_stripe_account!
    return if stripe_account_id.present?

    account = Stripe::Account.create({
      type: 'express',
      country: 'US',
      email: self.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    })

    update(stripe_account_id: account.id)
  end
end
```

## STEP 2: The Onboarding Flow

Now that the user has a `stripe_account_id` (it looks like `acct_12345`), they need to actually fill out their bank details. We do not build this form. We redirect them to Stripe.

In your controller, create an **AccountLink**:

```ruby
# app/controllers/stripe_connect_controller.rb
class StripeConnectController < ApplicationController
  def onboard
    current_user.create_stripe_account!

    account_link = Stripe::AccountLink.create({
      account: current_user.stripe_account_id,
      refresh_url: stripe_connect_refresh_url, # If the link expires, send them here
      return_url: dashboard_url,               # Where they go after finishing
      type: 'account_onboarding'
    })

    redirect_to account_link.url, allow_other_host: true
  end
end
```

Add a button in your view: `<%= button_to "Set up Payouts", onboard_stripe_connect_path %>`. When they click it, they go to Stripe, enter their bank info, and get sent back to your app.

## STEP 3: Checking if they are Ready

Just because they came back to your app doesn't mean they finished the form. Maybe they closed the tab early. 

To check if they are fully onboarded and ready to receive money, we ask Stripe if their `charges_enabled` status is true.

```ruby
# app/models/user.rb
class User < ApplicationRecord
  def payouts_ready?
    return false unless stripe_account_id.present?

    account = Stripe::Account.retrieve(stripe_account_id)
    account.charges_enabled
  end
end
```

You can use this method in your views. `if current_user.payouts_ready?` show them their dashboard, `else` show them the "Resume Onboarding" button.

## STEP 4: Taking Your Cut (Destination Charges)

Now for the fun part. A buyer wants to buy a $100 product from your seller. You want to take a $10 application fee and send $90 to the seller.

We use a **Destination Charge** via Stripe Checkout.

```ruby
# app/controllers/checkouts_controller.rb
class CheckoutsController < ApplicationController
  def create
    seller = User.find(params[:seller_id])
    
    session = Stripe::Checkout::Session.create({
      payment_method_types: ['card'],
      line_items:[{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Awesome Product' },
          unit_amount: 100_00, # $100.00 in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      
      # The Magic Connect Code
      payment_intent_data: {
        application_fee_amount: 10_00, # Your $10.00 cut in cents
        transfer_data: {
          destination: seller.stripe_account_id, # The remaining $90 goes here
        }
      }
    })

    redirect_to session.url, allow_other_host: true
  end
end
```

## Summary

That's the core loop of a marketplace!
1. **Create Account:** Generate an `acct_` ID for the user.
2. **Onboard:** Send them to Stripe to enter their bank details.
3. **Verify:** Check if `charges_enabled` is true.
4. **Charge:** Create a Checkout session and use `transfer_data` to split the money.

Stripe Connect used to be incredibly difficult to set up, but with Express accounts and Checkout Sessions, a solo Rails developer can build a fully compliant, multi-sided marketplace in a single weekend.