---
title: "Build Your Own Cloud Empire: Hosting Unlimited Rails Apps with Kamal 2"
categories: selfnote
tags: [rails, devops, kamal, startups]
image:
 path: /assets/images/2026-05-06-Build-Your-Own-Cloud-Empire-Hosting-Unlimited-Rails-Apps-With-Kamal-2/feature.webp
---

If you are a solo developer or an indie hacker, you probably suffer from "Shiny Object Syndrome." You have 10 different ideas, and you want to launch all of them. 

In the old days, launching an MVP was expensive. You used Heroku or Render. You paid $7 for the web server, $9 for the database, and $5 for Redis. That is $21 per app. If you have 5 side projects, you are paying over $100 a month just to host apps that might have zero active users.

This "PaaS Tax" kills innovation. It makes you afraid to launch new things.

But in 2026, with the release of **Kamal 2**, you don't need a Platform-as-a-Service anymore. You can rent raw, cheap Linux servers and build your own "Cloud Empire." You can host 10 different Rails apps on the exact same server, completely isolated from each other, for a fixed price of $10 a month.

Here is the step-by-step guide to building your own multi-app VPS cluster using Kamal 2.

## The Strategy: The Kamal Proxy

Before we start, you need to understand how this is possible. 

Normally, only one application can listen to Port 80 (HTTP) and Port 443 (HTTPS) on a server. If App A is using it, App B will crash. 

Kamal 2 solves this with **Kamal Proxy**. When you deploy your first app, Kamal silently installs a master proxy at the front door of your server. This proxy listens to the internet. When a request comes in, the proxy looks at the domain name (`app1.com` vs `app2.com`) and routes the traffic to the correct Docker container. 

It handles the SSL certificates (HTTPS) automatically. It handles zero-downtime deployments. And it allows infinite apps to share one server.

## STEP 1: The Base Hardware

First off, go to a cloud provider like Hetzner, DigitalOcean, or Linode. 
Rent a cheap Ubuntu VPS. A $10/month server on Hetzner gives you an ARM processor with 4 vCPUs and 8GB of RAM. 

Because Rails 8 is so efficient (especially if you use SQLite for your MVPs), 8GB of RAM is enough to comfortably run 10 to 15 separate Rails applications.

Write down the IP address of your new server.

## STEP 2: Deploying App Number 1

Let's deploy your first idea: `project-alpha.com`. 

In your first Rails application, open `config/deploy.yml`. You configure it to point to your new server IP, and you tell Kamal Proxy which domain belongs to this app.

```yaml
# project_alpha/config/deploy.yml
service: project-alpha
image: your_docker_username/project-alpha

servers:
  web:
    - 192.168.1.100 # Your Server IP

proxy:
  ssl: true
  host: project-alpha.com

registry:
  # ... your docker registry credentials
```

In your terminal, run:
```bash
kamal setup
```

Kamal will SSH into your server, install Docker, install Kamal Proxy, issue an SSL certificate, and start `project-alpha`. 

## STEP 3: Deploying App Number 2 (Sharing the Server)

Now you have a second idea: `project-beta.com`. 

You do **not** need to buy a second server. You just point your DNS records for `project-beta.com` to the exact same IP address (`192.168.1.100`).

Open the `deploy.yml` for your second Rails app:

```yaml
# project_beta/config/deploy.yml
service: project-beta
image: your_docker_username/project-beta

servers:
  web:
    - 192.168.1.100 # The EXACT SAME IP

proxy:
  ssl: true
  host: project-beta.com
```

Run `kamal setup` in this second app. 

Kamal is smart enough to realize that Docker and Kamal Proxy are already installed on that server. It skips the heavy setup, deploys the new `project-beta` container alongside the first one, and registers the new domain name with the proxy. 

Boom. Two apps, one server, one $10 bill.

## STEP 4: Scaling the Empire (The Database Node)

Hosting 10 apps with SQLite on one server is great for MVPs. But what happens when `project-alpha` goes viral and gets thousands of users? It starts eating all the CPU, slowing down your other 9 apps.

It is time to turn your single server into a **Cluster**. 

You rent a second $10 VPS. This will be your **Database Server**. 
Instead of spinning up managed RDS databases on AWS for $50/month, you use Kamal's "Accessories" feature to install a massive PostgreSQL container on this new server.

In your `project-alpha` deploy file, you separate your architecture:

```yaml
# project_alpha/config/deploy.yml
service: project-alpha

# The Web server stays on Node 1
servers:
  web:
    - 192.168.1.100 

# The Database moves to Node 2
accessories:
  db:
    image: postgres:15
    host: 192.168.1.200 # Your NEW Server IP
    port: 5432
    env:
      clear:
        POSTGRES_DB: project_alpha_prod
        POSTGRES_USER: admin
      secret:
        - POSTGRES_PASSWORD
    files:
      - db_data:/var/lib/postgresql/data
```

Now, your web traffic hits Server 1, and your database queries route securely to Server 2. You have built a distributed cloud architecture without writing a single line of Kubernetes configuration.

## Summary

The "One Person Framework" doesn't just apply to writing code. It applies to infrastructure. 

With Kamal 2, you have total control.
1. You can launch unlimited MVPs on a single cheap server.
2. The proxy handles routing and SSL automatically.
3. When an app gets traction, you just add another server IP to your `deploy.yml` and scale horizontally.

You are no longer renting a tiny slice of a PaaS. You own the hardware. Go build your empire.