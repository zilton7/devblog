---
title: "Stop AI Spaghetti: Enforcing Rails Architecture in 2026"
categories: selfnote
tags: [rails, ai, architecture, productivity]
image:
 path: /assets/images/2026-04-13-Stop-Ai-Spaghetti-Enforcing-Rails-Architecture-In-2026/feature.webp
---

We are fully in the era of autonomous coding. If you use tools like Cursor, Windsurf, or Copilot Workspace, you know how fast you can move. You type a prompt, and the AI generates an entire feature - controllers, models, and views-in 10 seconds.

But there is a dark side to this speed. 

The AI does not know your personal architectural standards. If you don't watch it closely, it will put complex business logic directly into your ActiveRecord callbacks. It will make raw API calls from your ERB views. Give it a few months, and your beautiful Rails app will turn into an unmaintainable "Big Ball of Mud."

When you are generating code this fast, you cannot rely on willpower to keep things clean. You need automated guardrails. Here is how to ensure autonomously generated code stays consistent with your Rails architecture over time.

## STEP 1: The Context File (`.cursorrules`)

The easiest way to fix bad AI code is to prevent it before it is written. 

Modern AI code editors look for hidden context files in your project root (like `.cursorrules` or `.windsurfrules`). This file tells the AI *how* you expect it to behave in this specific repository. 

Instead of typing "Use a service object" in every single prompt, you define your architectural boundaries once.

Create a `.cursorrules` file in your Rails root:

```markdown
# Rails Architecture Guidelines for this Project

1. **Fat Models, Skinny Controllers are BANNED.** Controllers should only handle HTTP routing and params. Models should only handle database associations and strict validations.
2. **Business Logic:** ALL business logic must go into Plain Old Ruby Objects (POROs) inside `app/services/`. Do not use ActiveRecord callbacks (`after_save`, `after_create`) for business logic like sending emails or calling external APIs.
3. **Views:** Use Tailwind CSS for styling. Extract complex UI elements into `ViewComponent` classes instead of using Rails `_partials`.
4. **Testing:** Write Minitest System Specs for all new features. Do not write granular unit tests for private methods.
```

Now, when you tell the AI to "Build a user onboarding flow," it automatically knows to generate a `UserOnboardingService` instead of dumping 200 lines of code into the `UsersController`.

## STEP 2: Ruthless Linting with RuboCop

AI is notoriously bad at code formatting. It will mix single and double quotes, mess up indentation, and write methods that are 50 lines long. 

You need to enforce style programmatically. In Ruby, this means **RuboCop**. But you need to turn on the strict Rails-specific rules.

Add these to your Gemfile:
```ruby
group :development, :test do
  gem 'rubocop', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-performance', require: false
end
```

Create a `.rubocop.yml` file and set your boundaries. For example, if you want to stop the AI from writing massive, complex methods, enforce the `MethodLength` and `Metrics/AbcSize` cops.

```yaml
# .rubocop.yml
require:
  - rubocop-rails
  - rubocop-performance

Metrics/MethodLength:
  Max: 15

Metrics/ClassLength:
  Max: 100

Rails/SkipsModelValidations:
  Enabled: true # Stops AI from using .update_attribute and skipping your validations
```

**The Pro Move:** Set your editor to "Auto-Fix on Save." When the AI generates a messy file, you just hit `Cmd+S`, and RuboCop instantly rewrites the syntax to match your standard.

## STEP 3: Enforcing Boundaries (Packwerk)

If your app is growing large, the AI will eventually try to cross-wire different domains. It will make the `Billing` module call private methods inside the `Inventory` module. 

To stop this structurally, you can use Shopify's **Packwerk** gem. Packwerk allows you to define strict boundaries between folders in your Rails app.

You create a `package.yml` file in your folders:

```yaml
# app/services/billing/package.yml
enforce_privacy: true
enforce_dependencies: true
```

If the AI generates code in the `Orders` controller that tries to call an internal class inside the `Billing` package, Packwerk will throw a static analysis error before you even run the code. It literally blocks the AI from creating spaghetti dependencies.

## STEP 4: System Tests over Unit Tests

When you use AI, your internal code changes very fast. You might ask the AI to refactor a Service Object, and it will completely rename all the internal methods. 

If you have 100 granular Unit Tests checking those specific method names, your test suite will break every time you prompt the AI. You will spend hours fixing tests instead of shipping features.

**To survive the AI era, you must rely on System Tests (Integration Tests).**

```ruby
# test/system/onboarding_test.rb
require "application_system_test_case"

class OnboardingTest < ApplicationSystemTestCase
  test "user can sign up and reach the dashboard" do
    visit new_user_registration_path
    fill_in "Email", with: "test@example.com"
    fill_in "Password", with: "password123"
    click_on "Sign up"

    assert_text "Welcome to your Dashboard"
  end
end
```

System tests don't care *how* the AI wrote the backend logic. They don't care if the AI used a Service Object or a background job. They only care that the user can click the button and get the result. 

By writing System tests, you give the AI the freedom to refactor and optimize the internal architecture without breaking your test suite, while giving yourself 100% confidence that the app still works.

## Summary

In 2026, your job is no longer just typing code. Your job is acting as the **Editor-in-Chief** for an incredibly fast, slightly reckless junior developer.

1. **Give Context:** Use `.cursorrules` to define your architecture up front.
2. **Auto-Format:** Use RuboCop to enforce syntax rules on save.
3. **Set Boundaries:** Use static analysis (like Packwerk) to prevent tangled dependencies.
4. **Test the Output:** Rely on System Tests to verify behavior, not internal implementation.

If you set up these guardrails on day one, you can let the AI run wild, knowing your Rails app will stay clean, modular, and easy to maintain.