---
title: "How to Build a Desktop App with Rails 8 and Electron"
categories: selfnote
tags: [rails, electron, hotwire, desktop]
image:
 path: /assets/images/2026-05-03-How-To-Build-A-Desktop-App-With-Rails-8-And-Electron/feature.webp
---

# From Web to Desktop: Wrapping a Rails Hotwire App in Electron

Very often I find myself building a successful web application, and inevitably, a user asks the golden question: *"Do you have a desktop app for Mac or Windows?"*

As a solo developer, hearing this used to give me anxiety. I am a Ruby developer. I don't have the time to learn Swift for macOS, C# for Windows, or rewrite my entire frontend in React just to use a desktop framework.

But in 2026, you don't have to. You can take your existing Rails app, wrap it in **Electron**, and ship it as a native desktop application. 

The secret reason this works so well today is **Hotwire**. Because Turbo intercepts link clicks and updates the page without doing a full browser reload, your web app inside Electron doesn't have that ugly "white flash" between pages. It actually feels like a native desktop app.

Here is how to wrap your Rails app into an Electron desktop app in 4 easy steps.

## STEP 1: The Electron Setup

Since Electron runs on Node.js, we do need to step out of the Ruby world just for a minute to create our desktop "shell". 

Create a new folder completely separate from your Rails app, and initialize a basic Node project:

```bash
mkdir my-desktop-app
cd my-desktop-app
npm init -y
npm install electron --save-dev
```

In your `package.json`, update the main entry point and add a start script:

```json
{
  "name": "my-desktop-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  }
}
```

## STEP 2: The Main Process (Loading Rails)

Now we create the `main.js` file. This is the brain of your desktop app. Its entire job is to boot up a chromium window and point it to your Rails server.

Create `main.js`:

```javascript
const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset', // Makes it look modern on Mac
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // In development, point to localhost. 
  // In production, point to your real HTTPS domain.
  win.loadURL('http://localhost:3000')

  // STEP 3 LOGIC GOES HERE...
}

app.whenReady().then(() => {
  createWindow()
})
```

If you run `npm start` right now (while your Rails server is running on port 3000), a beautiful desktop window will open, displaying your Rails app!

## STEP 3: Handling External Links

There is one immediate problem. If a user clicks a link in your app that goes to `https://twitter.com`, Twitter will load *inside* your Electron app. You don't want that. You want external links to open in the user's default browser (like Chrome or Safari).

We can intercept these links inside `main.js`. Add this inside your `createWindow` function:

```javascript
  // Intercept links opening in new windows
  win.webContents.setWindowOpenHandler(({ url }) => {
    // If the URL is not your Rails app, open it in the default browser
    if (!url.includes('localhost:3000')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })
```

*Note: In Rails, make sure your external links have `target="_blank"` so Electron knows it is trying to open a new window!*

## STEP 4: The Hotwire Bridge (Stimulus)

Your app looks great, but what if you want to use Native Desktop features? What if you want to trigger a native Desktop Notification when a Rails background job finishes?

We need our Rails app to "talk" to Electron. We do this using a `preload.js` file. 

Create `preload.js` in your Electron folder:

```javascript
const { contextBridge, ipcRenderer } = require('electron')

// We expose a safe API to the browser window
contextBridge.exposeInMainWorld('desktopAPI', {
  sendNotification: (title, body) => {
    // We send a message to the Electron main process
    new Notification(title, { body: body })
  }
})
```

Now, back in your **Rails App**, you can write a simple Stimulus controller to trigger this!

```bash
rails g stimulus desktop
```

```javascript
// app/javascript/controllers/desktop_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  notify() {
    // We check if 'window.desktopAPI' exists. 
    // If they are using a normal web browser, it will be undefined.
    // If they are in our Electron app, it will run!
    if (window.desktopAPI) {
      window.desktopAPI.sendNotification("Task Complete", "Your export is ready.")
    } else {
      alert("Task Complete (Web Version)")
    }
  }
}
```

Attach this controller to a button in your Rails view: `<button data-controller="desktop" data-action="click->desktop#notify">Test Notification</button>`.

## Summary

The "Write Once, Run Anywhere" dream used to be a myth. But the modern Rails stack makes it incredibly close to reality.

1.  Your **Rails backend** handles the database and logic.
2.  **Hotwire** makes the frontend feel instant and native.
3.  **Hotwire Native** wraps it for iOS and Android.
4.  **Electron** wraps it for macOS and Windows.

By simply pointing an Electron window at your Rails URL and exposing a few features via a Stimulus bridge, you can offer your users a premium desktop experience without maintaining a separate codebase.