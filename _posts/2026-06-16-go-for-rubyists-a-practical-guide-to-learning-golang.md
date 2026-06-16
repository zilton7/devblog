---
title: "Go for Rubyists: A Practical Guide to Learning Golang"
categories: selfnote
tags: [go, ruby, learning, webdev]
image:
 path: /assets/images/2026-06-16-Go-For-Rubyists-A-Practical-Guide-To-Learning-Golang/feature.webp
---

I love Ruby. It is the language that made me happy to write code. But as a Rails developer, I eventually hit a wall. Maybe I needed to process a 2GB CSV file, or build a real-time notification service that handles 10,000 connections. 

In those moments, Ruby can feel a bit slow or memory-heavy. This is why many Rails developers (including the team at Basecamp) have started using **Go** (Golang) for high-performance side-services.

If you are a Ruby developer, Go will feel very different. It has no "magic," it is strictly typed, and it is incredibly fast. Here is my guide on how to learn Go without losing your mind.

## 1. The Big Shift: No More Magic

In Rails, we are used to "magic." You type `User.find(1)` and it just works. You don't see the SQL, you don't see the imports, and you don't worry about types.

**Go is the opposite.** There is zero magic. 
*   If you use a variable, you must define its type.
*   If you import a library and don't use it, the code won't even compile.
*   Everything is explicit.

At first, this is very annoying. You will feel like you are typing too much. But after a week, you realize that because there is no magic, you can read any Go file and know exactly what it does.

## 2. Syntax Translation

Let's look at a simple function comparison.

**Ruby:**
```ruby
def greet(name)
  "Hello, #{name}!"
end

puts greet("Zil")
```

**Go:**
```go
package main

import "fmt"

// We must say name is a string, and the function returns a string
func greet(name string) string {
	return "Hello, " + name + "!"
}

func main() {
	fmt.Println(greet("Zil"))
}
```

Notice the `package main` and `import`. Every Go file needs these. Also, notice the curly braces `{}`. As a Rubyist, you'll miss `do...end` at first, but you'll get used to it.

## 3. Dealing with Errors (The "if err != nil" loop)

In Ruby, we use `begin...rescue` to handle errors. Or we just let the app crash and check the logs.

In Go, errors are not "exceptions." They are just values that functions return. You will see this pattern in every single Go project:

```go
user, err := findUser(1)

if err != nil {
    // Something went wrong, handle it here
    return err
}

// If no error, continue
fmt.Println(user.Name)
```

It feels repetitive to write this 50 times a day, but it means your app almost never crashes in production because you are forced to handle every single edge case while you type.

## 4. The Killer Feature: Goroutines

This is the main reason to learn Go. In Ruby, if you want to do 10 things at once, you need Sidekiq and Redis. 

In Go, you have **Goroutines**. You just put the word `go` in front of a function call, and it runs in the background on a different CPU thread instantly.

```go
func sendEmail(email string) {
    // slow logic
}

func main() {
    // This runs in the background. No Redis needed!
    go sendEmail("test@example.com") 
    
    fmt.Println("Moving on...")
}
```

It is incredibly lightweight. You can run 100,000 goroutines on a cheap $5 laptop.

## 5. Deployment: The Single Binary

As someone who loves **Kamal** and Docker, Go is a dream for deployment. 

When you build a Go app, it compiles into **one single file** (a binary). This file contains your code and all your libraries. You don't need to install Ruby, Bundler, or Node on your server. You just move that one file to the server and run it. It makes Docker images tiny and deployments incredibly fast.

## Summary: Should you switch?

I don't recommend replacing Rails with Go for your main web app. Rails is still much faster for building UIs and CRUD logic.

Instead, **use Go as a tool in your belt.** 
*   Use Rails for the main app.
*   Use Go for that one specific microservice that needs to be blazing fast or handle massive amounts of data.

Learning Go will make you a more disciplined developer. It teaches you to think about memory, types, and how the computer actually works.