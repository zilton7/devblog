---
title: Cheat Sheet For a JavaScript Developer Diving Into TypeScript For The First Time

categories: selfnote
tags: typescript javascript
image:
  feature: /assets/images/2025-11-21-Cheat-sheet-for-a-JavaScript-developer-diving-into-TypeScript-for-the-first-time/img.png
---
Here is a cheat sheet for a JavaScript developer diving into TypeScript (TS) for the first time.

### The Golden Rule
**TypeScript is just JavaScript with "Types" added.**
The browser cannot run TypeScript. It must be "transpiled" (compiled) back into JavaScript using the command `tsc`.

---

### 1. Basic Types (Primitives)
In JS, you just write the value. In TS, you define what *kind* of value it is after a colon.

```typescript
let username: string = "Zil";
let age: number = 30;
let isAdmin: boolean = true;

// Arrays
let skills: string[] = ["JS", "TS", "React"];
let numbers: number[] = [1, 2, 3];
```

> **Note:** TS has **Type Inference**. If you write `let x = 5`, TS knows it's a number. You don't *always* have to write `: number`.

### 2. Interfaces (Typing Objects)
This is the most common thing you will do. You need to define the "shape" of an object before you create it.

```typescript
// Define the shape
interface User {
  id: number;
  name: string;
  email?: string; // The '?' means this is OPTIONAL
}

// Use the shape
const currentUser: User = {
  id: 1,
  name: "Zil",
  // email is missing, but that's okay because of the '?'
};
```

### 3. Functions
You must type the **arguments**. You *can* type the **return value**, but TS usually figures that out.

```typescript
// (arg: type): returnType
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const logMessage = (msg: string): void => {
  console.log(msg);
};
```
*Note: `void` means the function returns nothing.*

### 4. Union Types (The "OR" Operator)
This is powerful. A variable can be one type **OR** another.

```typescript
let id: string | number;
id = 101;   // OK
id = "101"; // OK
id = true;  // Error!
```

**Literal Types (Specific Strings):**
Great for status flags.
```typescript
type Status = "loading" | "success" | "error";

let appState: Status = "loading"; // OK
let appState: Status = "pending"; // Error!
```

### 5. The "Any" Trap
*   **`any`**: Turns off TypeScript for that variable. It accepts anything.
    *   *Avoid this unless absolutely necessary.* It defeats the purpose of using TS.
*   **`unknown`**: Like `any`, but safer. It forces you to check the type before using it.

```typescript
let lazyData: any = "hello";
lazyData = 5; // TS won't complain, but this is dangerous.
```

### 6. Type Aliases vs Interfaces
You will see both. For beginners, they are 95% the same.
*   **`interface`**: Better for defining Objects. Can be extended.
*   **`type`**: Better for Unions, Primitives, or complex logic.

```typescript
interface Person { name: string } // Good for objects
type ID = string | number;        // Good for unions
```

### 7. Generics (The `<T>` Syntax)
Think of Generics as **variables for types**. It allows a function or component to work with different types without using `any`.

Common in React:
```typescript
// useState<Type>(initialValue)
const [user, setUser] = useState<User | null>(null);
```

### 8. Casting (Type Assertion)
Sometimes you know more than TypeScript does. You can force a type.

```typescript
// Tells TS: "Trust me, this ID element exists and it is an Input"
const input = document.getElementById("my-input") as HTMLInputElement;
```

---

### Summary Checklist for your First Day
1.  Don't put `: type` on everything. Let inference work for simple variables (`let x = 10`).
2.  Use **Interfaces** to describe your JSON data or Objects.
3.  Use **Union Types** (`|`) instead of complex inheritance.
4.  If you get stuck, use `any` to move forward, but add a `// TODO: fix any` comment to come back later.
