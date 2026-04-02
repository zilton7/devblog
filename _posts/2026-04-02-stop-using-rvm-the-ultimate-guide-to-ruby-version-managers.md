---
title: "Stop Using RVM: The Ultimate Guide to Ruby Version Managers"
categories: selfnote
tags: [ruby, rails, tools, productivity]
image:
 path: /assets/images/2026-04-02-Stop-Using-Rvm-The-Ultimate-Guide-To-Ruby-Version-Managers/feature.webp
---

# rbenv vs rvm vs asdf vs mise vs chruby vs direnv

Very often I see beginners getting completely stuck trying to install Ruby on their Mac or Linux machine. You read one tutorial, and it tells you to install RVM. You read another, and it tells you to use rbenv. Then someone on Twitter tells you to use asdf.

It is very confusing. Why do we even need these tools? 

Because different Rails projects require different Ruby versions. If you try to run a legacy Rails 6 app on Ruby 3.3, it will crash. You need a tool to quickly switch between Ruby versions depending on which project folder you are in.

Here is my honest breakdown of all the popular version managers, how they work, and which one you should actually use today.

## 1. RVM (The Dinosaur)

RVM (Ruby Version Manager) is the oldest tool on this list. 

**How it works:** It overrides your terminal commands (like `cd`) to switch Ruby versions automatically. It also has a feature called "gemsets" to keep your gems separated.
**The Verdict:** **Do not use this.** 
In the past, RVM was amazing. But today, `Bundler` handles gem isolation for us, so "gemsets" are useless. RVM is too heavy, messes with your shell too much, and is generally considered outdated. 

## 2. rbenv (The Reliable Standard)

This is probably the most popular choice in the Ruby community right now. 

**How it works:** It uses "shims". A shim is a fake executable. When you type `ruby -v`, rbenv catches that command, checks if you have a `.ruby-version` file in your current folder, and then passes the command to the correct physical Ruby installation.

```text
# .ruby-version
3.3.0
```

**The Verdict:** **Highly Recommended.**
It is lightweight, does exactly one thing, and stays out of your way. If you only write Ruby code, this is a perfectly safe choice.

## 3. chruby (The Minimalist)

If you hate "magic" and fake executables, `chruby` is for you.

**How it works:** It does not use shims. When you switch Ruby versions, it simply modifies your computer's `$PATH` variable to point directly to the correct Ruby folder. 

```bash
# Terminal command to switch versions
chruby ruby-3.3.0
```

**The Verdict:** **Great, but manual.**
It is incredibly fast and clean. The only downside is that it doesn't automatically switch versions when you enter a directory unless you install a secondary tool (like `auto.sh` or `direnv`).

## 4. asdf (The All-In-One)

Eventually, you will realize you don't just need to manage Ruby. You also need to manage Node.js versions, Python versions, and maybe Postgres versions. 

**How it works:** `asdf` uses a plugin system. You install the tool once, and then add plugins for whatever languages you need. It uses a file called `.tool-versions` instead of `.ruby-version`.

```text
# .tool-versions
ruby 3.3.0
nodejs 20.0.0
```

**The Verdict:** **Good, but getting slow.**
It is extremely useful to have one tool for all languages. However, `asdf` is written in Bash, and when you have many plugins, it can actually make your terminal commands noticeably slower. 

## 5. mise (The New King)

Previously known as `rtx`, this is taking over the developer world right now. 

**How it works:** `mise` is basically a clone of `asdf`, but it is written in Rust. This makes it blazing fast. It doesn't use shims like rbenv or asdf, it modifies your `$PATH` like chruby. 

The best part? It is backwards compatible. It automatically reads your old `.ruby-version`, `.nvmrc`, and `.tool-versions` files and just works.

```bash
# Installing ruby with mise
mise install ruby@3.3.0
mise use ruby@3.3.0
```

**The Verdict:** **The Best Choice Today.**
If you are setting up a new computer, install `mise`. It manages all your languages, it is incredibly fast, and you don't have to deal with slow terminal boot times.

## 6. direnv (The Sidekick)

I added this to the list because people often get confused by it. `direnv` is **not** a Ruby version manager. 

**How it works:** It is an environment variable manager. You put a `.envrc` file in your project folder, and when you `cd` into that folder, `direnv` automatically loads those variables into your terminal (like API keys or Database URLs).

```bash
# .envrc
export STRIPE_KEY="sk_test_123"
```

People often pair `direnv` with `chruby` or `rbenv` to trigger the Ruby version switch automatically. But if you use `mise`, you don't really need `direnv` anymore, because `mise` manages environment variables too!

## Summary: What should you pick?

*   If you want the industry standard and **only care about Ruby**: Use **rbenv**.
*   If you want to manage Ruby, Node, and Postgres and want the **fastest tool available**: Use **mise**.
*   If you have **RVM** installed: Uninstall it and pick one of the two above.

That's pretty much it. Setting up your environment is annoying, but once you pick a modern tool like `mise` or `rbenv`, you never have to think about it again.