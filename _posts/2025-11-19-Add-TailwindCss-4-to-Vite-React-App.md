---
title: Add TailwindCss 4 to Vite React App

categories: selfnote
tags: vite react tailwindcss
---
Here is the guide to adding **Tailwind CSS v4** to an existing Vite React app.

![Cover Image of the Article]({{ site.url }}{{ site.baseurl }}/assets/images/2025-11-19-Add-TailwindCss-4-to-Vite-React-App/vite-tailwind-react.jpg)

Version 4 simplifies the setup significantly by using a dedicated Vite plugin and a "CSS-first" configuration, removing the need for `postcss.config.js` and `tailwind.config.js`.

### 1. Install the Dependencies
Run the following command in your terminal to install the main package and the new Vite plugin:

```bash
npm install tailwindcss @tailwindcss/vite
```

### 2. Configure the Vite Plugin
Open your `vite.config.js` (or `vite.config.ts`) file. You need to import the Tailwind plugin and add it to the `plugins` array.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- Import this

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Add this to the plugins array
  ],
})
```

### 3. Import Tailwind in your CSS
Open your global CSS file (usually **`src/index.css`**). Delete existing content and replace it with this single line:

```css
@import "tailwindcss";
```

> **Note:** In v4, you no longer use `@tailwind base;`, `@tailwind components;`, etc. You just use the standard CSS import.

### 4. Start Development Server
Restart your server to apply the new plugin configuration:

```bash
npm run dev
```

### 5. Test It
Open `src/App.jsx` and add some classes to verify it's working:

```jsx
export default function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <h1 className="text-4xl font-bold underline decoration-blue-500">
        Hello Tailwind 4!
      </h1>
    </div>
  )
}
```

### Key Changes in v4 vs v3
*   **No Config Files:** You don't need `tailwind.config.js` or `postcss.config.js` anymore.
*   **CSS-First Config:** If you need to customize the theme (like adding custom colors), you now do it directly in your CSS file using CSS variables:
    ```css
    @import "tailwindcss";

    @theme {
      --color-brand: #ff5733;
      --font-display: "Satoshi", sans-serif;
    }
    ```
    You can then use these like `text-brand` or `font-display`.
