---
title: "Demystifying Rails Magic: How Autoloading Actually Works"
categories: selfnote
tags: [rails, ruby, zeitwerk, learning]
image:
 path: /assets/images/2026-06-10-Demystifying-Rails-Magic-How-Autoloading-Actually-Works/feature.webp
---

I remember when I first started learning Ruby outside of Rails. I was building a small script, and my code kept crashing with `NameError: uninitialized constant`. I was so confused because I knew the file existed. I realized that in plain Ruby, you have to manually add `require './user'` at the top of every single file.

In Rails, you never do this. You just type `User.first` or `OrderService.new` and it "just works." People often call this "Rails Magic," but it isn't magic at all. It is a very structured system called **Zeitwerk**. 

Understanding how this works will help you stop fighting the file system and start using the framework properly. Here is the breakdown of how Rails manages to "auto-import" your code.

## Level 1: The Convention (Snake Case to CamelCase)

The core of the magic is a very strict naming rule. Rails assumes that your file names match your class names perfectly.

*   If your class is `User`, the file must be `user.rb`.
*   If your class is `UserCredential`, the file must be `user_credential.rb`.
*   If your class is inside a folder like `app/services/billing/payout_manager.rb`, the class name must be `Billing::PayoutManager`.

If you break this rule - for example, naming your file `payouts.rb` but naming the class `PayoutManager` - Rails will crash. It uses these names to find the files on your hard drive.

## Level 2: The Engine (Zeitwerk)

Since Rails 6, the engine that handles this is called **Zeitwerk**. 

When your Rails app starts up, Zeitwerk scans all the folders inside `app/` (models, controllers, jobs, etc.). It builds a map of all the files.

When you type `User` in your code, Ruby looks at its own memory and says: *"I don't know what 'User' is."* Normally, this would trigger an error. But Zeitwerk intercepts that error and says: *"Wait! I know where that is. Based on the name 'User', it should be in `app/models/user.rb`."* 

Zeitwerk then runs a hidden `require` for that file, loads the class into memory, and your code continues running as if the class was always there.

## Level 3: Why This is Different from Elixir

I noticed a lot of senior roles (like the **Remote** job description above) are moving toward **Elixir and Phoenix**. It is interesting to compare the two.

In **Elixir**, you don't have "autoloading" in the same way. Elixir is a compiled language. When you start a Phoenix app, the compiler reads all your modules and links them together before the app even starts.

In **Rails**, everything is dynamic. Classes can be loaded, deleted, and reloaded while the app is running. This leads us to the most useful feature for solo developers: **Reloading**.

## Level 4: Hot Reloading in Development

It is very annoying to restart your server every time you change a line of code. Because Rails uses Zeitwerk for autoloading, it can also do "autounloading."

In `development` mode, Zeitwerk watches your files. When you save `user.rb`, Zeitwerk wipes the `User` class from Ruby's memory. The next time a request comes in, Zeitwerk sees that `User` is missing, finds the updated file, and loads it again. 

This is why you can edit a Rails app and see the changes instantly in the browser. 

## Level 5: When the Magic Fails

Even the best magic has limits. You will usually run into "Autoloading Errors" in two cases:

1.  **The `lib/` folder:** By default, Rails does NOT autoload files in the `lib/` directory. If you put a class there, you still have to use `require`. (Most devs fix this by adding `lib` to the `config.autoload_paths` in `application.rb`).
2.  **Initializers:** Files in `config/initializers` only run once when the server starts. If you change a file there, you **must** restart the server.

## Summary

Rails "magic" is just a very smart agreement between you and the framework. 

1.  **Strict Naming:** Name your files `snake_case` and your classes `CamelCase`.
2.  **Zeitwerk:** The engine that handles the loading so you don't have to write `require`.
3.  **Efficiency:** Only the code you actually use gets loaded into memory.

Once you respect the naming conventions, the magic stays out of your way and lets you focus on building features.