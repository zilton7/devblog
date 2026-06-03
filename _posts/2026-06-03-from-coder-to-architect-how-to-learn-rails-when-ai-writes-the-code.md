---
title: "From Coder to Architect: How to Learn Rails When AI Writes the Code"
categories: selfnote
tags: [rails, ai, architecture, career]
image:
 path: /assets/images/2026-06-03-From-Coder-To-Architect-How-To-Learn-Rails-When-Ai-Writes-The-Code/feature.webp
---

I recently realized that the way I learned Ruby on Rails ten years ago is now completely obsolete. 

Back then, I spent hundreds of hours watching tutorials like Railscasts or reading books to memorize syntax. I had to learn exactly how to write a `has_many :through` association or how to structure a nested form. I was a **Writer**. My value was my ability to produce correct code.

In 2026, syntax is a commodity. With tools like Cursor and GitHub Copilot, the AI is the writer. I can prompt: *"Add a tagging system to my posts with a many-to-many relationship,"* and the code is written in seconds. 

But here is the problem: **AI is a great writer, but a terrible architect.** 

If you don't know where the code *should* go, the AI will dump it in the easiest place, usually making your controllers and models huge and messy. To survive in this "Post-Tutorial Era," you need to stop focusing on syntax and start focusing on **Architecture**. 

Here is how to learn the "Rails Way" when you aren't the one typing the code.

## 1. Move from "How" to "Where"

When you follow an old-school tutorial, it teaches you **how** to write a method. In 2026, you should be asking **where** that method belongs.

If the AI suggests putting logic that talks to the Stripe API inside your `User` model, you need to be able to say: *"No, that belongs in a Service Object in `app/services`."*

**How to learn this:** Study the **Rails Sidecar** pattern. Look at how modern apps use:
*   **Service Objects:** For third-party API logic.
*   **ViewComponents:** For complex UI logic.
*   **Jobs:** For anything that takes more than 100ms.

## 2. Audit the AI (The "Why" Test)

Don't just hit "Tab" to accept AI suggestions. Every time the AI generates a block of code, perform a manual audit. Ask yourself: *"Why did it use a callback instead of a background job?"* 

If you don't know the answer, ask the AI to explain the trade-offs:
> "Why is an `after_create` callback dangerous here compared to a background job?"

This is how you learn architecture today. You treat the AI as a junior developer and yourself as the **Editor-in-Chief**. By forcing the AI to justify its architectural choices, you learn the underlying principles of the framework.

## 3. Learn "Omakase" Constraints

Rails is an "Omakase" framework (the chef chooses the ingredients). It is built on **Convention over Configuration**. 

The reason AI is so good at writing Rails code is because Rails has very strict conventions. If you try to be "clever" and invent your own folder structure or naming patterns, the AI will get confused and start hallucinating.

**The Strategy:** Lean into the defaults. The more you follow the standard Rails 8 patterns (Solid Queue, Hotwire, etc.), the more the AI becomes a superpower. Architecture in 2026 is about keeping the "wiring" of your app so standard that the AI can perfectly navigate it.

## 4. Read the Rails Source Code

Since you aren't spending time memorizing syntax anymore, use that extra brainpower to read the actual `rails/rails` source code on GitHub. 

If you understand how `ActiveJob` actually works under the hood, you will know exactly how to architect your background tasks. You don't need a tutorial to show you a "To-Do List" app; you need to understand the **Core Patterns** of the framework.

## Summary

The era of the "Tutorial-Driven Developer" is over. If you only know how to follow instructions, an AI can already do your job.

To be a valuable developer in 2026, you must become an **Architect**. 
1.  **Stop memorizing syntax.** The AI handles that.
2.  **Learn patterns.** Know when to use a Concern vs. a Service.
3.  **Enforce standards.** Use `.cursorrules` or RuboCop to keep the AI on track.
4.  **Understand the "Why."** Always ask the AI for the trade-offs of its suggestions.

The code is now free. The **Taste** and **Vision** of how that code fits together is where the money is.
