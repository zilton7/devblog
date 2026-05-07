---
title: "Hotwire Native vs NativePHP: How Web Frameworks are Conquering Mobile and Desktop"
categories: selfnote
tags: [rails, laravel, mobile, desktop]
image:
 path: /assets/images/2026-05-08-Hotwire-Native-Vs-Nativephp-How-Web-Frameworks-Are-Conquering-Mobile-And-Desktop/feature.webp
---

# Hotwire Native vs NativePHP: How Web Frameworks are Conquering Mobile and Desktop

Very often I find myself talking to developers who have successfully launched a web application. They are getting traffic, users are happy, but eventually, the inevitable happens. 

A user emails them: *"When is the mobile app coming out? Do you have a Mac desktop app?"*

If you are a solo developer, learning Swift for iOS, Kotlin for Android, and C++ for Windows is impossible. You want to use the language you already know. 

The two biggest backend communities - **Ruby on Rails** and **Laravel (PHP)**-both realized this pain point. They both created incredible, massive open-source tools to solve it. Rails gave us **Hotwire Native**, and the Laravel community gave us **NativePHP**. 

But if you look under the hood, these two tools took completely opposite architectural paths. Here is my breakdown of how Hotwire Native and NativePHP work, the pros and cons of each, and why they solve two very different problems.

## 1. Hotwire Native: The "Thin Client" (Rails)

Hotwire Native (formerly Turbo Native) is the Rails way of getting your app onto iOS and Android. 

**How it works:**
It is a "Thin Client". When a user downloads your app from the App Store and opens it, they are essentially opening a highly-optimized, invisible web browser. 

The mobile app does not have a database. It does not have business logic. When the user taps a button, the app sends a request to your live Rails server, fetches the HTML, and displays it. 

The magic is that it intercepts the clicks and uses **real native mobile animations** (like sliding screens and native bottom tabs) to move between pages. 

**The Good:**
*   **One Codebase, One Database:** You only have one Rails app. If you change a typo on the pricing page, it instantly updates for all web, iOS, and Android users. No App Store reviews needed.
*   **Tiny App Size:** Because the app is just a shell, the download size is incredibly small.

**The Bad:**
*   **Requires Internet:** Because the server does all the work, if the user loses cell service, the app stops working. You cannot build a true "Offline-First" app this way.

## 2. NativePHP: The "Local Server" (Laravel)

NativePHP blew the minds of the Laravel community when it launched. It was built primarily to get PHP apps onto Mac and Windows **Desktop** environments.

**How it works:**
It takes the exact opposite approach to Hotwire. It is a "Thick Client". 

When you package your app with NativePHP, it uses Electron (or Tauri) as a shell. But here is the crazy part: **It literally bundles a complete PHP runtime and a SQLite database inside the app.** 

When your user downloads your `.dmg` or `.exe` file, they are silently installing a mini-server on their computer. When they click a button, the PHP code runs locally on their CPU, and saves data to a local SQLite database on their hard drive.

**The Good:**
*   **True Offline Capability:** The app works perfectly on an airplane with no Wi-Fi. 
*   **Deep OS Integration:** NativePHP gives you simple PHP methods to interact with the operating system. You can create system tray icons, trigger native OS notifications, and read local files easily.

**The Bad:**
*   **Massive File Sizes:** You are shipping a browser, a PHP runtime, and a database to every user. The app size will be massive compared to a native app.
*   **The Syncing Nightmare:** If your app has a cloud component (like syncing notes between a desktop and a phone), you now have to write extremely complex logic to merge the user's local SQLite database with your central cloud database. 

## The Architectural Showdown

Both of these tools are masterpieces of engineering, but they serve two very different philosophies for the solo developer.

If you are building a **SaaS, a Marketplace, or a Social Network**, Hotwire Native is the absolute winner. In a SaaS, the data *must* live in the cloud. Having a local database on the user's device (like NativePHP does) creates terrifying data-syncing problems. With Hotwire Native, you manage one Postgres database, and the mobile app is just a beautiful window looking into it.

If you are building a **Utility Tool, a Markdown Editor, or a Local File Manager**, NativePHP is brilliant. You don't want a markdown editor to stop working because the internet went down. The fact that a PHP developer can build a fast, offline Mac app that lives in the menu bar, without learning Swift or Rust, is a massive achievement.

## Summary

In 2026, you do not need to be a polyglot to ship cross-platform apps. 

*   Use **Hotwire Native (Rails)** to wrap your cloud-based SaaS into a beautiful, lightweight mobile app.
*   Use **NativePHP (Laravel)** to bundle your web skills into a heavy, offline-capable desktop utility.

Stop worrying about learning mobile or desktop languages. Stick to the backend framework you love, use the wrappers the community built for you, and keep shipping products.