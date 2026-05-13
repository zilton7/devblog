---
title: "Why I Stopped Using Stripe: The Case for Merchant of Records (MoR)"
categories: selfnote
tags: [saas, startups, payments, webdev]
image:
 path: /assets/images/2026-05-14-Why-I-Stopped-Using-Stripe-The-Case-For-Merchant-Of-Records-Mor/feature.webp
---

If you are building a SaaS in 2026, the default advice is always the same: *"Just plug in Stripe and launch."*

Stripe is an incredible piece of engineering. Their APIs are flawless, their documentation is the gold standard of the internet, and integrating Stripe Checkout into a Rails app takes about ten minutes. 

For a long time, I used Stripe for everything. But as my side projects started actually making money, a dark, terrifying reality crept in: **Global Tax Compliance.**

As a solo developer based in Europe, I realized that taking payments globally isn't just about moving money from Point A to Point B. It’s a legal minefield. This is why I entirely stopped using Stripe for my B2C (Business to Consumer) SaaS projects and switched to using a **Merchant of Record (MoR)** like Paddle or Lemon Squeezy.

Here is the exact difference, and why it matters to your sanity.

## The Problem: The "Tax Nexus" Nightmare

When you use Stripe, Stripe is simply a **Payment Processor**. 

They take the credit card, they verify the funds, and they put the money in your bank account. That’s it. 

**Legally, YOU are the one selling the software to the customer.**

Why is this a problem? Let's say you sell a $10/month subscription.
*   A user in Germany buys it. You owe 19% VAT to Germany.
*   A user in the UK buys it. You owe 20% VAT to the UK.
*   A user in Texas buys it. You owe Texas state sales tax.

Suddenly, because you sold software globally, you are legally required to register for taxes in multiple different countries, calculate the exact rates based on the buyer's IP address, collect the tax, and remit it to foreign governments quarterly. 

If you are a One-Person Team, trying to figure out the tax laws of 50 different countries will consume your entire life. You will spend more time doing accounting than writing Ruby code. (Yes, Stripe Tax exists, but it only *calculates* the tax; you still have to file the paperwork yourself).

## The Solution: The Merchant of Record (MoR)

A Merchant of Record (like **Paddle** or **Lemon Squeezy**) works entirely differently.

When you use an MoR, the legal flow changes. 
**You sell your software to the MoR. The MoR sells the software to the customer.**

Because Paddle is the one officially selling the product to the user in Germany, Paddle is legally responsible for calculating, collecting, and remitting the 19% VAT to the German government. 

For you, the developer, the nightmare is over. At the end of the month, Paddle sends you one single payout. As far as your local tax authority is concerned, you only made one B2B sale that month: you sold your services to Paddle (a UK company). 

## The Trade-Offs

Switching to an MoR feels like a magic bullet, but it does come with trade-offs you need to understand.

### 1. The Fees are Higher
Because an MoR handles international taxes, handles chargeback disputes, and assumes legal liability, they charge more.
*   **Stripe:** ~2.9% + 30¢ per transaction.
*   **Paddle / Lemon Squeezy:** ~5% + 50¢ per transaction.

When you are starting out, giving up 5% feels painful. But ask yourself: how much is an international tax accountant going to cost you? Usually, the 2% difference is much cheaper than hiring a professional to file VAT returns in the EU.

### 2. The Integration is Slightly Different
Integrating an MoR into Rails is conceptually similar to Stripe, but slightly less "native". You don't use a massive Ruby gem. 

Usually, you drop their Javascript snippet onto your pricing page to trigger a checkout overlay. Then, just like Stripe, you set up a webhook endpoint in your Rails app.

```ruby
# app/controllers/webhooks/paddle_controller.rb
class Webhooks::PaddleController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    # Paddle sends a signature we must verify
    if valid_paddle_signature?(request)
      event = params[:alert_name]
      
      case event
      when 'subscription_payment_succeeded'
        # Upgrade the user!
        user = User.find_by(email: params[:email])
        user.update!(pro: true)
      end
      
      head :ok
    else
      head :unauthorized
    end
  end
end
```
It is very straightforward, but you will be relying more on raw webhook handling rather than a polished library.

### 3. Less Control Over the Checkout
With Stripe Elements, you can design a checkout flow that perfectly matches your app's brand. With an MoR, you are generally forced to use their hosted checkout pages or standard popups. 

## Summary

If you are a US-based developer selling exclusively to other US businesses (B2B), Stripe is still the undisputed king.

But if you are a solo developer (especially in Europe) selling B2C products globally, the math changes. Your goal is to write code and build a great product, not to become an expert in the European Union's digital VAT laws.

Giving up an extra 2% of your revenue to a Merchant of Record like Paddle or Lemon Squeezy is the best "DevOps" investment you can make. It buys you total peace of mind.