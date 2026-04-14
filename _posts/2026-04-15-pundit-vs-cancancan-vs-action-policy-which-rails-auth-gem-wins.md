---
title: "Pundit vs CanCanCan vs Action Policy: Which Rails Auth Gem Wins?"
categories: selfnote
tags: [rails, ruby, security, webdev]
image:
 path: /assets/images/2026-04-15-Pundit-Vs-Cancancan-Vs-Action-Policy-Which-Rails-Auth-Gem-Wins/feature.webp
---

Sometimes I find myself starting a new Rails project, and almost immediately, I hit a wall: **User Permissions**. 

Guests can read posts, users can edit their own posts, and admins can delete everything. You need an authorization system to manage this. If you try to write this logic directly inside your controllers or views with a bunch of `if/else` statements, your code will become an unreadable mess within a week.

For a long time, the Rails community was divided. Today, we have three main gems to handle this: **CanCanCan**, **Pundit**, and the newer **Action Policy**. 

Here is my honest breakdown of how they work, the pros and cons of each, and which one you should actually use for your next app.

## 1. CanCanCan (The Legacy Giant)

If you learned Rails 5 or 6 years ago, you probably used CanCanCan (a community continuation of the original `cancan` gem). 

**How it works:**
It is highly centralized. You define absolutely every permission for your entire application inside one single file called the `Ability` class.

```ruby
# app/models/ability.rb
class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new # guest user

    if user.admin?
      can :manage, :all
    else
      can :read, Post
      can :update, Post, user_id: user.id
    end
  end
end
```

Then, in your controller, you just call `authorize! :update, @post`.

**The Good:** For a very small app, it is incredibly fast to set up. You can see all the rules in one place.
**The Bad:** As your app grows, the `Ability` file becomes a nightmare. I have seen production apps with an `ability.rb` file that is 2,000 lines long. It becomes impossible to test and incredibly slow to load, because Rails has to evaluate that entire massive file on every single request.

## 2. Pundit (The Object-Oriented Standard)

Pundit was created to solve the "giant file" problem of CanCanCan. It threw away the custom syntax and went back to plain, simple Ruby.

**How it works:**
Instead of one big file, you create a separate "Policy" class for every single model in your app.

```ruby
# app/policies/post_policy.rb
class PostPolicy
  attr_reader :user, :post

  def initialize(user, post)
    @user = user
    @post = post
  end

  def update?
    user.admin? || post.user_id == user.id
  end
end
```

In your controller, you use the same `authorize @post` method, and Pundit automatically looks for the `PostPolicy` and calls the `update?` method.

**The Good:** It is incredibly clean. Because it is just plain Ruby objects returning `true` or `false`, writing tests for your policies is super easy. It scales perfectly with huge applications.
**The Bad:** It can feel a bit repetitive. You end up writing a lot of boilerplate `initialize` methods for every single policy file.

## 3. Action Policy (The Modern Speed Demon)

Action Policy is the newest challenger, built by the team at Evil Martians. It looked at Pundit and said: *"This is great, but we can make it faster and require less typing."*

**How it works:**
It looks very similar to Pundit, but it gives you a base class to inherit from, which removes the need to write `initialize` methods. It also adds powerful features right out of the box.

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  # We can alias methods so we don't repeat code!
  alias_rule :edit?, :destroy?, to: :update?

  def update?
    user.admin? || record.user_id == user.id
  end
end
```

**The Good:** 
*   **Performance:** It is heavily optimized. It caches authorization results during a request. If you check if a user can update a post 50 times in a view loop, Action Policy only calculates it once. Pundit calculates it 50 times.
*   **Less Code:** Features like `alias_rule` save you from writing duplicate methods.
*   **GraphQL Integration:** If you are building a modern API with Ruby-GraphQL, Action Policy integrates flawlessly.

**The Bad:** It has a slightly larger learning curve if you want to use its advanced caching and scoping features compared to the absolute simplicity of Pundit.

## Summary: Which one should you pick?

Don't overcomplicate your decision. Here is the golden rule I follow today:

1.  **Do not use CanCanCan for new projects.** It is great for legacy codebases, but the centralized design pattern is an anti-pattern for modern, scalable web apps.
2.  **Use Pundit** if you want the most "standard" approach. Almost every Rails developer knows how to read Pundit code, and the documentation is everywhere.
3.  **Use Action Policy** if you are building a highly performant app, an API, or if you just hate writing boilerplate code. 

Personally, I have completely switched to **Action Policy** for all my new Rails 8 apps. The built-in caching and the cleaner syntax make it the absolute winner for modern Ruby development.