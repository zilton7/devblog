---
title: "OOP vs Functional Programming Explained for Dummies"
categories: selfnote
tags: [programming, beginners, ruby, career]
image:
 path: /assets/images/2026-04-26-Oop-Vs-Functional-Programming-Explained-For-Dummies/feature.webp
---

I see beginner developers get completely overwhelmed by computer science jargon. You read an article about "Monads," "Polymorphism," or "Immutability," and you feel like you are not smart enough to be a programmer. 

If you browse tech Twitter or Reddit, you will see constant wars between developers arguing about whether **Object-Oriented Programming (OOP)** or **Functional Programming (FP)** is better. 

But what do these terms actually mean? If you strip away the fancy university words, they are just two different ways of organizing how data moves through your app.

Here is the absolute simplest explanation of OOP vs Functional programming, without the computer science degree.

## The Mental Model: The Robot vs The Conveyor Belt

Imagine you want to build a system that paints cars red. 

**The Object-Oriented Way (The Robot):**
You build a smart Robot called `Car`. You give the robot some data (its color is blue). When you want the car painted, you press a button on the robot's back called `paint_red!`. The robot reaches inside its own body, takes out its blue paint, throws it away, and puts in red paint. The robot has **changed itself**. 

**The Functional Way (The Conveyor Belt):**
You build a dumb conveyor belt. You put a blue car on the belt. It moves through a machine called `PaintRed`. The machine does not change the original blue car. Instead, it destroys the blue car, and builds a **brand new** red car at the end of the belt. The machine remembers nothing. It just takes inputs and spits out new outputs.

## CONCEPT 1: Object-Oriented Programming (State)

Ruby, Python, and Java are heavily Object-Oriented. The core idea is that **data and the functions that change that data live together in the same box** (called a Class/Object).

We call this "State." State is just a fancy word for "remembering things."

Look at this Ruby code representing a bank account:

```ruby
# Object-Oriented Programming (Ruby)
class BankAccount
  attr_reader :balance

  def initialize(starting_balance)
    @balance = starting_balance
  end

  def deposit(amount)
    @balance = @balance + amount
  end
end

my_account = BankAccount.new(100)
my_account.deposit(50)

puts my_account.balance 
# Outputs: 150
```

Notice what happened. `my_account` remembered that it had 100. When we called `.deposit(50)`, it changed its own internal memory. The original `100` is gone forever. This is called **Mutation** (changing things in place).

## CONCEPT 2: Functional Programming (Immutability)

Elixir, Haskell, and Clojure are Functional languages. The core idea here is that **data and functions are completely separate.** 

Functions are just dumb calculators. They don't remember anything. You hand them data, and they hand you back **new** data. 

We call this "Immutability." It is a fancy word for "you are not allowed to change the original data."

Look at how a bank account works in a functional language like Elixir:

```elixir
# Functional Programming (Elixir)
defmodule BankAccount do
  def deposit(current_balance, amount) do
    current_balance + amount
  end
end

my_balance = 100

# We pass the data INTO the machine. 
# It spits out a brand new value.
new_balance = BankAccount.deposit(my_balance, 50)

IO.puts new_balance 
# Outputs: 150

IO.puts my_balance
# Outputs: 100 (The original data was never touched!)
```

Notice the difference? The `BankAccount` module doesn't "hold" any money. It just knows how to do the math. We had to pass `my_balance` into it, and it gave us a completely new variable back. 

## CONCEPT 3: Why does this matter?

If both methods get the job done, why do people fight about them?

**Why people love OOP:**
It is very easy for human brains to understand. We live in an object-oriented world. A dog barks. A user logs in. A bank account receives a deposit. It organizes your code into neat little real-world nouns. This is why frameworks like Ruby on Rails are so incredibly fast for building products.

**The problem with OOP:**
Because objects "remember" things and change themselves, bugs can be incredibly hard to track down. If your `user` object has the wrong email address, you have to guess which part of your massive app accidentally changed the email. 

**Why people love Functional Programming:**
It is incredibly safe and predictable. If a function always spits out `4` when you give it `2 + 2`, testing it is ridiculously easy. Furthermore, because data is never changed in place, you can run 10,000 functions at the exact same time (Concurrency) across multiple CPU cores, and they will never accidentally overwrite each other's data.

**The problem with FP:**
It can be hard to learn. If you want to change a user's name nested deep inside a database record, you have to write code that makes a copy of the database, makes a copy of the user, and changes the name on the copy. It feels like a lot of extra steps for simple tasks.

## Summary

Don't let the jargon scare you. 

*   **OOP** = Nouns. Data and functions live together. Objects change themselves.
*   **Functional** = Verbs. Data and functions are separate. Data is passed through an assembly line to create new data.

If you are building a standard web app (SaaS, blog, e-commerce), Object-Oriented programming is usually the fastest way to ship. If you are building a chat app that needs to handle 5 million messages a second without crashing, Functional programming is your best friend.