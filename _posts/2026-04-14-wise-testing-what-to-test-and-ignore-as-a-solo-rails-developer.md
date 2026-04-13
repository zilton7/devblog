---
title: "Wise Testing: What to Test (and Ignore) as a Solo Rails Developer"
categories: selfnote
tags: [rails, ruby, testing, startups]
image:
 path: /assets/images/2026-04-14-Wise-Testing-What-To-Test-And-Ignore-As-A-Solo-Rails-Developer/feature.webp
---

Solo founders fail for a completely preventable reason. It’s not because their idea was bad, and it’s not because they couldn't code. It’s because they spent 4 weeks writing unit tests for a product that had zero paying customers.

In the enterprise world, 100% test coverage is an insurance policy. In the startup world, as a One-Person Team, **100% test coverage is a death sentence.** You will run out of momentum and quit before you launch.

But you can't just ship with *zero* tests, or you will be too terrified to deploy updates on a Friday. 

You need **Wise Testing**. This is the art of getting 90% confidence with 10% of the code. By sticking to Rails defaults (Minitest and Fixtures), you can build a safety net that protects your business without slowing down your MVP. 

Here is my exact guide on what to test, and more importantly, what to completely ignore.

## RULE 1: What NOT to Test (The Time Wasters)

The biggest mistake beginners make is testing the Rails framework. Rails has thousands of contributors who already tested `ActiveRecord`. You do not need to test it again.

**Do NOT test validations:**
```ruby
# A useless test
test "user is invalid without an email" do
  user = User.new(email: nil)
  assert_not user.valid?
end
```
If you wrote `validates :email, presence: true` in your model, trust that Rails works.

**Do NOT test basic CRUD controllers:**
Don't write isolated controller tests just to check if the `index` action returns a 200 status code. It is a massive waste of time. Your System Tests will catch if the page crashes.

**Do NOT test third-party UI:**
If you are using Tailwind UI or a component library, don't write tests to ensure a button is blue. 

## RULE 2: The "Golden Path" System Tests (High ROI)

If you only have time to write one type of test, write **System Tests**. 

A system test boots up a real browser (using Capybara and Selenium/Playwright), navigates your app, and clicks buttons like a real human. 

Why is this the best use of your time? Because one system test implicitly tests your routing, your controller, your database, and your view rendering all at once.

Identify the **"Golden Paths"** of your app. These are the 2 or 3 flows that *must* work for your business to survive. 

For a SaaS, the Golden Path is usually:
1. User signs up.
2. User creates the core resource (e.g., a "Project").
3. User upgrades to a paid plan.

```ruby
# test/system/onboarding_test.rb
require "application_system_test_case"

class OnboardingTest < ApplicationSystemTestCase
  test "user can sign up and create a project" do
    # 1. Sign up
    visit new_user_registration_path
    fill_in "Email", with: "founder@example.com"
    fill_in "Password", with: "secret123"
    click_on "Sign Up"

    # 2. Core Business Action
    click_on "New Project"
    fill_in "Name", with: "My Awesome MVP"
    click_on "Save"

    # 3. Verify Success
    assert_text "Project was successfully created."
    assert_text "My Awesome MVP"
  end
end
```

If this single test passes, you have a 90% guarantee that your app is functional. 

## RULE 3: Surgical Unit Tests (The Money and the Math)

You skipped testing basic models and controllers. So when *do* you write unit tests?

You write them for **Custom Business Logic**. If a method calculates a tax rate, processes a Stripe webhook, or filters sensitive data, you must test it in isolation. 

Always extract this complex logic into Plain Old Ruby Objects (Service Objects), and test those.

```ruby
# test/services/commission_calculator_test.rb
require "test_helper"

class CommissionCalculatorTest < ActiveSupport::TestCase
  test "calculates 10 percent commission for standard affiliates" do
    # Standard math logic that MUST be right
    calculator = CommissionCalculator.new(amount: 100_00, rate: 0.10)
    assert_equal 10_00, calculator.payout
  end

  test "returns zero if order is refunded" do
    calculator = CommissionCalculator.new(amount: 100_00, rate: 0.10, refunded: true)
    assert_equal 0, calculator.payout
  end
end
```

Test the things that would cause you to lose money or leak private data if they broke. 

## RULE 4: Embrace Rails Fixtures (Skip FactoryBot)

The RSpec world loves `FactoryBot`. Factories are great, but they dynamically generate and insert database records on every single test run. As your app grows, this makes your test suite agonizingly slow. 

Rails defaults to **Fixtures**. Fixtures are simply YAML files that get loaded into your test database *once* when the test suite boots. 

```yaml
# test/fixtures/users.yml
zil:
  email: zil@example.com
  encrypted_password: <%= User.new.send(:password_digest, 'password') %>
  plan: pro
```

```ruby
# Inside your tests, you just reference the name:
user = users(:zil)
```

For a solo developer, Fixtures are the ultimate speed hack. Your Minitest suite will run in a fraction of a second, meaning you will actually run it frequently while coding.

---

> 💡 **Want the complete system?**
> If this pragmatic approach resonates with you and you want to see exactly how I set up my test suites from scratch, I’ve put my entire testing workflow into a comprehensive guide. Check out **[Wise Testing: The Solo Founder's Guide to Rails Quality](https://norvilis.gumroad.com/l/wise-testing?utc_source=blogpost)** to learn how to test Stripe webhooks, handle complex fixtures, and set up lightning-fast CI pipelines.

---

## Summary: The Wise Testing Checklist

Before you write a test, ask yourself: *"If this breaks, does the business fail, or does it just look a little weird?"*

1.  **Do not test Rails.** (Validations, associations, simple controllers).
2.  **Write 3-5 System Tests.** Cover the absolute critical paths (Signup, Core Value, Checkout).
3.  **Write Surgical Unit Tests.** Only test complex math, money, and security logic.
4.  **Use Minitest and Fixtures.** Keep your test suite boring, fast, and dependency-free.

Ship the MVP. Let the users find the small bugs. Use your automated tests to protect the big ones.
