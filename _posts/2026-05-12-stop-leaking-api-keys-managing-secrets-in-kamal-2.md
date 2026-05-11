---
title: "Stop Leaking API Keys: Managing Secrets in Kamal 2"
categories: selfnote
tags: [rails, devops, security, kamal]
image:
 path: /assets/images/2026-05-12-Stop-Leaking-Api-Keys-Managing-Secrets-In-Kamal-2/feature.webp
---

I see developers make a mistake that can ruin their entire month. 

They are building a new Rails SaaS. They get their Stripe secret key, their OpenAI key, and their AWS credentials. To deploy the app, they create a file called `.env.production` on their laptop, paste the keys inside, and deploy.

Then, late on a Friday night, they accidentally type `git add .` and push that file to a public GitHub repository. 

Within exactly 4 seconds, automated bots scrape those keys. By Saturday morning, hackers have spun up $50,000 worth of crypto-mining servers on their AWS account.

As a solo developer, you cannot afford this mistake. You need a system where your production secrets **never** touch a file that can be committed to Git. 

With the release of **Kamal 2**, managing secrets has been completely overhauled. You can now pull your API keys directly from your password manager during the deployment process. Here is how to lock down your Rails app in 4 simple steps.

## STEP 1: The `deploy.yml` Configuration

In Kamal 2, you explicitly tell your deployment configuration which environment variables are considered "secrets". 

Open your `config/deploy.yml` file. You will see an `env` section. You just list the names of the keys your Rails app expects.

```yaml
# config/deploy.yml
env:
  clear:
    # Safe to commit (Public info)
    RAILS_ENV: production
    POSTGRES_USER: my_app_user
  secret:
    # DANGEROUS! Do not put the actual values here!
    - RAILS_MASTER_KEY
    - POSTGRES_PASSWORD
    - STRIPE_SECRET_KEY
    - OPENAI_API_KEY
```

When you run `kamal deploy`, Kamal looks at this list and says: *"Okay, I need to find the values for these 4 secrets before I can boot up the Docker container."*

## STEP 2: The `.kamal/secrets` File

So, where does Kamal look for the actual values? 

By default, Kamal 2 looks for a file on your local machine at `.kamal/secrets`. 
**CRITICAL:** Ensure this file is added to your `.gitignore` immediately so it never ends up on GitHub.

You can create this file and paste your keys into it:

```bash
# .kamal/secrets
RAILS_MASTER_KEY=abc123supersecret...
POSTGRES_PASSWORD=databasepassword99!
STRIPE_SECRET_KEY=sk_live_55555...
```

When you deploy, Kamal reads this file, injects the secrets securely into the Docker container, and boots the app. 

This is much better than hardcoding keys in your codebase. But we can do even better. We can remove the keys from our hard drive completely.

## STEP 3: The "Pro Move" (Password Manager CLI)

Having plain text passwords sitting in `.kamal/secrets` on your laptop is still risky. If your laptop gets stolen, the keys are compromised.

Kamal 2 allows you to execute terminal commands *inside* the `.kamal/secrets` file. This means we can ask a Password Manager (like 1Password, Bitwarden, or LastPass) to fetch the keys from the cloud at the exact moment of deployment.

I use **1Password**. I installed their command-line tool (the `op` CLI). 

Instead of writing the actual API key in my file, I write the 1Password command to fetch it:

```bash
# .kamal/secrets

# Fetch the master key from my 1Password vault
RAILS_MASTER_KEY=$(op read "op://Work/RailsApp/master_key")

# Fetch the database password
POSTGRES_PASSWORD=$(op read "op://Work/Database/password")

# Fetch the Stripe key
STRIPE_SECRET_KEY=$(op read "op://Work/Stripe/secret_key")
```

## STEP 4: The Secure Deploy

Now, let's see what happens when I deploy my app.

I open my terminal and type:
```bash
kamal deploy
```

1. Kamal reads `.kamal/secrets`.
2. It sees the `op read` commands.
3. 1Password pops up on my screen, asking for my fingerprint (TouchID).
4. I scan my finger.
5. 1Password securely hands the keys to Kamal in memory.
6. Kamal pushes the keys to the server and boots the app.

The plain-text keys **do not exist** anywhere on my laptop's hard drive. They live securely in the 1Password cloud, and are injected directly into the production server's memory. 

## Summary

Security as a solo developer is usually an afterthought until something terrible happens. 

By using Kamal 2's secret management, you completely eliminate the risk of the dreaded "leaked `.env` file." 

1. List the variable names in `deploy.yml`.
2. Put the values (or the fetch commands) in `.kamal/secrets`.
3. Keep your `.gitignore` clean.
4. Use a password manager CLI to never store plain text keys locally.

This setup takes about 10 minutes to configure, but the peace of mind it gives you when you run `git push` on a Friday night is priceless.