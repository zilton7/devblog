---
title: "TDD is a Luxury: Pragmatic Testing for the Solo Developer"
categories: selfnote
tags: [rails, testing, webdev, startups]
image:
  path: /assets/images/2026-03-02-Tdd-Is-A-Luxury-Pragmatic-Testing-For-The-Solo-Developer/feature.webp
---

## The Dogma vs. The Deadline
If you spend any time in the Rails community, you’ve heard the gospel: **Test-Driven Development (TDD) is the only way to write professional software.** You are told to write a failing test, write the code, and then refactor. 

In a large company with 50 engineers and a massive budget, TDD is a fantastic insurance policy. It prevents regressions in a complex machine with many moving parts.

But for the **One-Person Team**, TDD is often a luxury you cannot afford. 

When you are a solo dev, your biggest threat isn't a bug in a private method - it’s **Time to Market.** If you spend 50% of your week maintaining a suite of unit tests that merely "mirror" your code, you are going to get outpaced by someone who is actually shipping features.

Here is how to test like a pragmatist.

## The Problem with Unit Tests (The "Mirror" Trap)
Unit tests focus on the smallest possible parts of your app: a single method in a model, or a specific calculation in a service object. 

The problem? In a rapidly evolving MVP, your internals change constantly. 
* You rename a method. 
* You move logic from a Controller to a Service. 
* You change your database schema.

Every time you do this, your unit tests break - even if the feature still works perfectly for the user. You end up spending more time fixing tests than writing code. This is the **Maintenance Tax**, and it’s a solo dev killer.

## The Solution: System Specs (Integration Only)
If you only have time to write one type of test, make it a **System Spec**.

System Specs (using Capybara/Selenium/Playwright) simulate a real human being using your browser. They don't care if your code is in a Service Object or a Model. They only care if the button works.

### Why System Specs are the Solo Dev's Best Friend:
1. **True Confidence:** A passing unit test tells you a method works. A passing system test tells you the *feature* works.
2. **Refactor-Proof:** You can rewrite your entire backend logic, and as long as the user can still "Click Signup" and "See Dashboard," the test stays green. 
3. **High ROI:** One system test can cover your routing, controller, model, and view in one go.

## The "Golden Path" Strategy
Stop trying to reach 100% code coverage. It’s a vanity metric. Instead, focus on **Feature Coverage**.

Identify the "Golden Paths" of your app - the actions that, if broken, mean your business is dead.
* **The "Money" Path:** Can a user subscribe and pay?
* **The "Value" Path:** Can a user create a new Project/Post/Task?
* **The "Gate" Path:** Can a new user sign up?

Write one robust System Spec for each of these. If these three stay green, you can sleep at night. 

```ruby
# spec/system/subscription_spec.rb
it "allows a user to upgrade to pro" do
  login_as(user)
  visit pricing_path
  click_on "Upgrade"
  # Use Stripe Mock/VCR
  expect(page).to have_content "Welcome to Pro!"
  expect(user.reload.pro?).to be true
end
```

## When SHOULD you write a Unit Test?
I'm not saying "never write unit tests." I’m saying use them surgically.

Write a unit test only when:
1. **The Logic is Complex:** If you have a method that calculates tax rates across 50 states, don't test that through the browser. Write a unit test for that specific logic.
2. **It’s Hard to Trigger via UI:** If you have an edge case that requires a very specific database state that is hard to click through, write a unit test.

## Summary: Ship or Die
Testing is about **confidence**. 
In a team, you need confidence that *you* didn't break *someone else's* code. 
As a solo dev, you need confidence that the *user* can do what they paid for.

Don't let the "Best Practices" of a 1,000-person company slow down your 1-person startup. Focus on the Golden Paths, write System Specs, and spend the rest of your time shipping.

***

*Do you prioritize coverage or speed? Let's fight about TDD in the comments! 👇*