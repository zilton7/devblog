---
title: "Ruby vs. Python: Why I Choose Happiness Over Hype"
categories: selfnote
tags: [ruby, python, career, discuss]
image:
 path: /assets/images/2026-03-09-Ruby-Vs-Python-Why-I-Choose-Happiness-Over-Hype/feature.webp
---

Let’s get the elephant out of the room immediately: **Python has won the popularity contest.**

If you are training an AI model, analyzing 50 petabytes of data, or writing a script to hack a satellite, use Python. It is the lingua franca of data science.

But if you are **building a product**, shipping a SaaS, or writing code that you actually want to enjoy reading six months from now? **Ruby wins.**

Here is why, despite the hype, Ruby remains the superior language for the "One Person Framework" developer.

## 1. Everything is an Object (Truly)
In Ruby, the language respects the object. In Python, the language respects the function.

**Python:**
To find the length of a list, you wrap the list in a global function.
```python
names = ["Alice", "Bob"]
len(names) # Why is 'len' a global function?
```

**Ruby:**
You ask the object for its own property.
```ruby
names = ["Alice", "Bob"]
names.length # Or .size, or .count. It belongs to the object.
```

This sounds minor, but it reflects a philosophy. Ruby feels like a conversation with your data. Python feels like you are performing surgery on your data.

## 2. The "Block" is the Greatest Feature in Programming
Ruby’s implementation of **Blocks** (`do...end`) is arguably the best syntax sugar in history. It allows you to pass code around as easily as data.

**Ruby:**
```ruby
users.each do |user|
  email(user)
  log(user)
end
```

**Python:**
Python tries to force everything into **List Comprehensions** (which get unreadable fast) or makes you define generic handler functions.
```python
# List comprehension - hard to debug
[email(user) for user in users] 

# Or a loop that feels procedural
for user in users:
    email(user)
    log(user)
```

Ruby’s blocks allow for DSLs (Domain Specific Languages) like RSpec, Rails routes, and Sidekiq jobs that read like English. Python’s syntax is too rigid to allow for this level of expressiveness.

## 3. The "Omakase" vs. The Glue Factory
Because Python is a general-purpose language, its web ecosystem is fragmented.
*   **Django:** Too heavy, feels like 2010.
*   **FastAPI/Flask:** Too light, requires you to manually glue together SQLAlchemy, Pydantic, Alembic, and Marshmallow.

**Rails (Ruby)** is a cohesive system. The people who make the language (Matz) and the framework (DHH) share a philosophy of "Developer Happiness."
When you use Ruby, you aren't spending 3 days debating which ORM to use. You just use Active Record, and it works.

## 4. Reading Code: English vs. Math
Python prides itself on "There should be one-- and preferably only one --obvious way to do it."
Ruby prides itself on **expressiveness**.

**Python Time Checks:**
```python
from datetime import datetime, timedelta
now = datetime.now()
yesterday = now - timedelta(days=1)
```

**Ruby Time Checks:**
```ruby
1.day.ago
```

Which one would you rather write 50 times a day? Ruby optimizes for the *human*, not the machine.

## 5. The Community Vibe
The Python community is massive, but it is often utilitarian. It’s full of Data Scientists and Academics who view code as a tool to get a math result.

The Ruby community is full of **Artists**, **Musicians**, and **Writers**. We view code as a craft. We care about indentation, naming conventions, and the "poetics" of the code.
*   In Python, you write code to get the job done.
*   In Ruby, you write code to be proud of the code.

## Summary
If I need to process a CSV with 10 million rows using Pandas? I’ll write a Python script.

But for everything else - for the apps I build, the businesses I launch, and the side projects I maintain on the weekends—I choose Ruby.

Life is too short to write `len(array)`.

***

*Are you a Python convert or a Ruby lifer? Let’s fight (respectfully) in the comments! 👇*