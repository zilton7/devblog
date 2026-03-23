---
title: "Taking a Monthly Cut: Rails, Stripe Connect, and Recurring Billing"
categories: selfnote
tags: [rails, ruby, stripe, webdev]
image:
 path: /assets/images/2026-03-23-Taking-A-Monthly-Cut-Rails-Stripe-Connect-And-Recurring-Billing/feature.webp
---

[In the previous article](https://norvilis.com/stripe-connect-simplified-routing-payments-in-your-rails-app/), we looked at how to use Stripe Connect to take a cut from a one-time payment. But what if you are building a platform like Patreon, Substack, or a SaaS marketplace? 

In these apps, a buyer subscribes to a seller. They pay $10 every month. You want to automatically take your 10% platform fee every month, and send the remaining $9 to the seller without lifting a finger.

Handling recurring payments with Stripe Connect is slightly different than one-time charges. You can't just split the payment once; you have to tell Stripe to split the payment *every time the billing cycle renews*.

Here is how to set up recurring Connect subscriptions in your Rails app.

## The Concept: Subscription Data

When you do a one-time payment, you pass `payment_intent_data` to the Stripe Checkout session. 
For subscriptions, `payment_intent_data` does not work. Instead, we have to use `subscription_data`. 

Also, instead of passing a fixed application fee (like $1.00), it is usually much easier to pass an `application_fee_percent` (like 10%).

## STEP 1: Create a Recurring Price

To create a subscription, you need a Price ID from your Stripe Dashboard that is set to "Recurring" (e.g., Monthly or Yearly). 

Let's assume you have a standard $10/month membership plan. Go to your Stripe Dashboard, create a Product, create a recurring Price, and copy the Price ID (it starts with `price_...`).

## STEP 2: The Checkout Session

When the buyer clicks "Subscribe to this Creator", we redirect them to Stripe Checkout. We need to pass the seller's Stripe Account ID so Stripe knows where to route the money.

```ruby
# app/controllers/subscriptions_controller.rb
class SubscriptionsController < ApplicationController
  def create
    seller = User.find(params[:seller_id])
    
    # The recurring price ID from your Stripe Dashboard
    price_id = "price_1Qx..." 

    session = Stripe::Checkout::Session.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items:[{
        price: price_id,
        quantity: 1,
      }],
      success_url: success_url,
      cancel_url: cancel_url,
      
      # The Magic Connect Code for Subscriptions
      subscription_data: {
        application_fee_percent: 10.0, # Your platform takes 10%
        transfer_data: {
          destination: seller.stripe_account_id # The rest goes to the seller
        }
      }
    })

    redirect_to session.url, allow_other_host: true
  end
end
```

That is the hardest part! Now, when the user subscribes, Stripe will automatically charge them $10 every month. It will send $1 to your platform balance, and $9 to the seller's connected account.

## STEP 3: Handling Webhooks (Crucial)

With one-time payments, you can just redirect the user to a `success_url` and update your database. 
With subscriptions, you **must** use Webhooks. 

Why? Because next month, when the user is charged again, they are not sitting at their computer clicking a button. The charge happens in the background. Your Rails app needs to know if that month 2 payment was successful or if their credit card expired.

You need to listen to the `invoice.payment_succeeded` webhook.

```ruby
# app/controllers/webhooks_controller.rb
class WebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    payload = request.body.read
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = ENV['STRIPE_WEBHOOK_SECRET']

    begin
      event = Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
    rescue JSON::ParserError, Stripe::SignatureVerificationError => e
      render json: { error: e.message }, status: 400
      return
    end

    # Handle the subscription payment
    if event.type == 'invoice.payment_succeeded'
      invoice = event.data.object
      
      # Find the user by their Stripe Customer ID and extend their access
      # User.find_by(stripe_customer_id: invoice.customer).extend_subscription!
      
      puts "Payment succeeded for subscription: #{invoice.subscription}"
    end

    render json: { message: 'success' }, status: 200
  end
end
```

## STEP 4: Canceling the Subscription

Eventually, a buyer will want to cancel their subscription to the seller. You can do this easily using the Stripe API. You just need the `subscription_id` (which starts with `sub_...` and can be saved to your database during the webhook step).

```ruby
# app/controllers/subscriptions_controller.rb
def destroy
  # Assuming you saved the subscription ID to your Subscription model
  sub_record = current_user.subscriptions.find(params[:id])

  # Tell Stripe to cancel it at the end of the billing period
  Stripe::Subscription.update(
    sub_record.stripe_subscription_id,
    { cancel_at_period_end: true }
  )

  sub_record.update(status: 'canceling')
  redirect_to dashboard_path, notice: "Subscription will cancel at the end of the month."
end
```

## Summary

Setting up recurring payments in a marketplace used to require complex background jobs to manually calculate and send transfers every month. 

Now, by using `subscription_data` with `transfer_data` in a Stripe Checkout session, you let Stripe handle the math, the scheduling, and the splits. 

1. Create a **Recurring Price**.
2. Pass `application_fee_percent` and the seller's `destination` ID in the Checkout Session.
3. Listen to **Webhooks** to know when future months are paid.

This allows you as a solo developer to run a massive subscription marketplace without ever touching the money yourself.