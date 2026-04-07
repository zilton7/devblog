---
title: "How to Accept Crypto Payments in Your Rails 8 App"
categories: selfnote
tags: [rails, crypto, payments, tutorial]
image:
 path: /assets/images/2026-04-08-How-To-Accept-Crypto-Payments-In-Your-Rails-8-App/feature.webp
---

When users reach out asking: *"Can I pay with Bitcoin or USDC?"*

In the past, my answer was always no. The thought of setting up a Bitcoin node, managing private keys, and constantly checking the blockchain for confirmations sounded like an absolute nightmare for a solo developer. 

But in 2026, accepting crypto is exactly like accepting credit cards. You do not need to touch the blockchain directly. You just use a payment gateway (like Coinbase Commerce, NowPayments, or BTCPay Server) that handles the wallet generation and gives you a simple REST API and webhooks.

Here is how to integrate a crypto payment gateway into your Rails 8 app in 4 easy steps. I will use the standard API approach, which works for almost any major crypto provider.

## STEP 1: The Database Setup

First off, we need a way to track the payment. When a user clicks "Pay with Crypto", the gateway will generate a unique payment ID. We need to save this ID in our database so we can update the order when the user actually sends the funds.

Let's generate a simple `Order` model:

```bash
rails g model Order user:references amount_in_cents:integer status:string crypto_charge_id:string
rails db:migrate
```

In our model, we can set a default status:

```ruby
# app/models/order.rb
class Order < ApplicationRecord
  belongs_to :user

  # Statuses: pending, unconfirmed, completed, failed
  after_initialize :set_default_status, if: :new_record?

  def set_default_status
    self.status ||= 'pending'
  end
end
```

## STEP 2: Creating the Charge (The API Call)

When the user clicks the checkout button, we need to tell our crypto provider to generate a payment page with the exact amount and currency. 

We don't need a heavy SDK for this. We can just use the `http` gem to make a fast POST request to the provider's API (in this example, I'll use the Coinbase Commerce API structure, as it is the industry standard).

```ruby
# app/controllers/crypto_checkouts_controller.rb
require 'http'

class CryptoCheckoutsController < ApplicationController
  def create
    @order = current_user.orders.create!(amount_in_cents: 50_00) # $50.00

    # 1. Call the Crypto Gateway API
    response = HTTP.headers(
      "X-CC-Api-Key" => ENV['CRYPTO_API_KEY'],
      "X-CC-Version" => "2018-03-22",
      "Content-Type" => "application/json"
    ).post("https://api.commerce.coinbase.com/charges", json: {
      name: "Pro Subscription",
      description: "One year of Pro access",
      local_price: {
        amount: "50.00",
        currency: "USD"
      },
      pricing_type: "fixed_price",
      metadata: { order_id: @order.id } # We pass our internal ID here!
    })

    # 2. Parse the response
    charge_data = JSON.parse(response.body)["data"]

    # 3. Save their unique charge ID
    @order.update!(crypto_charge_id: charge_data["id"])

    # 4. Redirect the user to the generated Crypto payment page
    redirect_to charge_data["hosted_url"], allow_other_host: true
  end
end
```

## STEP 3: The View

This is the easiest part. You don't need to build a complex UI with QR codes. The gateway handles that for you. You just need a button.

```erb
<!-- app/views/pricing/index.html.erb -->

<div class="pricing-card">
  <h2>Pro Plan - $50</h2>
  
  <!-- Credit Card Button -->
  <%= button_to "Pay with Stripe", stripe_checkout_path %>

  <!-- Crypto Button -->
  <%= button_to "Pay with Crypto", crypto_checkouts_path, class: "btn-crypto" %>
</div>
```

When the user clicks this, they are redirected to a secure, hosted page where they can pick their coin (BTC, ETH, USDC), scan the QR code with their wallet, and send the money.

## STEP 4: The Webhook (The Magic)

Crypto transactions take time. Bitcoin can take 10 minutes to confirm. Because of this, the user might close their browser before the payment finishes. 

To solve this, the crypto gateway will send a background **Webhook** (a POST request) to your Rails app the moment the blockchain confirms the money has arrived.

We need to create a controller to catch this request, verify it is actually from the gateway (and not a hacker), and update our order.

```ruby
# app/controllers/webhooks/crypto_controller.rb
class Webhooks::CryptoController < ApplicationController
  # We must skip the CSRF token check because this request comes from an external server
  skip_before_action :verify_authenticity_token

  def create
    payload = request.body.read
    signature = request.headers['X-CC-Webhook-Signature']

    # 1. Verify the signature (Crucial Security Step!)
    # We use OpenSSL to generate a hash using our secret key and the payload
    digest = OpenSSL::Digest.new('sha256')
    computed_signature = OpenSSL::HMAC.hexdigest(digest, ENV['CRYPTO_WEBHOOK_SECRET'], payload)

    unless ActiveSupport::SecurityUtils.secure_compare(computed_signature, signature)
      render plain: "Invalid signature", status: 400
      return
    end

    # 2. Process the event
    event = JSON.parse(payload)
    event_type = event.dig("event", "type")
    
    # The gateway passes back the metadata we gave it in Step 2
    order_id = event.dig("event", "data", "metadata", "order_id")
    order = Order.find_by(id: order_id)

    if order
      case event_type
      when "charge:pending"
        order.update!(status: 'unconfirmed')
      when "charge:confirmed", "charge:resolved"
        order.update!(status: 'completed')
        # Here you would trigger an email or grant access to the product
      when "charge:failed"
        order.update!(status: 'failed')
      end
    end

    # 3. Always return a 200 OK so the gateway knows we got the message
    head :ok
  end
end
```

Don't forget to add the route for this webhook:

```ruby
# config/routes.rb
namespace :webhooks do
  post 'crypto', to: 'crypto#create'
end
```

## Summary

That's pretty much it! Integrating cryptocurrency payments into Rails is no different than integrating Stripe or PayPal. 

1. You create an order in your database.
2. You ask the API for a checkout URL.
3. You redirect the user.
4. You wait for the Webhook to tell you the payment was successful.

By using a hosted gateway, you completely avoid the legal and technical nightmares of holding private keys or managing blockchain nodes. You just write clean Ruby code and let the provider handle the heavy lifting.