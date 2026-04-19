---
title: "How I Built a Native Android App with Almost Zero Kotlin Experience"
categories: selfnote
tags: [rails, hotwire, mobile, android]
image:
 path: /assets/images/2026-04-19-How-I-Built-A-Native-Android-App-With-Zero-Kotlin-Experience/feature.webp
---

# Turning a Rails App into an Android App: Testing Hotwire Native

Recently I wanted to test **Hotwire Native** in the real world. Having a sensitive stomach, I couldn't find a decent FODMAP diet app that was fast, simple, and didn't have annoying ads. 

So, as developers do, I decided to build one myself. 

My goal was to build a simple web app first, and then see how hard it would actually be to wrap it into a real Android application using Hotwire Native. To my surprise, turning this web app into an Android app was incredibly easy.

Here is the process of how I built it (you can check out the live web version here:[https://fodmap.norvilis.com/](https://fodmap.norvilis.com/)).

## The Foundation: Building the Rails App

I wanted to keep the backend as simple as possible. I didn't need a massive database, so I used **SQLite** to store the pre-gathered data of hundreds of food items and their FODMAP levels. SQLite is incredibly fast for this kind of "read-heavy" application.

For the user interface, I relied heavily on Hotwire to make it feel like a Single Page Application (SPA).

1.  **Live Filter:** I added a search bar at the top. As you type, it uses a Stimulus controller to submit the form automatically, and a `Turbo Frame` swaps out the food list instantly without reloading the page.
2.  **The Modal:** When you click on a food item to read more details, instead of loading a new page, it opens a clean modal popup using Turbo Frames.

It took a few hours, and the web version worked perfectly. But I wanted this on my phone.

## The Magic: Enter Hotwire Native

If you build an app in React, to get it on a phone, you usually have to rewrite your UI in React Native. 

With Hotwire Native, you don't rewrite anything. You create a basic "shell" Android app, and you tell it to load your Rails URL. But unlike a standard web-view, Hotwire Native intercepts your clicks and uses **real native mobile transitions** to move between screens.

Here is how the Android setup works.

## STEP 1: The Android Project

First off, you need to download Android Studio. You create an empty project and add the Hotwire Native dependency to your `build.gradle` file:

```gradle
dependencies {
    implementation("dev.hotwire:core:<latest-version>")
    implementation("dev.hotwire:navigation-fragments:<latest-version>")
}
```

## STEP 2: Pointing to the Rails App

In Hotwire Native, you configure a `Session`. This tells the Android app where your Rails server lives. You just give it the URL of your app.

Inside your main Kotlin activity file, you set the starting URL:

```kotlin
// MainActivity.kt
class MainActivity : HotwireActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        findViewById<View>(R.id.main_nav_host).applyDefaultImeWindowInsets()
    }

    override fun navigatorConfigurations() = listOf(
        NavigatorConfiguration(
            name = "main",
            startLocation = "https://fodmap.norvilis.com",
            navigatorHostId = R.id.main_nav_host
        )
    )
}
```

## STEP 3: The Path Configuration

You might have noticed the `path.json` file in the code above. This is the secret weapon of Hotwire Native.

It is a simple JSON file that lives in your Rails app (usually in `public/configurations/android_v1.json`). It tells the Android app how different URLs should behave. 

For example, when a user clicks on a food item, I want the Android app to slide the new screen up from the bottom (like a native modal), instead of just pushing it sideways.

```json
{
    "settings": {
        "register_with_account": false
    },
    "rules": [
        {
            "patterns": [
                "/new$",
                "/edit$",
                "/foods/[0-9]+$"
            ],
            "properties": {
                "context": "modal",
                "uri": "hotwire://fragment/web/modal/sheet"
            }
        },
        {
            "patterns": [
                ".*"
            ],
            "properties": {
                "context": "default",
                "uri": "hotwire://fragment/web"
            }
        }
    ]
}
}
```

When the Android app sees a URL that matches `/foods/1`, it reads this JSON file and says, *"Ah! The Rails developer wants this to be a modal."* It then uses native Android animations to open the screen.

## Why I Love This Approach

I have almost zero experience writing Kotlin or Java. I am a Ruby developer. 

But with Hotwire Native, I didn't need to build an API. I didn't need to write a separate mobile frontend. 
*   My live search filter worked out of the box because Turbo works the same way inside the mobile wrapper. 
*   My SQLite database and Rails controllers served both the web users and the Android users at the same time.
*   If I want to fix a typo or add a new food item, I deploy my Rails app, and the Android app is updated instantly. No app store reviews required.

That's pretty much it. If you have a Rails app and you have been avoiding making a mobile version because you don't want to learn a new language, you really need to try Hotwire Native. It is the ultimate superpower for a solo developer.