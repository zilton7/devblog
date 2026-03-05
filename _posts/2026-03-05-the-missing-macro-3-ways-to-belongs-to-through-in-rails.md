---
title: "The Missing Macro: 3 Ways to "belongs_to :through" in Rails"
categories: selfnote
tags: [rails, ruby, webdev, architecture]
image:
  feature: /assets/images/2026-03-05-The-Missing-Macro-3-Ways-To-Belongs-To-Through-In-Rails/feature.webp
---

## The Missing Link
If you’ve spent more than a week with Ruby on Rails, you’ve probably used `has_many :through`. It’s the standard way to reach "down" across associations (e.g., a Company has many Employees through Departments).

But eventually, you'll try to go the other way. You'll want to call `@employee.company`. You might instinctively try to write:

```ruby
# Warning: This is not a real thing!
belongs_to :company, through: :department
```

**Rails does not have a `belongs_to :through` macro.** 

However, reaching that "grandparent" model is a common requirement. Here are the three best ways to achieve the same result, depending on whether you need simple syntax or powerful database querying.

---

## 1. Using `delegate` (The Cleanest Way)
This is the most "Rails-y" way to handle upward associations. It follows the **Law of Demeter** by allowing the child to "talk" to the grandparent through the parent, but keeping the syntax clean.

```ruby
class Company < ApplicationRecord
  has_many :departments
end

class Department < ApplicationRecord
  belongs_to :company
  has_many :employees
end

class Employee < ApplicationRecord
  belongs_to :department
  
  # This creates a shortcut to employee.department.company
  delegate :company, to: :department, allow_nil: true
end
```

**Usage:**
```ruby
@employee.company # Returns the Company object
```

*   **Pros:** Very clean, handles `nil` safely if you use `allow_nil: true`.
*   **Cons:** It’s a Ruby method shortcut, not a true ActiveRecord association. You can't easily do `Employee.joins(:company)`.

---

## 2. Using `has_one :through` (The ActiveRecord Way)
Wait, `has_one`? Isn't that for children? 

Actually, you can use `has_one :through` to reach "up" to a grandparent. This is the best choice if you need to use the association in complex ActiveRecord queries.

```ruby
class Employee < ApplicationRecord
  belongs_to :department
  
  # Reaching "up" to the grandparent via the parent
  has_one :company, through: :department
end
```

*   **Pros:** It acts like a real association. You can perform `Employee.includes(:company)` to avoid N+1 queries or filter your list: `Employee.joins(:company).where(companies: { name: 'Apple' })`.
*   **Cons:** It can be confusing to read. Usually, `has_one` implies the foreign key is on the *other* table, but here it is traversing "up" the chain.

---

## 3. Using a Plain Method (The Simple Way)
If you don't need to query against the grandparent and just want the data for a quick view or a background job, a plain Ruby method is perfectly fine.

```ruby
class Employee < ApplicationRecord
  belongs_to :department

  def company
    department&.company
  end
end
```

*   **Pros:** Zero "magic." Any Ruby developer can understand what is happening.
*   **Cons:** No support for eager loading or advanced querying.

---

## Comparison: Which one should you use?

| Goal | Best Option |
| :--- | :--- |
| Just need to call `.company` in a view | `delegate` |
| Need to filter/query (`Employee.where(companies: { name: 'Apple' })`) | `has_one :through` |
| Need to access several attributes (name, ID, address) | `delegate :name, :id, to: :company, prefix: true` |

---

## A Note on Database Design
If you find yourself needing `belongs_to :through` (or its equivalents) across every single model in your app, it might be a sign that your database is "too deep." 

Deeply nested associations can lead to performance bottlenecks. In some cases, developers choose to **denormalize** the data by adding a direct foreign key to the child (e.g., adding `company_id` directly to the `Employee` table). 

This makes queries lightning fast, but it adds the burden of keeping those IDs in sync if a department moves to a different company. Trade-off wisely!

***

*Do you prefer the explicitness of a method or the power of has_one :through? Let's discuss in the comments!*