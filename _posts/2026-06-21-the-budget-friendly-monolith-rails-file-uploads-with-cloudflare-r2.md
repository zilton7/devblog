---
title: "The Budget-Friendly Monolith: Rails File Uploads with Cloudflare R2"
categories: selfnote
tags: [rails, storage, cloudflare, devops]
image:
 path: /assets/images/2026-06-21-The-Budget-Friendly-Monolith-Rails-File-Uploads-With-Cloudflare-R2/feature.webp
---

If you have been using AWS S3 for your Rails file uploads, you know the pain of the monthly bill. It’s not just the storage cost; it’s the **Egress Fees**. Every time a user downloads a file or views an image, AWS charges you for the data leaving their servers.

For a solo developer or a small startup, these "hidden" fees can grow very fast. 

In 2026, the best alternative is **Cloudflare R2**. It is an object storage service that is 100% compatible with the S3 API, but with one massive advantage: **Zero Egress Fees.** You only pay for the space you use. 

Because it uses the S3 API, setting it up with Rails ActiveStorage is incredibly easy. Here is how to do it in 4 steps.

## STEP 1: The Credentials

First, log into your Cloudflare dashboard and create a new **R2 Bucket**. 

Once the bucket is created, you need to generate "API Tokens." 
1. Go to **R2** > **Manage R2 API Tokens**.
2. Create a new token with **Edit** permissions.
3. Save your **Access Key ID**, **Secret Access Key**, and the **Jurisdiction-specific endpoint**.

The endpoint will look something like this:
`https://<account_id>.r2.cloudflorage.com`

## STEP 2: The Gems

Even though we are using Cloudflare, we still use the official AWS S3 gem because Cloudflare built R2 to be a "drop-in" replacement.

Add this to your `Gemfile`:

```ruby
gem "aws-sdk-s3", require: false
```
Run `bundle install`.

## STEP 3: Configuration (`storage.yml`)

Now we need to tell Rails how to talk to the R2 bucket. Open your `config/storage.yml` and add a new section for Cloudflare.

```yaml
# config/storage.yml
cloudflare:
  service: S3
  access_key_id: <%= ENV['CLOUDFLARE_R2_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['CLOUDFLARE_R2_SECRET_ACCESS_KEY'] %>
  region: auto # R2 handles regions automatically
  bucket: my-app-uploads
  # This is the endpoint you got from Step 1
  endpoint: https://<account_id>.r2.cloudflarestorage.com
  force_path_style: true
```

*Note: Make sure to add those ENV variables to your `.kamal/secrets` or your production server!*

## STEP 4: Tell Rails to use R2

Finally, update your production environment to use the new service.

```ruby
# config/environments/production.rb
config.active_storage.service = :cloudflare
```

## Bonus: Enabling Direct Uploads (CORS)

In a previous article, I talked about **Direct Uploads** to save your server from freezing. If you want to use Direct Uploads with R2, you **must** configure CORS (Cross-Origin Resource Sharing). 

Cloudflare makes this easy. Go to your Bucket settings in the dashboard and paste this JSON into the CORS section:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Type", "ETag"]
  }
]
```

This tells Cloudflare: *"It is safe to let users from my website upload files directly to this bucket."*

## Summary

Switching from AWS S3 to Cloudflare R2 is one of the smartest "business" moves a solo developer can make. 

1. **Compatibility:** You don't have to change your Ruby code.
2. **Predictability:** No more surprise bills because an image went viral.
3. **Simplicity:** One less AWS console to navigate.

By combining **Rails 8**, **Kamal 2**, and **Cloudflare R2**, you are building a production stack that is fast, secure, and incredibly cheap to run.