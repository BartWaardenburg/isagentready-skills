# SSR Strategies by Framework

Server-side rendering (SSR) ensures AI agents can read your content without executing JavaScript. This guide covers implementation strategies for major frameworks.

## Why SSR Matters for AI Agents

AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Googlebot) fetch raw HTML. They do **not** execute JavaScript. A client-side rendered SPA returns an empty shell:

```html
<!-- What AI agents see from a typical SPA -->
<html>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script>
</body>
</html>
```

This scores 0 points on checkpoint 3.1. The fix: render content on the server.

## Detecting SPA Shell Problems

### Quick test with curl
```bash
# See what AI agents see (raw HTML, no JS)
curl -s https://example.com | head -50

# Count visible text characters (excluding scripts/styles/tags)
curl -s https://example.com \
  | sed 's/<script[^>]*>.*<\/script>//g; s/<style[^>]*>.*<\/style>//g; s/<[^>]*>//g' \
  | tr -s ' \n' \
  | wc -c
```

If the character count is under 200, the site relies on JavaScript for content.

### Common SPA shell indicators
```html
<div id="root"></div>          <!-- React (Create React App) -->
<div id="app"></div>           <!-- Vue CLI, generic SPAs -->
<div id="__next"></div>        <!-- Next.js with client-only rendering -->
<div id="__nuxt"></div>        <!-- Nuxt with SPA mode -->
```

## Framework Guides

### Next.js

#### App Router (Next.js 13+) — Server Components by Default

Components in the `app/` directory are Server Components by default. Content is rendered on the server automatically.

```tsx
// app/page.tsx — Server Component (default, no directive needed)
export default async function HomePage() {
  const products = await fetch('https://api.example.com/products').then(r => r.json());

  return (
    <main>
      <h1>Our Products</h1>
      {products.map((product: Product) => (
        <article key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </article>
      ))}
    </main>
  );
}
```

For static generation with known paths:

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return (
    <article>
      <h1>{post.title}</h1>
      {/* Render sanitized HTML content */}
      <div>{post.content}</div>
    </article>
  );
}
```

Only add `"use client"` when the component needs browser APIs (useState, useEffect, event handlers).

#### Pages Router (Next.js 12 and earlier)

```tsx
// pages/products.tsx
import type { GetServerSideProps } from 'next';

interface Props {
  products: Product[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const products = await fetchProducts();
  return { props: { products } };
};

export default function ProductsPage({ products }: Props) {
  return (
    <main>
      <h1>Products</h1>
      {products.map(product => (
        <article key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </article>
      ))}
    </main>
  );
}
```

For static pages that don't change often:

```tsx
export const getStaticProps: GetStaticProps<Props> = async () => {
  const products = await fetchProducts();
  return {
    props: { products },
    revalidate: 3600, // ISR: regenerate every hour
  };
};
```

### Nuxt (Vue)

#### Nuxt 3 — SSR by Default

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // This is the default
});
```

```vue
<!-- pages/products.vue -->
<script setup lang="ts">
const { data: products } = await useFetch('/api/products');
</script>

<template>
  <main>
    <h1>Products</h1>
    <article v-for="product in products" :key="product.id">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
    </article>
  </main>
</template>
```

**Fix SPA-mode Nuxt:** If `ssr: false` is set in config, change it to `true`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // Changed from false
});
```

### Astro

Astro renders to static HTML by default. No configuration needed for SSR of static content.

```astro
---
// src/pages/products.astro
const products = await fetch('https://api.example.com/products').then(r => r.json());
---

<html lang="en">
<body>
  <main>
    <h1>Products</h1>
    {products.map((product: Product) => (
      <article>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
      </article>
    ))}
  </main>
</body>
</html>
```

For dynamic routes with SSR:

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'hybrid', // Static by default, opt-in SSR per page
  adapter: node({ mode: 'standalone' }),
});
```

```astro
---
// src/pages/products/[id].astro
export const prerender = false; // SSR for this page

const { id } = Astro.params;
const product = await fetch(`https://api.example.com/products/${id}`).then(r => r.json());
---

<article>
  <h1>{product.name}</h1>
  <p>{product.description}</p>
</article>
```

### Remix

Remix uses server-side `loader` functions. All routes are SSR by default.

```tsx
// app/routes/products.tsx
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
  const products = await fetchProducts();
  return json({ products });
}

export default function Products() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>Products</h1>
      {products.map(product => (
        <article key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </article>
      ))}
    </main>
  );
}
```

### SvelteKit

```ts
// src/routes/products/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const products = await fetchProducts();
  return { products };
};
```

```svelte
<!-- src/routes/products/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
</script>

<main>
  <h1>Products</h1>
  {#each data.products as product}
    <article>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
    </article>
  {/each}
</main>
```

Ensure SSR is not disabled in config:

```ts
// svelte.config.js
const config = {
  kit: {
    // Do NOT set: ssr: false
  }
};
```

### Angular (with SSR)

```bash
# Add SSR to an existing Angular project
ng add @angular/ssr
```

```ts
// server.ts is generated automatically
// Components render on the server by default with Angular SSR

// For data fetching, use a resolver:
// app/products/products.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProductService } from './product.service';

export const productsResolver: ResolveFn<Product[]> = () => {
  return inject(ProductService).getProducts();
};
```

```ts
// app/products/products.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: ProductsComponent,
    resolve: { products: productsResolver },
  },
];
```

## Noscript Fallback

If full SSR is not feasible, add a `<noscript>` fallback for partial credit (10 pts instead of 0):

```html
<body>
  <div id="root"></div>
  <noscript>
    <main>
      <h1>Example Site</h1>
      <p>This site requires JavaScript to function fully.</p>
      <nav>
        <h2>Site Map</h2>
        <ul>
          <li><a href="/products">Products</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
      <p>For the best experience, please enable JavaScript.</p>
    </main>
  </noscript>
  <script src="/bundle.js"></script>
</body>
```

**Important:** `<noscript>` is a partial solution. AI agents that parse raw HTML will see the noscript content but miss your actual dynamic content. Full SSR is always preferred.

## Verification

After implementing SSR, verify with curl:

```bash
# Check visible text count (should be >200 characters)
curl -s https://example.com \
  | sed 's/<script[^>]*>.*<\/script>//g; s/<style[^>]*>.*<\/style>//g; s/<[^>]*>//g' \
  | tr -s ' \n' \
  | wc -c

# Check for SPA shell (should return no results)
curl -s https://example.com | grep -E '<div id="(root|app|__next)"></div>'

# View the rendered HTML structure
curl -s https://example.com | grep -oE '<(h[1-6]|header|nav|main|article|section|footer)[^>]*>' | head -20
```
