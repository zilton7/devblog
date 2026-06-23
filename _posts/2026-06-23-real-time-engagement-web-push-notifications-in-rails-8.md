---
title: "Real-Time Engagement: Web Push Notifications in Rails 8"
categories: selfnote
tags: [rails, ruby, webdev, notifications]
image:
 path: /assets/images/2026-06-23-Real-Time-Engagement-Web-Push-Notifications-In-Rails-8/feature.webp
---

For a long time, if you wanted to send a "Push Notification" to a user’s phone or laptop, you needed a native mobile app. For solo developers, this was a huge barrier. We had to rely on emails that nobody reads or expensive SMS services.

In 2026, the **Web Push API** is supported by almost every browser, including Safari on iOS. This means you can send native-style alerts directly from your Rails app to your user's device without them ever downloading anything from an App Store.

It sounds complex because it involves Service Workers and Cryptography, but with the right gems, it is actually very manageable. Here is how to set up Web Push in Rails 8.

## The Mental Model: How Web Push Works

1.  **Subscription:** The user clicks "Allow" in their browser. The browser gives us a "Subscription" object (a URL and some secret keys).
2.  **Storage:** We save that object in our database, linked to the `User`.
3.  **The Push:** When an event happens, our Rails server signs a message and sends it to the browser's "Push Service" (Google, Apple, or Mozilla).
4.  **Delivery:** The Service Worker on the user's device wakes up and shows the notification.

## STEP 1: The VAPID Keys

To send secure notifications, you need a pair of VAPID keys (Public and Private). These identify your server so that the browser knows the notification isn't from a hacker.

Add the gem to your `Gemfile`:
```ruby
gem "web-push"
```

Run this in your terminal to generate your keys:
```bash
# Generate keys
web-push generate-vapid-keys
```
Copy these keys into your `.kamal/secrets` or your credentials file.

## STEP 2: The Database Setup

We need to store the subscription for each user. A user might have multiple subscriptions (one for their phone, one for their laptop).

```bash
rails g model WebPushSubscription user:references endpoint:string p256dh_key:string auth_key:string
rails db:migrate
```

## STEP 3: The Service Worker (Javascript)

Service Workers must live in the `public/` folder to have access to the whole site. Create a file at `public/service-worker.js`. This file listens for the "push" event even when your website is closed.

```javascript
// public/service-worker.js
self.addEventListener("push", (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.png"
    })
  );
});
```

Now, register this worker in your `app/javascript/application.js`:
```javascript
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}
```

## STEP 4: Creating the Subscription

We need a Stimulus controller to ask the user for permission and send the subscription to Rails.

```javascript
// app/javascript/controllers/push_subscription_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  async subscribe() {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "YOUR_PUBLIC_VAPID_KEY"
    });

    // Send this JSON to your Rails controller
    await fetch("/web_push_subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": document.querySelector("[name='csrf-token']").content },
      body: JSON.stringify(subscription)
    });
    
    alert("Subscribed!");
  }
}
```

## STEP 5: Sending the Notification (The Ruby Part)

Finally, we send the notification from a background job so we don't slow down the app.

```ruby
# app/jobs/send_web_push_job.rb
class SendWebPushJob < ApplicationJob
  queue_as :default

  def perform(user_id, title, body)
    user = User.find(user_id)
    
    user.web_push_subscriptions.each do |sub|
      Webpush.payload_send(
        message: { title: title, body: body }.to_json,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh_key,
        auth: sub.auth_key,
        vapid: {
          subject: "mailto:admin@example.com",
          public_key: ENV["VAPID_PUBLIC_KEY"],
          private_key: ENV["VAPID_PRIVATE_KEY"]
        }
      )
    rescue Webpush::InvalidSubscription # If user revoked permission
      sub.destroy
    end
  end
end
```

## Summary

Web Push is the "Pro" way to bring users back to your app. 

1.  **VAPID keys** handle the security.
2.  **Service Workers** handle the delivery while the user is away.
3.  **Solid Queue** handles the background sending.

As a solo developer, you can now build an app that feels like a native mobile experience using nothing but Rails and a tiny bit of Javascript. 