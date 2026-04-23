---
title: "Laravel for Rails Devs: How to Learn the Sister Framework in a Weekend"
categories: selfnote
tags: [laravel, rails, php, webdev]
image:
 path: /assets/images/2026-04-24-Laravel-For-Rails-Devs-How-To-Learn-The-Sister-Framework-In-A-Weekend/feature.webp
---

# A Rails Developer’s Cheat Sheet to Learning Laravel

Very often I find myself talking to developers who think Ruby on Rails and PHP are from completely different planets. 

But if you are a Rails developer and you look closely at **Laravel**, you will notice something funny. It looks incredibly familiar. That is because Laravel's creator, Taylor Otwell, openly admits he was heavily inspired by Ruby on Rails. 

Laravel is basically the Rails of the PHP world. It has the same MVC structure, the same active record pattern for the database, and the same focus on "Developer Happiness". 

If you ever need to work on a Laravel codebase, or if you are just curious about the other side of the fence, you do not need to learn everything from scratch. You just need a translation guide. 

Here is exactly how Laravel concepts map to your Rails brain.

## CONCEPT 1: The CLI (Artisan vs Rails)

In Rails, you do everything through the `bin/rails` command. You generate models, run migrations, and open the console.
In Laravel, the command line tool is called **Artisan**.

*   **Start the server:**
    *   Rails: `rails server`
    *   Laravel: `php artisan serve`
*   **Open the console:**
    *   Rails: `rails console`
    *   Laravel: `php artisan tinker` (Tinker is an amazing REPL built on PsySH)
*   **Run migrations:**
    *   Rails: `rails db:migrate`
    *   Laravel: `php artisan migrate`

When you want to generate a model and a migration at the same time, Laravel has a great shortcut flag (`-m`):

```bash
# Rails
rails generate model Post title:string body:text

# Laravel
php artisan make:model Post -m
```
*Note: Laravel doesn't generate the table columns from the command line by default. You open the generated migration file and write them in PHP.*

## CONCEPT 2: Dependency Management (Composer)

In Ruby, we use `Bundler` and a `Gemfile`. 
In PHP, the standard package manager is **Composer**, and the file is `composer.json`.

```ruby
# Rails: Gemfile
gem 'stripe'
```

```json
// Laravel: composer.json
"require": {
    "stripe/stripe-php": "^10.0"
}
```

To install packages, instead of running `bundle install`, you run `composer install`. Simple as that.

## CONCEPT 3: The ORM (Eloquent vs ActiveRecord)

This is where you will feel most at home. Laravel uses an ORM called **Eloquent**, which uses the exact same Active Record design pattern as Rails.

Your models live in `app/Models/` (instead of `app/models/`). Querying the database looks almost identical, just with PHP syntax (arrows `->` instead of dots `.`, and semicolons at the end).

```ruby
# Rails
@users = User.where(active: true).order(created_at: :desc).limit(10)
@user = User.find(1)
```

```php
// Laravel
$users = User::where('active', 1)->orderBy('created_at', 'desc')->take(10)->get();
$user = User::find(1);
```

Relationships are also very similar. Instead of macros like `has_many`, you define a method returning the relationship:

```php
// Laravel: app/Models/User.php
class User extends Model
{
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
```

## CONCEPT 4: Routing and Controllers

In Rails, all your routes are clumped into `config/routes.rb`. 
Laravel splits them up. Web routes (which have sessions and CSRF protection) go in `routes/web.php`. API routes go in `routes/api.php`.

```ruby
# Rails: config/routes.rb
get '/about', to: 'pages#about'
resources :posts
```

```php
// Laravel: routes/web.php
Route::get('/about', [PagesController::class, 'about']);
Route::resource('posts', PostController::class);
```

The Controllers are practically identical. They receive a request, ask the Model for data, and return a view.

## CONCEPT 5: Views (Blade vs ERB)

In Rails, we use ERB (`.html.erb`) to mix Ruby into our HTML.
Laravel uses a templating engine called **Blade** (`.blade.php`).

Honestly, Blade is fantastic. It is a bit cleaner than ERB because you don't have to type `<%= %>` everywhere. You use the `@` symbol for logic and double curly braces `{{ }}` to output variables.

```erb
<!-- Rails ERB -->
<% if @user.is_admin? %>
  <h1>Welcome, <%= @user.name %></h1>
<% else %>
  <h1>Access Denied</h1>
<% end %>
```

```php
<!-- Laravel Blade -->
@if ($user->is_admin)
  <h1>Welcome, {{ $user->name }}</h1>
@else
  <h1>Access Denied</h1>
@endif
```

## CONCEPT 6: The Frontend (Livewire vs Hotwire)

Rails 8 pushes **Hotwire** (Turbo and Stimulus) to give you that fast, SPA-like feel without writing React. 
Laravel has an equivalent called **Livewire**. 

While Hotwire sends HTML over the wire by intercepting standard form submissions, Livewire actually ties PHP component classes directly to your HTML. When a user clicks a button, Livewire makes an AJAX request, runs the PHP method, and morphs the DOM automatically. 

Both accomplish the exact same goal: letting backend developers build highly interactive frontends without touching a massive Javascript build step.

## Summary

If you know Ruby on Rails, you already know 80% of Laravel. You just need to get used to writing PHP syntax and adding semicolons at the end of your lines.

*   `Gemfile` = `composer.json`
*   `bin/rails` = `php artisan`
*   `ActiveRecord` = `Eloquent`
*   `ERB` = `Blade`
*   `Hotwire` = `Livewire`

Laravel has an incredibly polished ecosystem (Forge for deployment, Nova for admin panels). While my heart still belongs to Ruby, I have massive respect for Laravel. It is proof that the "Majestic Monolith" is still the best way to build software, no matter what language you write it in.