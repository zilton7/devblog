---
title: "Where Does gem install Actually Go? Exploring the Ruby Filesystem"
categories: selfnote
tags: [ruby, rails, learning, devops]
image:
  feature: /assets/images/2026-02-25-Where-Does-Gem-Install-Actually-Go-Exploring-The-Ruby-Filesystem/feature.webp
---

We type `gem install rails` or `bundle install` every day. Text scrolls down the screen, and suddenly we can use the library.

But where did it go? Is it in your project folder? Is it in your operating system? How does Ruby know you have `rails 7.1.0` and not `rails 7.0.0`?

To master the Ruby environment, you need to understand the physical file structure. Here is what happens under the hood.

## 1. The Ruby Version Manager (The Traffic Cop)

Before we talk about gems, we have to talk about **Ruby** itself.
If you use a version manager like **rbenv** or **asdf** (which you should), you don't actually run the "real" Ruby when you type `ruby`. You run a **Shim**.

When you type `ruby -v`, your shell looks at your `$PATH`.
```bash
$ which ruby
/Users/zil/.rbenv/shims/ruby
```

This "Shim" checks your `.ruby-version` file, sees "3.3.0", and then redirects your command to the **real** physical location of that Ruby executable, usually hidden deep in your home directory:

```text
/Users/zil/.rbenv/versions/3.3.0/bin/ruby
```

**Key Takeaway:** Every version of Ruby you install is a completely separate island. They do not share files. They do not share gems.

## 2. Where do the Gems live?

A "Gem" is just a zip file containing Ruby code. When you install it, it gets unzipped into a specific folder dedicated to your current Ruby version.

To find out exactly where, run this command:
```bash
gem env
```

Look for `INSTALLATION DIRECTORY`. It will look something like this:
```text
/Users/zil/.rbenv/versions/3.3.0/lib/ruby/gems/3.3.0
```

Inside that folder, there is a `gems` directory. If you open that in your file explorer, you will see the raw code for every library you have installed:

```text
/gems/
  ├── activejob-8.0.0/
  ├── pg-1.5.4/
  ├── rails-8.0.0/
  └── sidekiq-7.2.0/
```

**The Physical Reality:**
When you require `sidekiq`, Ruby isn't doing magic. It is literally just looking inside `/Users/zil/.rbenv/versions/3.3.0/lib/ruby/gems/3.3.0/gems/sidekiq-7.2.0/lib/` and reading the `.rb` files.

## 3. How Ruby Finds the Files (The `$LOAD_PATH`)

So, how does `require 'json'` know where to look?
Ruby has a global array variable called `$LOAD_PATH` (or `$:` for short). This is a list of folder paths.

When you say `require 'json'`, Ruby loops through every folder in that list checking: "Is `json.rb` in here? No. Next folder. Is it here? Yes. Load it."

You can see this list yourself. Open `irb` and type:
```ruby
puts $LOAD_PATH
```
You will see a long list of those directory paths we found earlier.

## 4. The Bundler Magic Trick

Here is the problem:
Your filesystem might have **Rails 7** AND **Rails 8** installed in that `gems` folder.
If you type `require 'rails'`, which one does Ruby pick? By default, it picks the latest one.

But what if your legacy app needs Rails 7?

This is where **Bundler** steps in.
When you run `bundle exec rails server`, Bundler hijacks the startup process.

1.  It reads your `Gemfile.lock`.
2.  It sees you need `rails 7.0.0`.
3.  It **modifies the `$LOAD_PATH`** in memory before your app starts.
4.  It removes the path to Rails 8.
5.  It adds the path to Rails 7.

This is why `bundle exec` is so important. It creates a "Sandbox" where only the specific versions in your lockfile exist.

## 5. Vendor/Bundle (The Project-Level Install)

Sometimes, on servers (or in Docker), you will see people run:
```bash
bundle install --path vendor/bundle
```

This changes the `INSTALLATION DIRECTORY` we looked at in Step 2.
Instead of installing gems into the global `~/.rbenv/...` folder, it installs them **inside your project folder** in a directory called `vendor`.

*   **Pros:** The project is 100% self-contained. You can delete the project folder and all its gems are gone.
*   **Cons:** It uses more disk space (if you have 5 Rails apps, you have 5 copies of Rails on your disk).

## Summary

1.  **Version Managers** isolate Ruby installations in your home folder.
2.  **Gems** are just folders of code living inside those version folders.
3.  **`$LOAD_PATH`** is the map Ruby uses to find files.
4.  **Bundler** edits that map at runtime to ensure you only load the versions you promised in your Gemfile.

Next time you get a "Gem Not Found" error, don't panic. Run `gem env`, find the folder, and look to see if the files are actually there.

***

*Did you know you can open any gem's source code by typing `bundle open gem_name`? Try it!*
