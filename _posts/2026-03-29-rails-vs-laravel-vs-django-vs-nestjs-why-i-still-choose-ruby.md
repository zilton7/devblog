---
title: "Rails vs Laravel vs Django vs NestJS: Why I Still Choose Ruby"
categories: selfnote
tags: [rails, webdev, javascript, backend]
image:
 path: /assets/images/2026-03-29-Rails-Vs-Laravel-Vs-Django-Vs-Nestjs-Why-I-Still-Choose-Ruby/feature.webp
---

If you want to build a web application or a SaaS today, the first thing you have to do is pick a backend framework. 

Very often I see new developers getting paralyzed by this choice. Everyone on Twitter is fighting about which language is the fastest or which framework scales the best. Usually, the debate comes down to the "Big Four" monolithic frameworks: **Rails (Ruby), Laravel (PHP), Django (Python), and NestJS (Node/TypeScript).**

I have tried building APIs and apps with all of them. While they are all capable tools, I always find myself coming back to Ruby on Rails. 

Here is my honest breakdown of these four frameworks, and why I believe Rails is still the absolute best choice for shipping products quickly.

## 1. NestJS (The Over-Engineered Setup)

Because JavaScript is so popular, a lot of developers want to use Node.js for their backend. Express.js is too barebones, so enterprise teams created **NestJS**. It is heavily inspired by Angular.

**The Good:**
It uses TypeScript, which means you get great autocompletion. It is very structured and fast.

**The Bad:**
The amount of boilerplate code you have to write is insane. To create a simple endpoint that returns a user, you have to write a Controller, a Service, a Module, and use decorators everywhere.

```typescript
// nestjs
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
```

For a solo developer or a small team, this is just exhausting. You spend more time writing dependency injection wiring than actual business logic. It feels like Java.

## 2. Django (The Data Science Tool)

Django is the king of the Python world. It has a famous motto: "The web framework for perfectionists with deadlines."

**The Good:**
It comes with an incredible Admin panel right out of the box. If your app is mostly just managing data, Django saves you weeks of work. Also, because it is Python, it is great if your app relies heavily on AI or machine learning models.

**The Bad:**
The developer experience when writing queries is just not as smooth as Ruby. Django's ORM feels a bit clunky. Also, Python requires you to manually import every single thing you use at the top of every file.

```python
# django
from django.db import models
from .models import User

# Querying is a bit verbose
User.objects.filter(active=True).exclude(email__isnull=True)
```

It is very explicit, but it lacks the "joy" and readability of Ruby code.

## 3. Laravel (The Worthy Rival)

I have a lot of respect for Laravel. It is basically the PHP version of Rails. In fact, its creator (Taylor Otwell) borrowed a lot of the best ideas from Rails.

**The Good:**
The ecosystem is amazing. Things like Laravel Forge (for deployment) and Livewire (for frontend reactivity) are top-tier. It has everything you need built-in, just like Rails.

**The Bad:**
At the end of the day, you still have to write PHP. 
PHP has improved a lot, but the syntax is still full of dollar signs (`$`), arrows (`->`), and semicolons (`;`). 

```php
// laravel
class UserController extends Controller
{
    public function show($id)
    {
        $user = User::where('active', 1)->firstOrFail();
        return view('user.profile', ['user' => $user]);
    }
}
```

It gets the job done perfectly, but for me, looking at PHP code all day just isn't as enjoyable as looking at Ruby.

## 4. Ruby on Rails (The Winner)

This brings us to Rails. Rails has been around for 20 years, and it is still the benchmark that every other framework tries to copy.

Here is why Rails wins for me:

### REASON 1: ActiveRecord is Magic
No other ORM comes close to ActiveRecord. It is so powerful and reads exactly like plain English. You don't need to import models, they are just available everywhere.

```ruby
# rails
class UsersController < ApplicationController
  def show
    @user = User.find_by!(active: true, id: params[:id])
  end
end
```
It is clean, concise, and gets completely out of your way.

### REASON 2: The "One Person Framework"
Rails is designed to make a single developer as productive as a whole team. With the recent updates in Rails 8, you get everything out of the box:
*   **Hotwire:** You get modern, SPA-like frontend speed without writing React.
*   **Solid Queue:** Background jobs run in your database, so you don't even need to set up Redis anymore.
*   **Kamal:** You can deploy your app to a cheap VPS in 5 minutes with one command.

### REASON 3: Developer Happiness
Ruby was designed specifically to make programmers happy. The syntax is beautiful. You don't waste time figuring out how to structure your folders because Rails enforces a standard structure (`app/models`, `app/controllers`). This means you can open any Rails project in the world and instantly know where everything is.

## Summary

*   If you are building an AI app and need heavy Python libraries, use **Django**.
*   If you love PHP and want a massive, polished ecosystem, use **Laravel**.
*   If you are working in a massive corporate team that loves strict rules, use **NestJS**.

But if your goal is to take an idea from your brain, build it quickly, and launch it to the world as a solo developer or indie hacker? **Nothing beats Ruby on Rails.** 

That's pretty much it. Pick the tool that lets you ship the fastest, and for me, that is always Rails.