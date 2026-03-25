---
title: "Stop Fearing DevOps: A Rails Developer's Guide to Docker"
categories: selfnote
tags: [docker, rails, devops, kamal]
image:
 path: /assets/images/2026-03-25-Stop-Fearing-Devops-A-Rails-Developer-S-Guide-To-Docker/feature.webp
---

I know that DevOps and server management can be very confusing, even if you have years of experience writing Ruby code. For a long time, deploying a Rails app meant SSHing into a server, installing Ruby, installing Postgres, configuring Nginx, and praying you didn't break anything.

Then Docker came along and changed everything. But if you read the official Docker documentation, it uses a lot of fancy academic language that makes it sound much harder than it actually is.

In this article, I will explain exactly how Docker works, from beginner concepts to advanced usage with Kamal 2 in Rails 8.

## LEVEL 1: What actually is Docker? (The Basics)

Imagine you build a wooden chair in your garage. You have all your specific tools, your specific brand of glue, and your specific temperature. The chair comes out perfectly.
Then, you send the blueprints to your friend in another country. They try to build it, but their garage is too humid, their glue is different, and the chair collapses.

This is the **"It works on my machine"** problem in software. Your Rails app works on your Mac, but crashes on the Linux production server because the `libvips` version is slightly different.

**Docker solves this by shipping the garage along with the blueprints.**

A **Docker Container** is essentially a lightweight, isolated mini-computer running inside your real computer. It contains your code, the exact version of Ruby, the exact operating system dependencies, and nothing else. If a Docker container runs on your laptop, it is guaranteed to run exactly the same way on a $5 Hetzner server.

## LEVEL 2: The Recipe (The Dockerfile)

To create this mini-computer, Docker needs a recipe. This recipe is called a `Dockerfile`.

If you run `rails new my_app` in Rails 8, Rails automatically generates this file for you. Let's look at a simplified version of what it does:

```dockerfile
# 1. Start with a blank Linux computer that already has Ruby 3.3 installed
FROM ruby:3.3.0-slim

# 2. Create a folder inside this mini-computer called /rails
WORKDIR /rails

# 3. Copy our Gemfile from our Mac into the mini-computer
COPY Gemfile Gemfile.lock ./

# 4. Install the gems inside the mini-computer
RUN bundle install

# 5. Copy the rest of our application code in
COPY . .

# 6. Tell the mini-computer what to do when it turns on
CMD ["bin/rails", "server"]
```

It reads just like a script you would type into your own terminal. 

## LEVEL 3: Image vs. Container (Intermediate)

People often confuse these two terms, but the difference is simple:

*   **The Image:** This is the baked cake. When you run `docker build`, Docker reads your `Dockerfile` and creates an "Image". It is a frozen, read-only snapshot of your application.
*   **The Container:** This is eating the cake. When you run `docker run`, Docker takes that frozen Image, wakes it up, and runs it. 

You build the Image **once**. You can run **thousands** of Containers from that single Image. 

## LEVEL 4: How Kamal 2 uses Docker (Advanced)

For a few years, the industry went crazy. They decided that to run Docker containers in production, you needed massive, complex systems like Kubernetes. For a solo developer, this was a nightmare.

**Kamal 2** brings us back to sanity. Kamal is a deployment tool that uses Docker under the hood, but abstracts all the painful parts away from you. 

When you type `kamal deploy` in your terminal, here is the magic that happens step-by-step:

1.  **The Build:** Kamal looks at your `Dockerfile` and tells Docker on your laptop to build the Image.
2.  **The Push:** Kamal takes that heavy, frozen Image and uploads it to a "Registry" in the cloud (like GitHub Container Registry or Docker Hub). Think of this like uploading a file to Dropbox.
3.  **The SSH:** Kamal connects to your cheap Linux VPS (Virtual Private Server) via SSH.
4.  **The Pull:** Kamal tells your server: *"Hey, go download that Image from the Registry."*
5.  **The Switch (Zero Downtime):** Kamal starts a new Container from the new Image. Once it is running and healthy, Kamal updates its built-in proxy (Kamal Proxy) to route live internet traffic to the new Container, and smoothly kills the old one.

## Why this is the ultimate "One Person" setup

Before Kamal 2, you had to manually figure out how to route HTTP traffic (port 80) and SSL certificates (port 443) into your Docker container using Nginx or Traefik. It required writing confusing configuration files.

Now, because your Rails app is packaged securely in a Docker container, Kamal handles the entire networking layer for you. 

You don't need to know how to set up a Linux server. 
You don't need to install Ruby on your server.
You just need a blank server with Docker installed, and Kamal does the rest.

Docker is no longer a tool you have to fight with. It is simply the "shipping box" that we use to get our Rails code from our laptop to the internet safely. 
