---
title: Using Ruby Model Classes and Service Objects

categories: selfnote
tags: [ruby, rails,  'service object', 'model class']
image:
  feature: /assets/images/2025-11-22-Model-Classes-and-Service-Objects/ruby.webp
---

Using a **model class** (even a simple PORO in `app/models`) for features has several advantages in Rails.
This is why developers often prefer “a model class” over scattering logic in controllers, helpers, or initializers.

![Cover Image of the Article]({{ site.url }}{{ site.baseurl }}/assets/images/2025-11-22-Model-Classes-and-Service-Objects/ruby.webp)

Below are the **key advantages**:

---

# ✅ 1. **Centralized, reusable logic**

If a feature’s logic is placed in a model class (e.g., `FeatureFlag`, `BetaAccess`, `Onboarding`), you can reuse it from:

* controllers
* views
* background jobs
* services
* Pundit policies

Instead of duplicating the logic in multiple places.

---

# ✅ 2. **Keeps controllers and views clean**

Rails controllers and views should stay thin.
Putting domain logic in a model keeps your design clean (Fat Model, Skinny Controller).

Example:
Instead of:

```ruby
if user.admin? && SomeConfig.beta_enabled?
```

You do:

```ruby
if BetaAccess.allowed_for?(user)
```

---

# ✅ 3. **Better testability**

Models are the easiest to test:

```ruby
RSpec.describe BetaAccess do
  describe ".allowed_for?" do
    # ...
  end
end
```

No need to spin up controllers or simulate web requests.

---

# ✅ 4. **Encapsulation of rules**

If your feature has logic that may grow, models keep it in one place.

Example: onboarding flow:

```ruby
class Onboarding
  def completed?(user)
    user.profile_filled? && user.verified? && user.tutorial_done?
  end
end
```

If later you add new onboarding rules — you update one class.

---

# ✅ 5. **Better naming + improved readability**

A dedicated model communicates intent clearly:

```ruby
if FeatureFlag.enabled?(:new_ui)
```

is more readable than:

```ruby
if Rails.configuration.x.new_ui_enabled
```

or random constants.

---

# ✅ 6. **Supports persistence easily later**

You might start with:

```ruby
class FeatureFlag
  FLAGS = { new_ui: false }
end
```

Later decide to store flags in DB:

```ruby
class FeatureFlag < ApplicationRecord
end
```

Same interface, no major changes in the rest of the app.

---

# ✅ 7. **Integrates cleanly with Pundit / CanCan / services**

A model class naturally fits into authorization and service layers.

Example:

```ruby
class FeatureFlagPolicy < ApplicationPolicy
  def enable?
    user.admin?
  end
end
```

This wouldn’t be as clean if the logic lived in a helper or initializer.
---

# Why use model classes for features?
Using a model (ActiveRecord or PORO) gives you:

* Clean architecture
* Centralized logic
* Reusability
* Easier testing
* Readable code
* Extensibility if the feature grows
* Smooth integration with Pundit and other layers

---

# What about Service Object?

**You *can* use a service** or other patterns.
A model class is *not* the only valid approach.

The reason some teams choose a *model* instead of a *service* depends on what kind of logic they are modeling.

Here’s a clear breakdown.

---

# ✅ **Why not a service? (When a service is the wrong fit)**

## **1. Services are for *actions*, not *state***

A service object usually represents something the system *does*:

* `SendEmail.new.call`
* `ImportCsv.new.call`
* `CreateSubscription.new.call`

Services are “verb-like.”

Feature flags (or similar domain rules) are *not actions*.
They’re **state + rules about state**.

Example:

```ruby
FeatureFlag.enabled?(:new_ui)
```

A service would feel unnatural:

```ruby
FeatureFlagChecker.new(:new_ui).call
```

You’re not *doing* anything; you're *querying domain state*.

---

## **2. Services don’t naturally hold reusable domain logic**

If you put your logic in a service, you often end up with this anti-pattern:

* One service to check feature flags
* Another to read them
* Another to list them
* Another to validate something
* Another for authorization

The logic becomes scattered.

A model consolidates it.

---

## **3. Services can’t be easily plugged into Rails tools**

Rails gives you conveniences for models:

* Cleaner testing
* Namespacing (`app/models`)
* Integration with Pundit
* Lazy loading / autoload
* DB migrations if you later add persistence

Services don’t get these benefits.

---

# ✅ **Why a model is often the better fit**

## **1. It represents a *domain concept***

Feature flags, onboarding rules, eligibility rules, user states —
these aren’t actions.
These are *entities in your domain*.

Rails convention: entities → model classes.

Example domain models that aren’t ActiveRecord:

* `Authenticator`
* `Cart`
* `Checkout`
* `Onboarding`
* `SubscriptionRules`
* `FeatureFlag`

Rails devs often keep PORO domain models in `app/models`.

---

## **2. Models provide a clear, consistent API**

Models give you intuitive, domain-driven APIs:

```ruby
FeatureFlag.enabled?(:new_ui)
Eligibility.for(user).allowed?
Onboarding.completed?(user)
PlanPrice.for(:premium)
```

Services… not so much:

```ruby
FeatureFlagService.new(:new_ui).enabled?
EligibilityService.new(user).allowed?
OnboardingService.new(user).completed?
```

This is more verbose, less “domain-sounding.”

---

## **3. Models grow better over time**

Feature flags start simple but later evolve:

* per-user access
* groups / roles
* rollout percentages
* time-based enabling
* database storage
* admin UI
* audit logs

Models evolve cleanly.

Services become spaghetti when they accumulate state + logic.

---

# 🆚 **So when would a service be better?**

A service is appropriate if:

* The feature is about **executing a task**
* Something that has a start and end
* It produces a result or side effect

Examples:

* `GenerateReport`
* `ChargeCreditCard`
* `SendWelcomeEmail`

Not good for:

* feature flags
* eligibility checks
* rules
* state machines
* business constraints

Those map better to models.

---

# **What is an Interactor?**

In Rails (especially with gems like [ActiveInteractor](https://github.com/collectiveidea/interactor) or [Interactor](https://github.com/collectiveidea/interactor)), an **Interactor** is a pattern for encapsulating **a single unit of business logic** — usually a **transactional action** that may:

* Take input
* Perform a multi-step operation
* Return a result (success/failure)
* Handle errors cleanly

Think of Interactors as **“coordinators of actions”**, often orchestrating multiple models and services.

Example:

```ruby
class CreateOrder
  include Interactor

  def call
    order = Order.create!(context.params)
    PaymentProcessor.charge(order)
    NotificationMailer.order_created(order).deliver_later

    context.order = order
  rescue StandardError => e
    context.fail!(error: e.message)
  end
end
```

---

# 2️⃣ **Models vs Services vs Interactors**

| Concept        | Responsibility                                                                              | Examples                                                |
| -------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Model**      | Represents domain state & rules; encapsulates attributes & behavior                         | `FeatureFlag`, `User`, `Subscription`                   |
| **Service**    | Performs a discrete action; can use multiple models                                         | `PaymentProcessor`, `EmailSender`                       |
| **Interactor** | Orchestrates **a workflow or transaction** using models & services; handles success/failure | `CreateOrder`, `SendWeeklyReport`, `EnrollUserInCourse` |

**Key difference:**

* Services = do **one thing**
* Interactors = **orchestrate multiple things** as a single business operation

---

# 3️⃣ **How Interactors Fit Between Models and Services**

1. **Models** → hold state and domain logic

   ```ruby
   FeatureFlag.enabled?(:new_ui)
   ```
2. **Services** → perform actions related to one model or domain

   ```ruby
   PaymentProcessor.charge(order)
   ```
3. **Interactors** → coordinate multiple models and services into a single, transactional workflow

   ```ruby
   CreateOrder.call(params: order_params)
   ```

**Analogy:**

* Model = **the Lego bricks**
* Service = **a single Lego creation** (one feature like a door or wheel)
* Interactor = **the full Lego set** (puts multiple creations together into a working system)

---

# 4️⃣ **When to use Interactors vs Service vs Model**

* **Use a Model**: for state, rules, calculations, or queries
* **Use a Service**: for single actions that act on models
* **Use an Interactor**: for multi-step workflows that may fail and need clean orchestration

Example workflow:

```ruby
# Model
class User; end
class FeatureFlag; end

# Service
class WelcomeEmailSender; end

# Interactor
class OnboardNewUser
  include Interactor

  def call
    user = User.create!(context.params)
    WelcomeEmailSender.send(user)
    context.success_message = "Welcome #{user.name}!"
  rescue => e
    context.fail!(error: e.message)
  end
end
```

---

# 🎯 **Summary**

| Pattern                          | Best for                                          | Bad for                                  |
| -------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| **Model (PORO or ActiveRecord)** | Domain concepts, rules, states                    | One-time actions                         |
| **Service**                      | Executable actions (“do X”)                       | Representing domain objects              |
| **Initializer / config**         | Static rules                                      | Rules that may grow or need dependencies |
| **Interactor**                   | Orchestrating multi-step workflows / transactions | Single-purpose state or simple rules     |


---

