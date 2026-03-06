---
title: "Why I Stopped Using Docker in Development"
categories: selfnote
tags: [rails, webdev, productivity, docker]
image:
  path: /assets/images/2026-03-03-Why-I-Stopped-Using-Docker-In-Development/feature.webp
---

## The Industry Standard Trap
If you look at any "Modern Web Dev" tutorial, Step 1 is almost always: *Install Docker*. 

We are told that Docker is essential for "Environment Parity." We are told it prevents the dreaded "It works on my machine" syndrome. For a team of 50 developers with different operating systems and complex microservice dependencies, Docker is a godsend.

But if you are a **One-Person Team** working on a Rails monolith? **Docker in development is a performance tax you don't need to pay.**

Here is why I deleted Docker Desktop and went back to native development.

## 1. The File System Friction (The "Mac" Problem)
If you are developing on a Mac, Docker is not running natively. It is running inside a virtual machine (VM). 

When your Rails app in the container needs to read a file from your host machine (like a view template or a line of Ruby code), it has to cross a "bridge" between the VM and your macOS file system. Even with modern optimizations like `VirtioFS`, there is a latency.

*   **Native:** `rails test` starts in 0.5 seconds.
*   **Docker:** `docker-compose run web bin/rails test` starts in 4 seconds.

It doesn't sound like much, but over 100 test runs a day, you are losing nearly 10 minutes just **waiting for the environment to wake up.** For a solo dev, flow state is everything. Those 4-second pauses are "micro-distractions" that kill momentum.

## 2. The "Parity" Myth for Solo Devs
The biggest argument for Docker is: *"Your dev environment should match production exactly."*

But if you are a solo developer, **you are the only environment.** If it works on your machine, and your deployment tool (like Kamal) packages it into a container for the server, it's going to work. 

The minor differences between macOS and Linux (like how `libvips` is compiled) rarely affect the business logic of a standard SaaS app. When they do, you catch them in CI. You don't need to suffer through a slow dev environment for a 1% edge case.

## 3. The Resource Hog
Docker Desktop on Mac is notorious for eating RAM and CPU even when it’s idling.
*   **Docker Desktop:** Consumes 2GB+ RAM just by existing.
*   **Postgres.app + Redis:** Consumes ~200MB and stays quiet until queried.

If you’re working on a MacBook Air or even a Pro, why give up 25% of your resources to a VM you don't actually need? 

## My "Native" Stack (The Speed Demon)
Here is how I replaced the "Docker Compose" soup with a lightning-fast native setup:

*   **Version Manager:** [Mise](https://mise.jdx.dev/) (or `asdf`/`rbenv`). It manages Ruby, Node, and Yarn versions with zero overhead.
*   **Database:** [Postgres.app](https://postgresapp.com/). It’s a native Mac app. You open it, the DB is there. You close it, it’s gone.
*   **Redis:** `brew install redis`.
*   **Process Management:** [Overmind](https://github.com/DarthSim/overmind) or `bin/dev`. A simple `Procfile` manages my Rails server, Tailwind watcher, and Sidekiq workers.

The result? My `rails server` starts instantly. My tests are snappy. My battery lasts longer.

## When to Use Docker?
I still use Docker for **Deployment**. 

Thanks to **Kamal**, I can build a Docker image of my app and push it to a VPS. This gives me the benefit of Docker (reproducible production environments) without the pain of developing inside the container. 

The container is a **packaging format**, not a **development environment**.

## Summary
As a solo developer, your only competitive advantage is **Velocity**. 
If your tools are slowing you down, even by a few seconds, they are failing you. Docker is a fantastic tool for organizations, but for the individual, it’s often just extra weight. 

Try going native. Your CPU (and your sanity) will thank you.

***

*Are you a Docker devotee or a Native purist? Let's argue in the comments! 👇*