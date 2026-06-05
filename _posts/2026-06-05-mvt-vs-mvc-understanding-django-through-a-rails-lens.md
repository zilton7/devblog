---
title: "MVT vs MVC: Understanding Django Through a Rails Lens"
categories: selfnote
tags: [django, rails, python, webdev]
image:
 path: /assets/images/2026-06-05-Mvt-Vs-Mvc-Understanding-Django-Through-A-Rails-Lens/feature.webp
---

If you are a Rails developer, you are used to the "Omakase" experience. Everything is chosen for you, and there is a very specific "Rails Way" to do things. 

But sometimes, a project requires Python - maybe because of a specific AI library or a client’s existing infrastructure. When you first open a Django project, it feels like walking into a house where all the furniture is in the wrong room. The concepts are the same, but the names are all different.

Django is essentially the Python cousin of Rails. It values batteries-included development and clean architecture. Here is the translation guide to help you move between Ruby and Python without losing your mind.

## 1. The Pattern: MVT vs. MVC

Rails follows **MVC** (Model-View-Controller). 
Django follows **MVT** (Model-View-Template). 

This is the biggest point of confusion for Rails devs. In Django:
*   **The Model** is exactly the same as Rails.
*   **The View** is actually the **Controller**. It’s where the logic lives.
*   **The Template** is the **View**. It’s the HTML/ERB equivalent.

| Rails Concept | Django Equivalent |
| :--- | :--- |
| Model | Model |
| Controller | View |
| View (ERB) | Template |

## 2. The CLI: `manage.py` is your `bin/rails`

In Rails, you use the `rails` command for everything. In Django, every project comes with a script called `manage.py` that handles the same tasks.

*   **Start the server:** 
    *   Rails: `bin/rails s`
    *   Django: `python manage.py runserver`
*   **Database Console:**
    *   Rails: `bin/rails dbconsole`
    *   Django: `python manage.py dbshell`
*   **The Interactive REPL:**
    *   Rails: `bin/rails c`
    *   Django: `python manage.py shell`

## 3. The ORM: Django ORM vs. ActiveRecord

ActiveRecord is famous for its "magic." You don't have to import models; they are just there. Django is more explicit. You have to import your models at the top of every file.

**Querying:**
```ruby
# Rails
@users = User.where(active: true).order(:created_at)
```

```python
# Django
from .models import User
users = User.objects.filter(active=True).order_by('created_at')
```

**Migrations:**
Rails migrations are timestamped files where you write the change. Django does this in two steps:
1.  **`python manage.py makemigrations`**: Django looks at your `models.py`, compares it to the last version, and *automatically* generates the migration file for you.
2.  **`python manage.py migrate`**: This actually runs the changes on the database.

## 4. Routing: `urls.py` vs. `routes.rb`

Rails uses a DSL for routing. Django uses a list of `path` objects and regex-like patterns.

```ruby
# Rails routes.rb
get '/products/:id', to: 'products#show'
```

```python
# Django urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('products/<int:id>/', views.product_detail),
]
```

## 5. The "Superpower": Django Admin

In Rails, we usually install a gem like `Avo` or `ActiveAdmin` to get an internal dashboard. In Django, this is **built-in**.

By adding two lines of code to `admin.py`, you get a professional, secure CRUD interface for your models. This is the single biggest reason Rails developers often feel "Admin Envy" when looking at Python projects.

## 6. Dependency Management

Instead of a `Gemfile` and `Gemfile.lock`, Django developers traditionally used a `requirements.txt` file. However, modern Python development has moved to **Poetry** or **uv**, which uses a `pyproject.toml` file-this feels much more like the Bundler experience you are used to.

## Summary

If you can write a Rails app, you can write a Django app. You just have to remember that **Django Views = Rails Controllers**. 

The transition is mostly about getting used to Python’s explicit nature. While Rails loves to hide things to make code look "pretty," Django prefers that you see exactly where everything is coming from.

---

> 💡 **Don't forget to test!**
> Whether you are building in Ruby or Python, the most important thing is a reliable test suite. If you want to see how I handle testing for solo projects to ensure they actually work in production, check out **[Wise Testing: The Solo Developer's Guide to Rails Testing](https://norvilis.gumroad.com/l/wise-testing)**. It’s the pragmatic approach to shipping fast.

---