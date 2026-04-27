---
title: "Stop Using Ugly Browser Alerts: Custom Turbo Confirms in Rails 8"
categories: selfnote
tags: [rails, hotwire, frontend, webdev]
image:
 path: /assets/images/2026-04-28-Stop-Using-Ugly-Browser-Alerts-Custom-Turbo-Confirms-In-Rails-8/feature.webp
---

I'm building a really nice, modern Rails application. I use Tailwind to make the buttons look great, I use Hotwire to make the page load instantly, and then... I click a "Delete" button.

Suddenly, the screen freezes and a massive, ugly gray alert box from 1998 pops up saying *"Are you sure?"*

This is the default browser `window.confirm()` dialog. It looks terrible, it breaks the modern feel of your app, and you cannot style it with CSS. 

For a long time, fixing this required writing a bunch of messy custom Javascript to intercept form submissions. But in modern Rails (using Turbo), overriding this behavior is actually incredibly simple. We can use a single Promise and the native HTML5 `<dialog>` element to create a beautiful, custom confirmation modal.

Here is exactly how to do it in 3 easy steps.

## STEP 1: The Native HTML Dialog

First off, we need the actual modal that will pop up. Instead of importing heavy JavaScript modal libraries, we are going to use the native HTML5 `<dialog>` element. It is supported in all modern browsers and handles all the annoying overlay math for us.

Open your main application layout file and drop this code right before the closing `</body>` tag. 

```erb
<!-- app/views/layouts/application.html.erb -->

<dialog id="turbo-confirm-modal" class="backdrop:bg-black/50 p-6 rounded-xl shadow-xl w-96 bg-white">
  
  <h3 id="turbo-confirm-message" class="text-xl font-bold mb-6 text-gray-800">
    Are you sure?
  </h3>
  
  <div class="flex justify-end gap-3">
    <button id="turbo-confirm-cancel" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
      Cancel
    </button>
    
    <button id="turbo-confirm-accept" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
      Confirm
    </button>
  </div>
  
</dialog>
```

*Note: I am using Tailwind classes here for styling. The `backdrop:bg-black/50` class automatically dims the background of your app when the dialog opens!*

## STEP 2: The Javascript Override (The Magic)

By default, when Turbo sees `data-turbo-confirm` on a button, it calls the browser's `confirm()` method. We need to tell Turbo to use our new HTML dialog instead.

Open your main Javascript entry file (`app/javascript/application.js`). 

Turbo has a built in method called `Turbo.setConfirmMethod()`. This method expects us to return a Javascript `Promise` that resolves to either `true` (if the user clicks Confirm) or `false` (if they click Cancel).

Add this code to your file:

```javascript
// app/javascript/application.js
import "@hotwired/turbo-rails"

Turbo.setConfirmMethod((message, element) => {
  return new Promise((resolve) => {
    // 1. Find our dialog and text element
    const dialog = document.getElementById("turbo-confirm-modal")
    const messageEl = document.getElementById("turbo-confirm-message")

    // 2. Insert the dynamic message from the button
    messageEl.textContent = message

    // 3. Show the modal
    dialog.showModal()

    // 4. Handle button clicks
    const btnAccept = document.getElementById("turbo-confirm-accept")
    const btnCancel = document.getElementById("turbo-confirm-cancel")

    // We use the <dialog> built-in 'close' method and pass it a string value
    btnAccept.onclick = () => { dialog.close("accept") }
    btnCancel.onclick = () => { dialog.close("cancel") }

    // 5. Listen for the dialog to close. 
    // This catches both button clicks AND if the user presses the 'ESC' key!
    dialog.addEventListener("close", () => {
      resolve(dialog.returnValue === "accept")
    }, { once: true }) // 'once: true' automatically removes the event listener after it runs
  })
})
```

This code is brilliantly simple. We don't have to intercept form submissions or worry about race conditions. We just hold the Turbo request in a Promise until the dialog closes.

## STEP 3: Using It In Your App

That's it! You don't need to change how you write your Rails code. 

Anywhere in your app, you can use the standard `turbo_confirm` syntax. Turbo will automatically route the message into your beautiful new modal.

```erb
<!-- A standard delete button -->
<%= button_to "Delete Project", project_path(@project), 
      method: :delete, 
      class: "btn-danger",
      data: { turbo_confirm: "Are you sure you want to delete this project? This cannot be undone." } %>

<!-- It also works on links -->
<%= link_to "Sign Out", destroy_user_session_path, 
      data: { turbo_confirm: "Ready to leave?" } %>
```

## Summary

In modern web development, details matter. The default browser alert screams "amateur side project." 

By combining:
1. The native HTML5 `<dialog>` element.
2. A Javascript `Promise`.
3. Turbo's `setConfirmMethod`.

We created a reusable, accessible, and easily stylable confirmation system in about 30 lines of code. No React, no heavy modal libraries, and no dirty Javascript hacks. 