---
title: "The Vibe Coder’s Survival Guide: Concepts You Can’t Just Prompt Away"
categories: selfnote
tags: [webdev, beginners, ai, productivity]
image:
 path: /assets/images/2026-05-21-The-Vibe-Coder-S-Survival-Guide-Concepts-You-Can-T-Just-Prompt-Away/feature.webp
---

We are living in a wild time for software development. With tools like Cursor, Windsurf, and ChatGPT, you can "vibe" your way into a working application without knowing how to write a single line of CSS or Ruby from scratch. 

But I have noticed a pattern: **Vibe coding works until it doesn't.** 

The moment the AI makes a mistake, or your app gets a weird error, you hit a wall. If you don't understand the underlying concepts, you can't tell the AI how to fix the mess it made. You become a "Prompt Monkey" - just typing instructions and hoping for the best.

To be a truly successful Vibe Coder (or what I call an **Editor-in-Chief**), you need to understand 5 core concepts. You don't need to memorize the syntax, but you need to understand the "Why."

## LEVEL 1: State (The Memory)

The most important question in any app is: *"What does the computer remember right now?"*

Imagine your app is a person. 
*   **Local State:** This is like a thought in the person's head. If they go to sleep (refresh the page), they forget it. 
*   **Global/Database State:** This is like a note written in a notebook. Even if the person dies (the server restarts), the information is still there.

**Why this matters for Vibes:** If you ask the AI to "Change the user's name," but you don't specify if it should change it in the **Browser** or the **Database**, the AI might choose the wrong one. You’ll see the name change on the screen, but it will revert back the moment you refresh.

## LEVEL 2: Control Flow (The Path)

AI is great at writing logic, but it doesn't always understand the "Path" a user takes. Control flow is just a fancy way of saying "If this happens, do that."

```ruby
if user.subscribed?
  show_video
else
  redirect_to_pricing_page
end
```

**Why this matters for Vibes:** When your app has a bug, it’s usually because the "Path" is broken. You need to be able to look at the code and say: *"Wait, the AI is checking if the user is an admin BEFORE it checks if the user is even logged in."* Identifying the order of logic is a human job.

## LEVEL 3: The Request/Response Cycle (The Mailman)

This is where most Vibe Coders get stuck. They try to run a database query inside a JavaScript file that lives in the browser. 

**The Golden Rule:**
*   **Frontend (The Browser):** This is the "Face." It handles what things look like and clicking buttons. It cannot talk to the database directly.
*   **Backend (The Server/Rails):** This is the "Brain." It has the keys to the vault (The Database).

**Why this matters for Vibes:** If the AI gives you code that doesn't work, check where it put the code. If it’s trying to send an email from a file in `app/javascript`, it will fail because the browser isn't allowed to send emails. You have to tell the AI: *"Move this logic to the controller."*

## LEVEL 4: Data Shapes (Arrays and Hashes)

You don't need to know how to sort an array, but you need to know what they look like.

*   **Array:** A simple list. `["Apple", "Banana", "Orange"]`
*   **Hash (or Object):** A dictionary with keys. `{ name: "Zil", country: "Lithuania" }`

**Why this matters for Vibes:** When the AI says "Error: undefined method [] for NilClass," it usually means it expected a Hash but got nothing. You need to be able to look at the data coming from an API and see if the "Shape" matches what your code expects.

## LEVEL 5: Persistence (The Database)

As a Rails dev, I love ActiveRecord. It makes the database feel like Ruby. But you still need to understand that the database is just a giant Excel spreadsheet.

*   **Models:** The name of the tab in the spreadsheet (e.g., "Users").
*   **Rows:** One specific user.
*   **Columns:** The name, email, and password.

**Why this matters for Vibes:** Sometimes the AI will suggest code that uses a column that doesn't exist yet (e.g., `user.avatar`). You need to realize: *"Oh, I haven't run a migration to add the avatar column to the spreadsheet yet."* The AI can't always see your database schema perfectly.

## Summary: The Hybrid Workflow

Vibe coding is a superpower, but every superhero needs a mentor. 

1.  **Vibe the feature:** Let the AI build the first version.
2.  **Audit the State:** Did it save to the DB or just the screen?
3.  **Check the Path:** Is the logic in the right order?
4.  **Verify the Location:** Is this a Frontend task or a Backend task?

If you understand these 5 things, you stop being a passenger and start being the pilot. You can build much more complex apps because you know how to debug the "Vibe."