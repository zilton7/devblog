---
title: "It Looks Like Ruby, But It’s Not: How to Understand Elixir"
categories: selfnote
tags: [ruby, elixir, learning, webdev]
image:
 path: /assets/images/2026-04-16-It-Looks-Like-Ruby-But-It-S-Not-How-To-Understand-Elixir/feature.webp
---

If you write Ruby, you will eventually get curious about Elixir. The creator of Elixir, José Valim, was a huge figure in the Ruby on Rails community. Because of this, when you look at Elixir code for the first time, it feels very familiar. It has `def`, `do`, and `end`. 

But here is the trap: **Elixir is not Ruby.** 

Very often I see Ruby developers try to write Elixir as if it was Ruby. They get frustrated because things don't work the way they expect. Ruby is Object-Oriented. Elixir is Functional. 

To learn Elixir, you don't need to learn a crazy new syntax. You just need to rewire how you think about data. Here is a simple guide translating Ruby concepts into Elixir concepts.

## 1. Classes vs Modules

In Ruby, everything is an Object. You create a Class, initialize an object, and that object holds its own data (state).

```ruby
# ruby
class User
  attr_accessor :name

  def initialize(name)
    @name = name
  end

  def upcase_name!
    @name = @name.upcase
  end
end

user = User.new("zil")
user.upcase_name!
puts user.name # Outputs: ZIL
```

In Elixir, there are no objects and no classes. Data is just data, and functions are just functions. They live separately. Instead of Classes, you group functions together inside **Modules**.

```elixir
# elixir
defmodule User do
  # We just take data in, and return new data out
  def upcase_name(user_map) do
    Map.update!(user_map, :name, &String.upcase/1)
  end
end

user = %{name: "zil"}
# We pass the data into the module's function
new_user = User.upcase_name(user)
IO.puts new_user.name # Outputs: ZIL
```

## 2. Method Chaining vs The Pipe Operator

Ruby developers love method chaining. You take an object and call methods on it in a row.

```ruby
# ruby
"hello world".upcase.split(" ").join("-")
# Outputs: "HELLO-WORLD"
```

Because Elixir doesn't have objects, you can't call `.upcase` on a string. You have to pass the string into a `String` module. Doing this normally looks very messy and nested: `Enum.join(String.split(String.upcase("hello world"), " "), "-")`.

To fix this, Elixir uses the **Pipe Operator (`|>`)**. It takes the result of the left side and passes it as the very first argument to the function on the right side.

```elixir
# elixir
"hello world"
|> String.upcase()
|> String.split(" ")
|> Enum.join("-")
# Outputs: "HELLO-WORLD"
```

Once you get used to the Pipe Operator, you will actually miss it when you go back to Ruby. It makes reading the flow of data incredibly easy.

## 3. Hashes vs Maps

In Ruby, we use Hashes everywhere to store key-value data.

```ruby
# ruby
user = { name: "Zil", role: "admin" }
puts user[:name]
```

In Elixir, the equivalent is called a **Map**. The syntax is almost identical, except you put a `%` sign in front of it.

```elixir
# elixir
user = %{name: "Zil", role: "admin"}
IO.puts user.name
```

**The big difference:** In Ruby, you can just change the hash later (`user[:role] = "user"`). In Elixir, data is **immutable**. You cannot change the map once it is created. You have to create a *brand new map* with the updated value.

```elixir
# elixir
user = %{name: "Zil", role: "admin"}
# This creates a completely new map in memory
updated_user = %{user | role: "user"} 
```

## 4. The Equals Sign is a Lie (Pattern Matching)

This is the hardest part for Rubyists to grasp. 

In Ruby, `=` means assignment. You are saying "Put this value into this variable."
```ruby
# ruby
name = "Zil"
```

In Elixir, `=` is actually the **Match Operator**. It is like an algebra equation. It tries to make the left side match the right side. 

```elixir
# elixir
name = "Zil" # This works, Elixir binds "Zil" to name to make it match.

# But you can also do this:
%{name: user_name} = %{name: "Zil", role: "admin"}

IO.puts user_name # Outputs: "Zil"
```

In that second example, Elixir looks at the right side, sees the map, and says: *"To make the left side match, I need to extract the value of :name and put it into the `user_name` variable."* 

This is called **Pattern Matching**. It is the most powerful feature in Elixir. You use it everywhere - to extract data from APIs, to handle errors, and to route web requests.

## Summary

Learning Elixir when you already know Ruby is a really fun experience. You don't have to fight with ugly brackets or semicolons. 

Just remember the golden rules of Elixir:
1. Data never changes (Immutability).
2. Data and Functions live separately.
3. Use `|>` to push data through your functions.

That's pretty much it. Even if you never build a production app in Elixir, learning how functional programming works will absolutely make you a better, cleaner Ruby developer.