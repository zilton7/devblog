---
title: "UUID v7 vs. ULID: Which Sortable ID Should You Choose?"
categories: selfnote
tags: [rails, postgresql, database, architecture]
image:
 path: /assets/images/2026-05-29-Uuid-V7-Vs-Ulid-Which-Sortable-Id-Should-You-Choose/feature.webp
---

For a long time, if you wanted a primary key that was both unique and chronological, you reached for **ULID**. It was the perfect "indie" solution to the randomness of UUID v4. It gave us fast database inserts and clean, copy-pasteable URLs.

But the world of standards moves fast. In 2024, the IETF officially published RFC 9562, which introduced **UUID v7**. It does almost exactly what ULID does: it embeds a timestamp into the first part of the ID.

If you are starting a new Rails 8 app today, you might be wondering: *"Is ULID still relevant, or should I switch to the 'official' UUID v7?"*

I’ve looked at both, and while they serve the same purpose, the choice usually comes down to a battle between **Native Performance** and **Developer Experience (Readability)**. Here is the breakdown.

---

## The Side-by-Side Look

First, let's look at how they appear in your logs or your browser address bar:

*   **ULID:** `01J7Z3P7W9K2Q4R5S6T7V8W9X0` (26 characters, Case-insensitive)
*   **UUID v7:** `0191eb5d-79e0-7174-8b01-382a937a4697` (36 characters, Hexadecimal)

Both represent the exact same amount of data (128 bits). Both are "lexicographically sortable," meaning your database can sort them by time without a separate `created_at` column.

---

## 1. The "Native" Win (Why UUID v7 wins on Performance)

This is the biggest argument for UUID v7. Because it is an official standard, database engines like **PostgreSQL 17+** and **MariaDB** are building native support for it.

When you use UUID v7 in Postgres:
*   **Storage:** It is stored as a native `uuid` type (16 bytes). 
*   **Indexing:** The database knows exactly how to optimize the B-Tree index for this specific format.
*   **Interoperability:** Almost every language (Python, Go, Java) now has a native UUID v7 generator in its standard library.

In contrast, ULID is usually stored as a `string` or `text` in Postgres. A string takes up more space and is slower to query than a native `uuid` type.

---

## 2. The "Copy-Paste" Win (Why ULID wins on DX)

If you are a solo developer who spends all day looking at your own URLs and database rows, **ULID is much nicer to work with.**

**The Double-Click Rule:** 
If you try to copy a UUID from a terminal or a text editor, a double-click usually only selects one "chunk" between the dashes. You have to carefully click and drag to copy the whole thing.
With ULID, a double-click selects the entire string every time. It sounds small, but when you do it 100 times a day, it matters.

**The Crockford Base32 Alphabet:**
ULIDs use a specific set of characters that exclude confusing letters like `I`, `L`, `O`, and `U`. This makes them much safer to read over the phone or type manually if you ever have to do customer support.

---

## 3. Implementation in Rails 8

Rails 8 has made switching to UUIDs (including v7) very easy. You don't even need an external gem anymore if your database supports it.

### Step 1: Migration
When creating your table, just specify the type.

```ruby
create_table :posts, id: :uuid do |t|
  t.string :title
  t.timestamps
end
```

### Step 2: Model Configuration
If your database doesn't generate v7 by default, you can tell Rails to do it using the `uuid` gem (which now supports v7).

```ruby
# app/models/post.rb
class Post < ApplicationRecord
  # Rails 8 can handle this via default_random_uuid() in PG 
  # or you can set it manually:
  before_create { self.id ||= UUID7.generate }
end
```

---

## Summary: Which one should you pick?

**Choose UUID v7 if:**
*   You want the highest possible performance in PostgreSQL.
*   You are building a high-volume app with millions of writes per day.
*   You want to follow "Official Standards" so your data plays nice with other systems.

**Choose ULID if:**
*   You value **Readability** and **Developer Happiness** above all else.
*   Your app is an internal tool or a standard SaaS where the "string vs native uuid" performance gap is too small to notice.
*   You hate dashes in your URLs.

**My Verdict:** 
I’m a pragmatist. For my core business data (Users, Invoices, Orders), I’ve switched to **UUID v7** because I want that native Postgres efficiency. But for things like "Slug" replacements or public-facing tokens, I still use **ULID** because it just looks better.