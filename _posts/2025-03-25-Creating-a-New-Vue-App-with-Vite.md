---
title: 'Creating a New Vue App with Vite'
categories: Javascript
tags: vite vue javascript
---

Vite is a modern frontend build tool that provides extremely fast development server startup and hot module replacement. Here's how to create a new Vue app using Vite:

![Vite and Vue]({{ site.url }}{{ site.baseurl }}/assets/images/2025-04-25-Creating-a-New-Vue-App-with-Vite/vite-and-vue.webp)


## Quick Start

1. **Create the project**:
   ```bash
   npm create vite@latest my-vue-app -- --template vue
   ```

   Or using yarn:
   ```bash
   yarn create vite my-vue-app --template vue
   ```

2. **Navigate to the project directory**:
   ```bash
   cd my-vue-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Alternative Methods

### Using pnpm
```bash
pnpm create vite my-vue-app --template vue
cd my-vue-app
pnpm install
pnpm dev
```

### Using Vue CLI (legacy)
While Vite is now the recommended approach, you can still use Vue CLI:
```bash
npm install -g @vue/cli
vue create my-vue-app
# Then select Vue 3 preset
```

## Project Structure

A typical Vite + Vue project structure looks like:
```
my-vue-app/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
```

## Additional Configuration

To add TypeScript support:
```bash
npm create vite@latest my-vue-app -- --template vue-ts
```

To add Vue Router:
```bash
npm install vue-router@4
```

To add Pinia (state management):
```bash
npm install pinia
```

The Vite+Vue combination provides a blazing fast development experience with modern tooling out of the box.