---
title: "If You Love Ruby But Need More Speed: Elixir vs Crystal"
categories: selfnote
tags: [ruby, elixir, crystal, webdev]
image:
 path: /assets/images/2026-03-24-If-You-Love-Ruby-But-Need-More-Speed-Elixir-Vs-Crystal/feature.webp
---

If you write Ruby code, you already know why it is so popular. It is incredibly easy to read, and frameworks like Ruby on Rails make building web apps very fast. 

But eventually, every Ruby developer hits a wall. Maybe your app needs to handle thousands of live websocket connections (like a chat app), and Ruby starts eating all your server's RAM. Or maybe you have a script that processes millions of rows of data, and it is just too slow.

When this happens, Ruby developers usually look at two alternative languages that share a very similar syntax: **Elixir** and **Crystal**.

Here is a simple breakdown of how they compare, and when you should actually use them.

## 1. Ruby: The Comfortable Default

We all know Ruby. It is purely Object-Oriented. Everything is an object, and the main goal of the language is "Developer Happiness".

```ruby
# ruby
def greet(name)
  "Hello, #{name.capitalize}!"
end

puts greet("zil")
```

**The Good:**
* Huge ecosystem (Gems). If you need to connect to a weird API, there is already a Gem for it.
* Ruby on Rails. It is still the fastest way to build a standard web application.

**The Bad:**
* It is an interpreted language, which means it is relatively slow compared to compiled languages.
* Concurrency (doing many things at the exact same time) is historically hard and memory-heavy in Ruby.

## 2. Elixir: The Scalable Sibling

Elixir was created by José Valim, who was a core Rails contributor. He loved Ruby's syntax but hated its concurrency problems. So, he built Elixir. 

At first glance, Elixir looks like Ruby. But under the hood, it is completely different. It is a **Functional** programming language, not Object-Oriented. You don't create classes and objects that change state. You pass data through functions.

It also runs on the Erlang VM (BEAM), which was built in the 80s for telecom switches. It is designed to handle millions of tiny processes at the same time without crashing.

```elixir
# elixir
defmodule Greeter do
  def greet(name) do
    name
    |> String.capitalize()
    |> (fn n -> "Hello, #{n}!" end).()
  end
end

IO.puts Greeter.greet("zil")
```

Notice the `|>` (pipe operator). It takes the result of one function and passes it to the next. This is how you write code in Elixir.

**The Good:**
* **Phoenix Framework:** It is like Rails, but it can handle millions of real-time connections (websockets) on a single server without breaking a sweat.
* Fault-tolerant. If a process crashes, it just restarts instantly.

**The Bad:**
* Functional programming is hard to learn if you have only ever done Object-Oriented programming. It takes time to rewire your brain.

## 3. Crystal: The Fast Twin

If Elixir is a distant cousin, Crystal is Ruby's twin brother on steroids. 

Crystal's goal is simple: Have a syntax as beautiful as Ruby, but run as fast as C. 
It does this by being a **Compiled** and **Statically Typed** language. 

When you run a Crystal app, the compiler translates your code into raw machine code before it runs. You also have to tell it what type of data your variables are (String, Integer, etc.), though the compiler is smart enough to guess most of the time.

```crystal
# crystal
# Notice we define 'name' as a String
def greet(name : String) : String
  "Hello, #{name.capitalize}!"
end

puts greet("zil")
```

If you look closely, that code looks almost exactly like Ruby. In fact, many pure Ruby scripts will run in Crystal without any changes!

**The Good:**
* **Blazing Fast:** It is incredibly fast and uses almost zero RAM compared to Ruby.
* Very easy to learn if you already know Ruby. There is almost no learning curve for the syntax.

**The Bad:**
* The ecosystem is very small. There aren't many "Shards" (Crystal's version of Gems) available compared to Ruby or Elixir.
* Compilation takes time. Every time you make a change, you have to wait a few seconds for it to compile before you can test it.

## Summary: Which one should you pick?

*   **Stay with Ruby** if you are building a standard web app (SaaS, marketplace, blog). The speed of writing the code is more important than the speed of the server.
*   **Learn Elixir** if you are building an app with heavy real-time features (like Discord or WhatsApp), or if you want to learn functional programming.
*   **Learn Crystal** if you have a slow Ruby background job (like parsing massive CSV files or crunching numbers) and you want to rewrite it to be 10x faster without learning a completely new syntax like Rust or Go.

That's pretty much it. All three are great tools, you just need to pick the right one for the job you are doing.