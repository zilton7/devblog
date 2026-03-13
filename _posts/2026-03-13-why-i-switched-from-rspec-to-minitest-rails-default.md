---
title: "Why I Switched from RSpec to Minitest (Rails Default)"
categories: selfnote
tags: [rails, ruby, testing, minitest]
image:
 path: /assets/images/2026-03-13-Why-I-Switched-From-Rspec-To-Minitest-Rails-Default/feature.webp
---

## The Industry Standard
If you’ve been in the Rails ecosystem for a while, RSpec is likely your default. It’s what most bootcamps teach, it’s what most enterprise companies use, and it’s undeniably powerful. The "Better Specs" guide is practically the Ruby bible.

But recently, I did the unthinkable: **I deleted the `rspec-rails` gem and went back to the Rails default.**

It wasn't because RSpec is bad - it’s because the Rails default (Minitest) has become the better choice for the solo developer. Here is why.

---

## 1. It’s Just Ruby
RSpec is a massive Domain Specific Language (DSL). To use it, you have to learn a new vocabulary: `describe`, `context`, `it`, `before`, `let`, `let!`, `subject`, and `expect(...).to receive(...)`.

Minitest, on the other hand, is just **Ruby classes and methods**.

```ruby
# Minitest
class UserTest < ActiveSupport::TestCase
  test "should be valid" do
    user = User.new(name: "Zil")
    assert user.valid?
  end
end
```

There is no "magic" syntax. If you know how to write a Ruby method, you know how to write a test. When a Minitest test fails, you get a standard stack trace that looks like the rest of your app.

## 2. Speed (The TDD Essential)
As a solo developer, the loop between "Write Code" and "Run Test" needs to be as tight as possible. 

RSpec is heavy. It has a significant boot-time overhead. Even with `spring` or `bootsnap`, RSpec often feels sluggish. Minitest is famously lightweight. It starts instantly and runs incredibly fast. When your test suite grows to 1,000+ tests, that speed difference becomes the difference between running tests after every save or only running them before a push.

## 3. The "Omakase" Philosophy
Rails is an "Omakase" framework (the chef chooses the ingredients). 

Every time you replace a Rails default (like switching Minitest for RSpec), you are creating **Maintenance Debt**.
*   You have to find the RSpec-specific version of every tutorial.
*   You have to wait for `rspec-rails` to update when a new Rails version drops.
*   You have to configure extra gems (like `factory_bot_rails`) because you’ve opted out of the integrated Rails flow.

By sticking to the default, everything "just works." The Rails Guides—which are some of the best documentation in the world—use Minitest. No translation is required.

## 4. Fixtures > FactoryBot
The RSpec culture is deeply tied to **FactoryBot**. Factories are great, but they are slow because they hit the database constantly to build complex object trees.

The Rails default is **Fixtures**. For years, fixtures were considered "brittle." But in modern Rails, fixtures are:
1.  **Fast:** They are loaded into the database once at the start of the suite.
2.  **Referential:** You can define a `user` and a `post` and link them by name, and Rails handles the IDs.
3.  **Real:** They force you to think about what "valid data" looks like for your app as a whole.

Switching to the Rails default usually means switching back to Fixtures, and the performance boost for your test suite is massive.

## 5. Less "Clever" Code
RSpec encourages you to be "clever." You spend time debating whether to use `let` or `let!`, or trying to write one-liner expectations that read like English.

Minitest is boring. It encourages you to write plain, repetitive, readable code. 
**Boring is good for tests.** 
In six months, when a test fails, you don't want to spend 10 minutes untangling a web of nested `context` blocks and `subject` overrides. You want to see exactly what was being tested in plain Ruby.

---

## Summary
RSpec is a luxury car. It’s beautiful, it has every feature, and it makes a statement. 

But for the **One-Person Framework** era, I want a bicycle. I want something light, fast, easy to maintain, and something that doesn't require a special manual to repair. 

If you haven't tried the Rails default in a few years, give it a shot on your next side project. You might find that you don't miss the "magic" as much as you thought.

***

*Are you an RSpec lifer or have you embraced the Minitest way? Let's discuss (civilly!) below. 👇*