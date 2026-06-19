---
title: "Pro File Uploads in Rails 8: Speed and Scalability with Direct Uploads"
categories: selfnote
tags: [rails, storage, performance, webdev]
image:
 path: /assets/images/2026-06-19-Pro-File-Uploads-In-Rails-8-Speed-And-Scalability-With-Direct-Uploads/feature.webp
---

Imagine a user trying to upload a 100MB video or a high-resolution photo to your app. If you use the standard Rails file upload, that file travels from the user's browser to your Rails server, and *then* your server sends it to S3 or Google Cloud.

This is a terrible way to do it. While that 100MB file is transferring, your Rails worker (Puma) is frozen. It can't handle other users. If three people upload large files at once, your whole app will stop responding.

In 2026, the professional way to handle this is **Direct Uploads**. 

With Direct Uploads, the file goes directly from the user's browser to your cloud storage (S3, R2, etc.). Your Rails server only handles a tiny bit of metadata. It is faster for the user and much safer for your server. Here is how to set it up in Rails 8.

## STEP 1: Configure Your Storage

First, make sure you aren't using the local disk for production. You need a cloud provider like AWS S3 or Cloudflare R2.

In your `config/storage.yml`:

```yaml
amazon:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region: us-east-1
  bucket: my-app-uploads
  # Crucial for Direct Uploads!
  public: true 
```

**Note:** You must configure **CORS** in your S3/R2 dashboard to allow requests from your domain. If you don't do this, the browser will block the upload.

## STEP 2: The Rails Form

Rails makes the backend part incredibly easy. You just add one attribute to your file field: `direct_upload: true`.

```erb
<!-- app/views/users/_form.html.erb -->
<%= form_with(model: user) do |f| %>
  <div class="field">
    <%= f.label :avatar %>
    <%= f.file_field :avatar, direct_upload: true %>
  </div>

  <%= f.submit "Save Profile" %>
<% end %>
```

When you add `direct_upload: true`, Rails automatically includes a JavaScript library that handles the "handshake" with S3.

## STEP 3: Adding a Progress Bar (The UX Win)

Direct uploads can take a few seconds. If nothing happens on the screen, the user will think your app is broken. We can use the built-in ActiveStorage events to show a beautiful progress bar.

First, add a small piece of HTML to your form:

```html
<div class="upload-progress hidden" id="progress-bar">
  <div class="bg-blue-600 h-2 transition-all" id="progress-fill" style="width: 0%"></div>
</div>
```

Now, we create a tiny **Stimulus** controller to watch the upload progress.

```javascript
// app/javascript/controllers/upload_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.element.addEventListener("direct-upload:progress", event => {
      const { progress } = event.detail
      const bar = document.getElementById("progress-fill")
      const container = document.getElementById("progress-bar")
      
      container.classList.remove("hidden")
      bar.style.width = `${progress}%`
    })

    this.element.addEventListener("direct-upload:error", event => {
      alert("Upload failed! Please check your connection.")
    })
  }
}
```

Attach this to your form: `<%= form_with(model: user, data: { controller: "upload" }) do |f| %>`.

## STEP 4: Why this is the "One-Person" Superpower

As a solo developer, you want to avoid "Scaling Issues" as long as possible. 

The traditional upload method requires you to have a large server with lots of RAM to handle big file streams. If your app goes viral, you’ll have to pay for a massive server just to move files around.

By using **Direct Uploads**:
1. **Cost:** You can stay on a tiny $5 VPS because S3 does 99% of the work.
2. **Speed:** Users see a progress bar immediately.
3. **Reliability:** If your server restarts in the middle of an upload, the upload doesn't necessarily fail because it’s not talking to your server!

## Summary

Don't let file uploads slow down your monolith. It takes 5 minutes to switch to Direct Uploads, but it makes your app feel like an enterprise product.

1. Use **Cloud Storage** (S3/R2).
2. Enable **CORS** on your bucket.
3. Add **`direct_upload: true`** to your form.
4. Add a **Stimulus** progress bar for that "premium" feel.

Your Puma threads will thank you, and your users will love the snappy experience.