---
title: "How to Build a Custom Affiliate System in Ruby on Rails"
categories: selfnote
tags: [rails, ruby, saas, tutorial]
image:
 path: /assets/images/2026-04-17-How-To-Build-A-Custom-Affiliate-System-In-Ruby-On-Rails/feature.webp
---

When you are launching a new SaaS, getting your first users is the hardest part. One of the best ways to grow is to create an affiliate (or referral) program. You basically pay your existing users a commission to bring in new users.

Very often I see developers jumping straight to third-party tools like Rewardful or PartnerStack. These tools are amazing, but they usually start at $49 to $99 a month. If your app is brand new and making zero money, that is a huge expense.

Building a basic affiliate tracking system in Rails is actually very easy. You just need to generate a code, track a cookie, and connect two users together. 

Here is how to build your own custom affiliate system in 5 simple steps.

## STEP 1: The Database Setup

First off, we need to update our database. Our `User` model needs two new columns:
1. A unique code that they can share with their friends.
2. An ID that points to the person who referred them.

Let's generate the migration:

```bash
rails g migration AddAffiliateFieldsToUsers referral_code:string:uniq referred_by_id:integer:index
```

Run `rails db:migrate` to update your database.

## STEP 2: The User Model Associations

Now we need to tell our User model how these fields work. A user can have many "referred users", and a user can belong to a "referrer". 

We also want to automatically generate a unique `referral_code` every time a new user signs up.

```ruby
# app/models/user.rb
class User < ApplicationRecord
  # The person who invited this user
  belongs_to :referrer, class_name: 'User', foreign_key: 'referred_by_id', optional: true
  
  # The people this user has invited
  has_many :referred_users, class_name: 'User', foreign_key: 'referred_by_id'

  before_create :generate_referral_code

  private

  def generate_referral_code
    # Generates a random 8-character string (e.g. 'aB9xYz2p')
    loop do
      self.referral_code = SecureRandom.alphanumeric(8)
      break unless User.exists?(referral_code: self.referral_code)
    end
  end
end
```

## STEP 3: Tracking the Clicks (Cookies)

When a user shares their link, it will look something like this: `https://myapp.com/?ref=aB9xYz2p`.

If someone clicks that link, they might not sign up immediately. They might browse the homepage, read the pricing page, and then sign up 10 minutes later. We need to "remember" who sent them using a browser Cookie.

We can do this inside our `ApplicationController` so it catches the `ref` parameter on any page of our website.

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  before_action :track_affiliate_click

  private

  def track_affiliate_click
    if params[:ref].present?
      # Save the referral code in a cookie that expires in 30 days
      cookies[:affiliate_id] = {
        value: params[:ref],
        expires: 30.days.from_now,
        domain: :all # This ensures it works across subdomains if you use them
      }
    end
  end
end
```

## STEP 4: Applying the Referral on Signup

Now, when a user finally fills out the registration form and clicks "Sign Up", we need to check if they have that cookie. If they do, we link them to the referrer.

If you are using **Devise**, you can just override the `create` method in your RegistrationsController, or hook into the user creation process. 

Here is a standard controller example:

```ruby
# app/controllers/users_controller.rb
class UsersController < ApplicationController
  def create
    @user = User.new(user_params)

    # Check if the user has an affiliate cookie
    if cookies[:affiliate_id].present?
      referrer = User.find_by(referral_code: cookies[:affiliate_id])
      @user.referrer = referrer if referrer.present?
    end

    if @user.save
      # Clear the cookie so we don't use it again accidentally
      cookies.delete(:affiliate_id, domain: :all)
      
      session[:user_id] = @user.id
      redirect_to root_path, notice: "Welcome!"
    else
      render :new, status: :unprocessable_entity
    end
  end
end
```

## STEP 5: Creating the Affiliate Link

That's the entire backend tracking system! Now, you just need to show the user their link so they can copy it and share it.

In your view (like `app/views/dashboards/show.html.erb`), you can add this:

```erb
<div class="affiliate-box">
  <h3>Earn 20% for every friend you invite!</h3>
  <p>Share your unique link:</p>
  
  <input type="text" readonly value="<%= root_url(ref: current_user.referral_code) %>">
  
  <p>You have invited <%= current_user.referred_users.count %> friends.</p>
</div>
```

## What about the Payouts?

This tutorial covers the tracking part, which is 90% of the battle. 

For payouts, the easiest way is to use **Stripe**. When your new user buys a subscription, you can attach their `referrer_id` to the Stripe Customer metadata. Then, once a month, you just write a quick Ruby script to loop through your users, see how many active referrals they have, and add account credits or send them money via Stripe Connect (or PayPal).

Building it yourself takes about 15 minutes, saves you a lot of money on monthly subscriptions, and gives you total control over how your referral system works.