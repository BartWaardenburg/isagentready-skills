# Content & Semantics Gotchas

Common pitfalls when implementing semantic HTML for AI agent readiness. Each gotcha includes WRONG and CORRECT examples.

---

## 1. Multiple `<h1>` Tags from Component Composition

Components that include their own `<h1>` create duplicate headings when composed into a page.

**WRONG:**
```tsx
// Header component
function Header() {
  return <header><h1>Company Name</h1></header>;
}

// Page component — now the page has TWO <h1> tags
function ProductPage() {
  return (
    <>
      <Header />
      <main>
        <h1>Our Products</h1>  {/* Second h1! */}
      </main>
    </>
  );
}
```

**CORRECT:**
```tsx
// Header component uses logo/link, not h1
function Header() {
  return (
    <header>
      <a href="/" aria-label="Home">
        <img src="logo.svg" alt="Company Name">
      </a>
    </header>
  );
}

// Each page defines its own single h1
function ProductPage() {
  return (
    <>
      <Header />
      <main>
        <h1>Our Products</h1>
      </main>
    </>
  );
}
```

**Rule:** The `<h1>` is always the page title, never a site-wide branding element.

---

## 2. Heading Level Resets in Reusable Components

Components that hardcode heading levels break hierarchy when used at different nesting depths.

**WRONG:**
```tsx
// Card component always uses <h3>
function FeatureCard({ title, description }) {
  return (
    <div>
      <h3>{title}</h3>  {/* What if parent context is <h2>? Or <h4>? */}
      <p>{description}</p>
    </div>
  );
}

// Used under <h2> — fine
<h2>Features</h2>
<FeatureCard title="Speed" />  {/* h3 is correct here */}

// Used under <h4> — broken! h3 after h4 is a level skip backwards
<h4>Advanced Features</h4>
<FeatureCard title="Custom API" />  {/* h3 is wrong here */}
```

**CORRECT:**
```tsx
// Accept heading level as a prop
function FeatureCard({ title, description, headingLevel = 'h3' }) {
  const Heading = headingLevel;
  return (
    <div>
      <Heading>{title}</Heading>
      <p>{description}</p>
    </div>
  );
}

// Use at appropriate level
<h2>Features</h2>
<FeatureCard title="Speed" headingLevel="h3" />

<h4>Advanced Features</h4>
<FeatureCard title="Custom API" headingLevel="h5" />
```

---

## 3. `<noscript>` Is Not a Substitute for SSR

Adding `<noscript>` provides a fallback but does NOT make your content visible to AI agents that parse HTML normally (they don't execute JS but they also don't specifically look for `<noscript>`).

**WRONG — Thinking noscript solves the problem:**
```html
<body>
  <div id="root"></div>
  <noscript>
    <p>Please enable JavaScript</p>
  </noscript>
  <script src="/bundle.js"></script>
</body>
<!-- AI agents see: empty root div + "Please enable JavaScript" -->
<!-- Score: 10 pts (partial), NOT 20 pts -->
```

**CORRECT — Server-render actual content:**
```html
<body>
  <main>
    <h1>Our Products</h1>
    <article>
      <h2>Widget Pro</h2>
      <p>The fastest widget on the market...</p>
    </article>
  </main>
  <script src="/bundle.js"></script>
</body>
<!-- AI agents see: full content in HTML -->
<!-- Score: 20 pts (pass) -->
```

**Rule:** `<noscript>` is partial credit (10 pts). Real SSR is the only way to get full score (20 pts).

---

## 4. `<article>` vs `<section>` Confusion

Using `<article>` and `<section>` interchangeably. They have different semantic meanings.

**WRONG:**
```html
<!-- Using article for non-standalone content -->
<article>
  <h2>Pricing</h2>
  <p>Choose your plan</p>
</article>

<!-- Using section for standalone content -->
<section>
  <h2>How AI Agents Parse HTML</h2>
  <p>AI agents use the accessibility tree...</p>
  <p>Published: Feb 27, 2026 by Jane Doe</p>
</section>
```

**CORRECT:**
```html
<!-- Section: thematic grouping within a page -->
<section>
  <h2>Pricing</h2>
  <p>Choose your plan</p>
</section>

<!-- Article: standalone, redistributable content -->
<article>
  <h2>How AI Agents Parse HTML</h2>
  <p>AI agents use the accessibility tree...</p>
  <footer>Published: Feb 27, 2026 by Jane Doe</footer>
</article>
```

**Test:** Would this make sense in an RSS feed or if shared independently? → `<article>`. Is it just a thematic grouping within a page? → `<section>`.

---

## 5. Redundant ARIA Roles on Semantic Elements

Adding explicit `role` attributes that duplicate the implicit role of semantic elements. This is warned against by the W3C.

**WRONG:**
```html
<header role="banner">
<nav role="navigation">
<main role="main">
<footer role="contentinfo">
<aside role="complementary">
```

**CORRECT:**
```html
<!-- Semantic elements provide implicit roles — no role attribute needed -->
<header>
<nav>
<main>
<footer>
<aside>

<!-- Only use explicit roles on non-semantic elements when refactoring isn't possible -->
<div role="navigation">  <!-- Only when you can't change the div to nav -->
```

**When to use explicit `role`:** Only when you cannot change the underlying element (e.g., third-party component that renders `<div>` but acts as navigation).

---

## 6. Generic Link Text Hidden in Buttons and Components

Generic link text inside styled buttons or components that look descriptive visually but are generic in the accessibility tree.

**WRONG:**
```html
<!-- Looks like a button, but link text is "Read more" -->
<a href="/blog/ai-trends" class="btn btn-primary">
  Read more
</a>

<!-- Card where only "Learn more" is the link -->
<div class="card">
  <h3>AI Trends 2026</h3>
  <p>The latest developments in AI agent technology...</p>
  <a href="/blog/ai-trends">Learn more</a>
</div>

<!-- Icon-only link with no accessible text -->
<a href="/settings">
  <svg>...</svg>
</a>
```

**CORRECT:**
```html
<!-- Descriptive visible text -->
<a href="/blog/ai-trends" class="btn btn-primary">
  Read AI Trends 2026
</a>

<!-- Option A: Make entire card a link with descriptive heading -->
<a href="/blog/ai-trends" class="card">
  <h3>AI Trends 2026</h3>
  <p>The latest developments in AI agent technology...</p>
</a>

<!-- Option B: Use aria-label when visual design requires short text -->
<div class="card">
  <h3>AI Trends 2026</h3>
  <p>The latest developments in AI agent technology...</p>
  <a href="/blog/ai-trends" aria-label="Read AI Trends 2026">Learn more</a>
</div>

<!-- Icon link with aria-label -->
<a href="/settings" aria-label="Account settings">
  <svg aria-hidden="true">...</svg>
</a>
```

---

## 7. Decorative Images: Missing `alt` vs Empty `alt`

There's a critical difference between a missing `alt` attribute and an empty `alt=""`.

**WRONG:**
```html
<!-- Missing alt — accessibility violation, AI agents flag this -->
<img src="decorative-line.svg">

<!-- Alt text on decorative image — AI agents waste time processing irrelevant info -->
<img src="decorative-line.svg" alt="A blue horizontal line separator">

<!-- Alt describes file name instead of content -->
<img src="IMG_2847.jpg" alt="IMG_2847.jpg">
```

**CORRECT:**
```html
<!-- Empty alt for decorative images — correctly excluded from accessibility tree -->
<img src="decorative-line.svg" alt="">

<!-- Descriptive alt for content images -->
<img src="team-photo.jpg" alt="Engineering team at the 2026 company offsite">

<!-- CSS background for purely decorative images (best practice) -->
<div style="background-image: url('decorative-line.svg')"></div>
```

**Rule:** Every `<img>` MUST have an `alt` attribute. Decorative = `alt=""`. Content = descriptive text.

---

## 8. Language Attribute Pitfalls

Common mistakes with the `<html lang>` attribute.

**WRONG:**
```html
<!-- Missing entirely -->
<html>

<!-- Wrong code format -->
<html lang="english">
<html lang="EN_US">
<html lang="eng">

<!-- Language set on body instead of html -->
<html>
<body lang="en">
```

**CORRECT:**
```html
<!-- Valid BCP 47 codes -->
<html lang="en">
<html lang="en-US">
<html lang="nl-NL">
<html lang="de">
<html lang="ja">
<html lang="zh-Hans">

<!-- For multilingual content, set main language on html and override per element -->
<html lang="en">
<body>
  <p>This is English content.</p>
  <blockquote lang="fr">Ceci est en fran&ccedil;ais.</blockquote>
</body>
</html>
```

**Rule:** Use lowercase two-letter ISO 639-1 codes, optionally with region subtag (e.g., `en-US`).

---

## 9. Heading Hierarchy Skip in CMS Content

CMS editors or markdown renderers that start content with `<h3>` or `<h4>`, skipping levels from the page's `<h1>`.

**WRONG:**
```html
<!-- Page template provides h1 -->
<h1>Blog</h1>

<!-- CMS content starts at h3, skipping h2 -->
<article>
  <h3>Introduction to AI Agents</h3>  <!-- Skips h2! -->
  <p>...</p>
  <h4>What are AI agents?</h4>
  <p>...</p>
</article>
```

**CORRECT:**
```html
<!-- Page template provides h1 -->
<h1>Blog</h1>

<!-- CMS content uses sequential levels from h2 -->
<article>
  <h2>Introduction to AI Agents</h2>
  <p>...</p>
  <h3>What are AI agents?</h3>
  <p>...</p>
</article>
```

**Fix for CMS:** Configure the CMS rich text editor to start at `<h2>`, or use a post-processor to remap heading levels.

---

## 10. Multiple `<main>` Elements

Using `<main>` more than once on a page, or wrapping everything (including header/footer) in `<main>`.

**WRONG:**
```html
<body>
  <!-- Multiple mains -->
  <main>
    <nav>...</nav>
  </main>
  <main>
    <article>...</article>
  </main>

  <!-- Or: everything inside main -->
  <main>
    <header>...</header>
    <article>...</article>
    <footer>...</footer>
  </main>
</body>
```

**CORRECT:**
```html
<body>
  <header>
    <nav>...</nav>
  </header>

  <main>
    <!-- Only the primary content -->
    <article>...</article>
  </main>

  <footer>...</footer>
</body>
```

**Rule:** Exactly one `<main>` per page, containing only the primary content. Header, nav, and footer go outside `<main>`.

---

## 11. Semantic Elements Inside `<div>` Wrappers

Wrapping semantic elements in unnecessary `<div>` containers for styling, which can break implicit ARIA role mapping.

**WRONG:**
```html
<!-- div wrapper breaks header's implicit banner role -->
<div class="header-wrapper">
  <header>
    <nav>...</nav>
  </header>
</div>

<!-- div between body and main -->
<body>
  <div class="page-container">
    <main>...</main>
  </div>
</body>
```

**CORRECT:**
```html
<!-- Apply styles directly to semantic elements -->
<header class="header-wrapper">
  <nav>...</nav>
</header>

<!-- If a wrapper is truly needed, keep semantic elements as direct children of body -->
<body>
  <header>...</header>
  <main class="page-container">...</main>
  <footer>...</footer>
</body>
```

**Note:** `<header>` only has the implicit `banner` role when it's a direct child of `<body>`. Nesting it inside a `<div>` can change its semantic meaning in some assistive technologies.
