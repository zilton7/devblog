---
title: "Making Sense of JavaScript in Rails: Webpack, Rollup, esbuild, and Importmaps"
categories: selfnote
tags: [rails, javascript, webdev, frontend]
image:
 path: /assets/images/2026-04-18-Making-Sense-Of-Javascript-In-Rails-Webpack-Rollup-Esbuild-And-Importmaps/feature.webp
---

Very often I find myself talking to developers who are incredibly confused by the JavaScript ecosystem in Rails. 

If you run `rails new my_app` today, Rails asks you how you want to handle JavaScript. You look at the options - Importmaps, esbuild, Webpack, Rollup - and your brain hurts. You just want to write some code, but first, you have to choose a compilation strategy.

For a long time, the Rails community was stuck using `Webpacker`. It was slow, the configuration files were massive, and upgrading it broke everything. Thankfully, in 2026, we have much better options. 

Here is my honest, simple breakdown of the four major JavaScript tools, how they work, and which one you should actually pick for your next project.

## 1. Webpack (The Heavyweight Dinosaur)

Webpack is the grandfather of modern JavaScript bundlers. If you worked on Rails 5 or 6, you probably have nightmares about the `webpacker` gem.

**How it works:** It takes every single JavaScript file, CSS file, and image in your project, builds a massive dependency graph, and compiles it all into one or two giant `.js` files.

```javascript
// Webpack loves to bundle absolutely everything, even CSS
import "./style.css";
import React from "react";
```

**The Good:** It can do literally anything. It has thousands of plugins. If you are building a massive enterprise SPA (Single Page Application) with a dedicated frontend team, Webpack is battle-tested.
**The Bad:** It is notoriously slow to compile. The configuration files (`webpack.config.js`) are almost impossible to understand for a solo developer. 
**The Verdict:** Do not use Webpack for a new Rails project unless you have a very specific, complex legacy requirement.

## 2. Rollup (The Library Builder)

Rollup came out as an alternative to Webpack. It introduced a cool concept called "Tree Shaking" (throwing away code you imported but never actually used to make the file smaller).

**The Good:** It creates incredibly small, optimized bundles. 
**The Bad:** It is not really meant for building entire web applications. It was designed to build JavaScript *libraries* (like if you are publishing a package to NPM). 

*Note: While you probably won't use Rollup directly in Rails, it is worth knowing about because modern tools like **Vite** actually use Rollup under the hood for their production builds.*
**The Verdict:** Skip it for standard Rails apps.

## 3. esbuild (The Speed Demon)

When Rails 7 dropped Webpacker, they introduced `jsbundling-rails` and made **esbuild** the new star of the show.

**How it works:** esbuild does exactly what Webpack does (bundles all your JS into one file), but it is written in **Go** instead of JavaScript. 

```bash
# How you build with esbuild in your terminal
esbuild app/javascript/* --bundle --sourcemap --outdir=app/assets/builds
```

**The Good:** It is unbelievably fast. A project that takes Webpack 30 seconds to compile will take esbuild 0.3 seconds. You literally don't even see it compiling. It also perfectly handles JSX if you are writing React code.
**The Bad:** You still need to install Node.js, manage a `package.json`, and deal with the `node_modules` black hole on your computer.
**The Verdict:** If your app uses **React, Vue, or heavily customized Tailwind/PostCSS**, esbuild is the absolute best choice. It gives you the power of a bundler without the waiting time.

## 4. Importmaps (The Rails Default / No-Build)

This is the default choice for new Rails applications, and it completely changes how frontend development works.

**How it works:** Importmaps do not bundle your code. There is **no build step**. You do not need Node.js or `npm` installed on your computer at all. 

Instead of compiling libraries into one big file, your browser downloads the libraries directly from a fast CDN (Content Delivery Network) when the user loads the page.

```ruby
# config/importmap.rb
# Rails simply maps the name to a CDN URL
pin "lodash", to: "https://ga.jspm.io/npm:lodash@4.17.21/lodash.js"
```

```javascript
// app/javascript/application.js
// The browser fetches this directly from the CDN!
import _ from "lodash";
```

**The Good:** It is the ultimate "One Person Framework" tool. You never have to wait for JavaScript to compile. You hit save in your editor, refresh the browser, and it is instantly there. Your project folder stays tiny.
**The Bad:** You cannot use JSX or TypeScript, because those languages *require* a build step to be converted into plain JavaScript before the browser can read them.
**The Verdict:** If you are building a standard Rails app using **Hotwire (Turbo + Stimulus)**, this is the winner. 

## Summary: Which one should you pick?

Don't overcomplicate your stack before you even write your first line of code. Follow this simple rule:

1.  **Are you using React, Vue, or TypeScript?** Use **esbuild**. It is blazing fast and handles compiling perfectly.
2.  **Are you sticking to the Rails "Omakase" menu (Hotwire, Turbo, Stimulus)?** Use **Importmaps**. Ditching `node_modules` will make your developer life so much happier.

Webpack was great for its time, but in 2026, we value speed and simplicity. 