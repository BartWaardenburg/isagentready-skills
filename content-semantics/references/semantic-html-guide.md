# Semantic HTML Guide

Complete reference for semantic HTML elements, ARIA landmark mapping, heading hierarchy, and link text patterns used by AI agents to navigate web content.

## Document Outline Structure

AI agents parse pages using the accessibility tree, which is built from semantic HTML elements. The standard document outline:

```html
<body>
  <header>           <!-- Site banner: logo, primary nav, search -->
    <nav>            <!-- Primary navigation -->
  </header>

  <main>             <!-- Primary page content (exactly one per page) -->
    <article>        <!-- Self-contained content unit -->
      <header>       <!-- Article header (different from site header) -->
      <section>      <!-- Thematic grouping within the article -->
      <section>
      <footer>       <!-- Article footer: author, date, tags -->
    </article>
    <aside>          <!-- Related but tangential content (sidebar) -->
  </main>

  <footer>           <!-- Site footer: secondary nav, copyright, links -->
    <nav>            <!-- Footer navigation -->
  </footer>
</body>
```

## Semantic Elements Reference

### `<header>`
- **Purpose:** Introductory content for its nearest sectioning ancestor
- **Implicit ARIA role:** `banner` (only when direct child of `<body>`)
- **Usage:** Site header (logo, nav) or article header (title, date)
- **Note:** A page can have multiple `<header>` elements — one for the site, one per `<article>`

```html
<!-- Site header -->
<header>
  <a href="/" aria-label="Home">
    <img src="logo.svg" alt="Acme Inc.">
  </a>
  <nav aria-label="Primary">...</nav>
</header>

<!-- Article header -->
<article>
  <header>
    <h2>Article Title</h2>
    <time datetime="2026-02-27">February 27, 2026</time>
  </header>
</article>
```

### `<nav>`
- **Purpose:** Major navigation block
- **Implicit ARIA role:** `navigation`
- **Usage:** Primary nav, footer nav, breadcrumbs, table of contents
- **Note:** Use `aria-label` when page has multiple `<nav>` elements

```html
<nav aria-label="Primary">
  <a href="/" aria-current="page">Home</a>
  <a href="/products">Products</a>
  <a href="/about">About</a>
</nav>

<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Widget Pro</li>
  </ol>
</nav>
```

### `<main>`
- **Purpose:** Dominant content of the `<body>`
- **Implicit ARIA role:** `main`
- **Rule:** Exactly ONE `<main>` per page
- **Note:** Must not be a descendant of `<article>`, `<aside>`, `<footer>`, `<header>`, or `<nav>`

```html
<body>
  <header>...</header>
  <main>
    <!-- All primary content goes here -->
  </main>
  <footer>...</footer>
</body>
```

### `<article>`
- **Purpose:** Self-contained composition that could be independently distributed
- **Implicit ARIA role:** `article`
- **Usage:** Blog post, news story, forum post, product card, comment
- **Test:** Would this content make sense in an RSS feed or shared on its own?

```html
<article>
  <header>
    <h2>How AI Agents Parse Web Pages</h2>
    <time datetime="2026-02-27">Feb 27, 2026</time>
  </header>
  <p>AI agents rely on the accessibility tree...</p>
  <footer>
    <p>By <a href="/authors/jane">Jane Doe</a></p>
  </footer>
</article>
```

### `<section>`
- **Purpose:** Thematic grouping of content, typically with a heading
- **Implicit ARIA role:** `region` (only when it has an accessible name via `aria-label` or `aria-labelledby`)
- **Usage:** Chapters, tab panels, grouped form fields
- **Rule:** Always include a heading in a `<section>`

```html
<section aria-labelledby="pricing-heading">
  <h2 id="pricing-heading">Pricing</h2>
  <p>Choose the plan that works for you.</p>
</section>
```

### `<aside>`
- **Purpose:** Content tangentially related to the surrounding content
- **Implicit ARIA role:** `complementary`
- **Usage:** Sidebars, pull quotes, related articles, advertising

```html
<main>
  <article>...</article>
  <aside aria-label="Related articles">
    <h2>Related Articles</h2>
    <ul>
      <li><a href="/blog/ssr-guide">SSR Implementation Guide</a></li>
      <li><a href="/blog/aria-patterns">ARIA Patterns for AI</a></li>
    </ul>
  </aside>
</main>
```

### `<footer>`
- **Purpose:** Footer for its nearest sectioning ancestor
- **Implicit ARIA role:** `contentinfo` (only when direct child of `<body>`)
- **Usage:** Site footer (copyright, links) or article footer (author, tags)

```html
<!-- Site footer -->
<footer>
  <nav aria-label="Footer">
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms of Service</a>
  </nav>
  <p>&copy; 2026 Acme Inc.</p>
</footer>
```

## Article vs Section Decision Guide

| Question | If yes → | If no → |
|----------|----------|---------|
| Could this stand alone (RSS feed, social share)? | `<article>` | `<section>` |
| Is it a blog post, news item, comment, or product? | `<article>` | Consider `<section>` |
| Is it a thematic grouping with a heading? | `<section>` | Consider `<div>` |
| Does it only exist to style/layout content? | `<div>` | Use semantic element |

**Nesting rules:**
- `<article>` can contain `<section>` (chapters within a post)
- `<section>` can contain `<article>` (a "latest posts" section with multiple articles)
- `<article>` can contain `<article>` (comments on a blog post)

```html
<!-- Blog post with sections -->
<article>
  <h1>Complete Guide to SSR</h1>
  <section>
    <h2>What is SSR?</h2>
    <p>...</p>
  </section>
  <section>
    <h2>Framework Comparison</h2>
    <p>...</p>
  </section>
</article>

<!-- Section containing multiple articles -->
<section aria-labelledby="latest-heading">
  <h2 id="latest-heading">Latest Posts</h2>
  <article><h3>Post One</h3><p>...</p></article>
  <article><h3>Post Two</h3><p>...</p></article>
</section>
```

## Implicit ARIA Role Mapping

Semantic HTML elements automatically map to ARIA roles. Using the semantic element is preferred over explicit `role` attributes.

| HTML Element | Implicit ARIA Role | Condition |
|-------------|-------------------|-----------|
| `<header>` | `banner` | Direct child of `<body>` |
| `<nav>` | `navigation` | Always |
| `<main>` | `main` | Always |
| `<footer>` | `contentinfo` | Direct child of `<body>` |
| `<aside>` | `complementary` | Always |
| `<article>` | `article` | Always |
| `<section>` | `region` | Only with accessible name |
| `<form>` | `form` | Only with accessible name |
| `<search>` | `search` | Always |

**Key rule:** Do NOT add redundant `role` attributes to semantic elements:

```html
<!-- WRONG — redundant -->
<main role="main">
<nav role="navigation">
<header role="banner">

<!-- CORRECT — implicit roles are sufficient -->
<main>
<nav>
<header>
```

## Additive ARIA Attributes

These attributes ADD information beyond what semantic HTML provides:

### `aria-label`
Provides an accessible name. Use when multiple elements of the same type exist:
```html
<nav aria-label="Primary">...</nav>
<nav aria-label="Footer">...</nav>
<nav aria-label="Breadcrumb">...</nav>
```

### `aria-labelledby`
Points to a visible heading as the accessible name:
```html
<section aria-labelledby="pricing-heading">
  <h2 id="pricing-heading">Pricing Plans</h2>
</section>
```

### `aria-describedby`
Points to additional descriptive text:
```html
<input type="email" aria-describedby="email-hint">
<p id="email-hint">We'll never share your email.</p>
```

### `aria-current`
Indicates the current item in a set:
```html
<nav>
  <a href="/" aria-current="page">Home</a>
  <a href="/about">About</a>
</nav>
```

Values: `page`, `step`, `location`, `date`, `time`, `true`

### `aria-live`
Announces dynamic content changes to assistive technology:
```html
<div aria-live="polite" aria-label="Search results">
  <!-- Content updated via JavaScript -->
</div>

<div aria-live="assertive" role="alert">
  <!-- Urgent notifications -->
</div>
```

### `aria-expanded`
Indicates whether a collapsible element is expanded:
```html
<button aria-expanded="false" aria-controls="menu">Menu</button>
<nav id="menu" hidden>...</nav>
```

### `aria-hidden`
Hides decorative content from the accessibility tree:
```html
<span aria-hidden="true">🎉</span>
<img src="decorative-swoosh.svg" alt="" aria-hidden="true">
```

## Heading Hierarchy Patterns

### Standard Page Layout
```html
<h1>Company Name — Page Title</h1>
  <h2>About Us</h2>
    <h3>Our Mission</h3>
    <h3>Our Team</h3>
  <h2>Services</h2>
    <h3>Web Development</h3>
    <h3>AI Integration</h3>
  <h2>Contact</h2>
```

### Blog Post
```html
<h1>How to Implement SSR for AI Agents</h1>
  <h2>Introduction</h2>
  <h2>Why SSR Matters</h2>
    <h3>AI Agent Limitations</h3>
    <h3>Performance Benefits</h3>
  <h2>Implementation Guide</h2>
    <h3>Next.js</h3>
    <h3>Nuxt</h3>
    <h3>Astro</h3>
  <h2>Conclusion</h2>
```

### E-commerce Product Page
```html
<h1>Wireless Noise-Cancelling Headphones</h1>
  <h2>Product Description</h2>
  <h2>Specifications</h2>
    <h3>Audio</h3>
    <h3>Battery</h3>
    <h3>Connectivity</h3>
  <h2>Reviews</h2>
    <h3>Customer Review by John</h3>
    <h3>Customer Review by Sarah</h3>
```

## Descriptive Link Text Patterns

### Generic → Descriptive Replacements

| Generic (avoid) | Descriptive (use instead) |
|-----------------|--------------------------|
| Click here | View pricing plans |
| Read more | Read the SSR implementation guide |
| Learn more | Explore our API documentation |
| Here | Download the annual report |
| Link | Visit the W3C accessibility standards |
| More | See all 24 customer reviews |
| Details | View order #1234 details |
| Info | Read the product specifications |

### Context-Aware Patterns

```html
<!-- Blog listing -->
<article>
  <h3>Implementing SSR for AI Agents</h3>
  <p>Learn how server-side rendering improves AI agent comprehension...</p>
  <a href="/blog/ssr-for-ai">Read "Implementing SSR for AI Agents"</a>
</article>

<!-- Product cards -->
<div>
  <h3>Widget Pro</h3>
  <p>$99/month</p>
  <a href="/products/widget-pro">View Widget Pro details</a>
</div>

<!-- Documentation -->
<p>
  Configure your server using the
  <a href="/docs/configuration">server configuration guide</a>.
</p>
```
