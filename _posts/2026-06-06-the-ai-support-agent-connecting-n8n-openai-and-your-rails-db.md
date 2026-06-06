---
title: "The AI Support Agent: Connecting n8n, OpenAI, and Your Rails DB"
categories: selfnote
tags: [productivity, ai, rails, automation]
image:
 path: /assets/images/2026-06-06-The-Ai-Support-Agent-Connecting-N8n-Openai-And-Your-Rails-Db/feature.webp
---

I used to wake up every morning to a wall of support emails. As a solo developer, this is the ultimate "flow-state" killer. 

Someone can't find their invoice. Someone else wants to know why their "Pro" features aren't active yet. To answer these, I had to open my Rails console, look up the user by email, check their `plan_id` and `stripe_customer_id`, and then type out a polite response. 

It takes 10 minutes per ticket. If you have 10 tickets, your first two hours of work are gone before you've even touched your code.

In 2026, I’ve automated 90% of this work. I don't let AI talk directly to my customers (that’s dangerous), but I do let AI **draft the replies** for me, with full context from my production database. 

Here is how I built a "Support Sidekick" using **n8n**, **OpenAI**, and a **PostgreSQL** connection.

## The Strategy: The "Human-in-the-Loop"

We aren't building a bot that auto-replies. We are building a system that:
1. Catches an incoming support email.
2. Looks up the user's data in our real Rails database.
3. Asks OpenAI to write a draft based on that data.
4. Sends the draft to a private Discord channel for us to "Approve & Send."

## STEP 1: The Trigger (Email or Webhook)

First, you need a way for n8n to see the support request. 
*   **The Easy Way:** Use the **Gmail** or **Outlook** node in n8n to watch for new emails with the subject "Support."
*   **The Pro Way:** Use a **Webhook** node. If you use a tool like HelpScout or Crisp, they can send a webhook to n8n every time a new ticket is created.

## STEP 2: Connecting the Production DB (Security First)

To give the AI context, it needs to know who the user is. 

**CRITICAL SECURITY RULE:** Never connect n8n to your production database using an admin account. 
Create a **Read-Only** user in Postgres that can only see the `users` and `subscriptions` tables.

```sql
-- Run this in your production DB once
CREATE USER n8n_read_only WITH PASSWORD 'your_password';
GRANT CONNECT ON DATABASE my_app_production TO n8n_read_only;
GRANT USAGE ON SCHEMA public TO n8n_read_only;
GRANT SELECT ON public.users, public.subscriptions TO n8n_read_only;
```

In n8n, add a **PostgreSQL node**. Use the email from the incoming ticket to find the user:
`SELECT * FROM users WHERE email = '{{ $json.from_email }}' LIMIT 1;`

## STEP 3: The AI Brain (OpenAI)

Now we add the **OpenAI node**. We want to use a high-context model like GPT-4o. 

The secret here is the **System Prompt**. You need to give the AI the data you just pulled from the database.

**System Prompt Example:**
> "You are a support assistant for [App Name]. Here is the user's data: 
> Plan: {{ $node.postgres.json.plan_name }}
> Joined: {{ $node.postgres.json.created_at }}
> Last Payment: {{ $node.postgres.json.last_payment_date }}
> 
> Use this data to draft a polite, helpful response to the user's question. If they are on a Free plan, suggest they upgrade for priority support. If they are a Pro user, be extra thankful."

## STEP 4: The Delivery (Discord or Slack)

Finally, we send the AI's draft to where we spend our time: **Discord**.

Add a **Discord node** (or Slack). Set the message content to:
> **New Support Ticket from {{ $json.from_email }}**
> 
> **User Question:** {{ $json.subject }}
> 
> **AI Drafted Reply:**
> {{ $node.openai.json.content }}

## Why this is a game changer

When I see a notification on my phone now, I don't have to go digging through my database. I see the user's status and a perfectly written draft immediately. 

I just copy the AI draft, make a tiny tweak if needed, and hit "Send" in my email client. What used to take 10 minutes now takes **30 seconds**.

## Summary

As a solo developer, you should only do "High Value" work. 
1.  **High Value:** Fixing a critical bug, building a new feature.
2.  **Low Value:** Looking up a user's sign-up date for a support ticket.

By using n8n to bridge the gap between your **Production Database** and **OpenAI**, you offload the low-value research work to the machines. Your Rails monolith stays clean, and your brain stays focused on the code.