---
name: content-semantics
description: Fixes content and semantic HTML issues — implements server-side rendering, heading hierarchy, semantic HTML elements, ARIA landmarks, image alt text, language attributes, and descriptive link texts so AI agents can navigate and understand page content via the accessibility tree. Use when asked to "fix semantic HTML", "add SSR", "fix heading hierarchy", "add alt text", "improve semantics score", "fix accessibility for AI", "add ARIA landmarks", "fix language attribute", or any semantic HTML task.
---

# Content & Semantics

Fixes Category 3 (Content & Semantics, 20% weight) issues from [IsAgentReady.com](https://isagentready.com). AI agents use the accessibility tree — not visual rendering — to parse pages. Good semantic HTML and heading hierarchy directly improve AI comprehension.

## When to Use

- IsAgentReady scan shows issues in **Content & Semantics** category
- Site has low scores on checkpoints 3.1–3.7
- User asks to fix semantic HTML, headings, SSR, alt text, ARIA, or link texts
- Building a new site and want AI agent readiness from the start

## When NOT to Use

- Issues are in other categories (use `ai-content-discovery`, `structured-data`, `agent-protocols`, or `security-trust`)
- Problem is purely visual styling (not semantic structure)
- Site already scores A+ on Content & Semantics

## Checkpoints Overview

| ID  | Checkpoint                  | Points | Priority    |
|-----|-----------------------------|--------|-------------|
| 3.1 | Server-side rendered content | 20     | Critical    |
| 3.2 | Heading hierarchy           | 20     | Critical    |
| 3.3 | Semantic HTML elements      | 20     | Important   |
| 3.4 | ARIA landmarks              | 10     | Important   |
| 3.5 | Image alt text              | 15     | Important   |
| 3.6 | Language attribute           | 5      | Nice-to-have|
| 3.7 | Descriptive link texts      | 10     | Nice-to-have|

Total: 100 points. Category weight: 20% of overall score.

---

## Checkpoint 3.1: Server-Side Rendered Content (20 pts)

**What the scanner checks:** Whether `<body>` contains >200 characters of visible text in raw HTML (no JS execution). Detects SPA shells (`<div id="root"></div>`). Checks for `<noscript>` fallback.

**Scoring:**
- 20 pts — >200 chars visible text in raw HTML
- 10 pts — Limited text but `<noscript>` fallback present
- 5 pts — Some visible text but under 200 chars
- 0 pts — Empty SPA shell or no visible text

**Why it matters:** AI agents cannot execute JavaScript. They parse raw HTML to understand page content. Without SSR, your content is invisible to most AI crawlers and assistants.

### Fix Workflow

1. **Test current state** — check what AI agents see:
   ```bash
   curl -s https://example.com | sed 's/<script[^>]*>.*<\/script>//g; s/<style[^>]*>.*<\/style>//g; s/<[^>]*>//g' | tr -s ' \n' | head -20
   ```
   If this returns minimal text, your content relies on JavaScript.

2. **Detect SPA shell** — look for empty containers:
   ```bash
   curl -s https://example.com | grep -E '<div id="(root|app|__next)"></div>'
   ```

3. **Implement SSR** — see [references/ssr-strategies.md](references/ssr-strategies.md) for framework-specific guides:

   **Next.js (App Router — default SSR):**
   ```tsx
   // app/page.tsx — Server Component by default
   export default async function Page() {
     const data = await fetch('https://api.example.com/data');
     const items = await data.json();

     return (
       <main>
         <h1>Products</h1>
         {items.map(item => (
           <article key={item.id}>
             <h2>{item.name}</h2>
             <p>{item.description}</p>
           </article>
         ))}
       </main>
     );
   }
   ```

   **Next.js (Pages Router):**
   ```tsx
   export async function getServerSideProps() {
     const data = await fetchData();
     return { props: { data } };
   }
   ```

4. **Add `<noscript>` fallback** (partial credit if full SSR isn't feasible):
   ```html
   <noscript>
     <p>This site requires JavaScript. Visit our <a href="/sitemap">sitemap</a> for a text-based overview.</p>
   </noscript>
   ```

5. **Verify** — re-run the curl test and confirm >200 chars of visible text.

**References:**
- [Rendering on the Web](https://web.dev/articles/rendering-on-the-web)
- [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

---

## Checkpoint 3.2: Heading Hierarchy (20 pts)

**What the scanner checks:** Exactly one `<h1>`, sequential heading levels (no h1→h3 skip), non-empty heading text.

**Scoring:**
- 20 pts — Single `<h1>`, no level skips, all headings have text
- 15 pts — Good hierarchy but some headings have empty text
- 10 pts — Single `<h1>` present but levels are skipped
- 5 pts — Multiple `<h1>` tags
- 0 pts — No `<h1>` found or no headings at all

**Why it matters:** AI agents use headings to build a content outline and determine topic hierarchy. A clear h1→h2→h3 structure helps AI systems extract and summarize your content accurately.

### Fix Workflow

1. **Audit current headings:**
   ```bash
   curl -s https://example.com | grep -oE '<h[1-6][^>]*>.*?</h[1-6]>' | head -30
   ```

2. **Fix the hierarchy** — ensure exactly one `<h1>` and sequential levels:
   ```html
   <h1>Page Title — One Per Page</h1>
     <h2>Main Section</h2>
       <h3>Subsection</h3>
       <h3>Subsection</h3>
     <h2>Another Section</h2>
       <h3>Subsection</h3>
         <h4>Detail</h4>
   ```

3. **Common fixes:**
   - Multiple `<h1>` tags → keep one, demote others to `<h2>`
   - `<h1>` → `<h3>` skip → add intermediate `<h2>`
   - Empty headings → add meaningful text or remove the tag
   - Logo in `<h1>` → move logo out, use text `<h1>` for page title

4. **Verify** — re-check that heading levels are sequential.

See [references/gotchas.md](references/gotchas.md) for common heading hierarchy pitfalls (component-level `<h1>`, level resets).

**References:**
- [MDN Heading Elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements)
- [W3C Using h1-h6 to identify headings](https://www.w3.org/WAI/WCAG22/Techniques/html/H42)

---

## Checkpoint 3.3: Semantic HTML Elements (20 pts)

**What the scanner checks:** Presence of 5 semantic landmark elements: `<header>`, `<nav>`, `<main>`, `<article>` or `<section>`, `<footer>`. 4 points each.

**Scoring:**
- 20 pts (pass) — All 5 elements present
- 12–16 pts (partial) — 3–4 elements present
- 0–8 pts (fail) — Fewer than 3 elements

**Why it matters:** AI agents navigate pages using the accessibility tree, not visual layout. Semantic elements like `<main>`, `<nav>`, and `<article>` provide structural meaning that AI systems rely on to parse content.

### Fix Workflow

1. **Check which elements are present:**
   ```bash
   curl -s https://example.com | grep -oE '<(header|nav|main|article|section|footer)[\s>]' | sort -u
   ```

2. **Implement the full semantic structure:**
   ```html
   <body>
     <header>
       <nav>
         <a href="/">Home</a>
         <a href="/about">About</a>
         <a href="/contact">Contact</a>
       </nav>
     </header>

     <main>
       <article>
         <h1>Page Title</h1>
         <section>
           <h2>Introduction</h2>
           <p>Content here...</p>
         </section>
         <section>
           <h2>Details</h2>
           <p>More content...</p>
         </section>
       </article>
     </main>

     <footer>
       <nav aria-label="Footer">
         <a href="/privacy">Privacy Policy</a>
         <a href="/terms">Terms of Service</a>
       </nav>
       <p>&copy; 2026 Example Inc.</p>
     </footer>
   </body>
   ```

3. **Replace `<div>` wrappers** with semantic equivalents:
   - `<div class="header">` → `<header>`
   - `<div class="nav">` → `<nav>`
   - `<div class="main">` → `<main>`
   - `<div class="footer">` → `<footer>`
   - `<div class="sidebar">` → `<aside>`

See [references/semantic-html-guide.md](references/semantic-html-guide.md) for the complete element reference and `<article>` vs `<section>` guidance.

**References:**
- [MDN Semantics in HTML](https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html)
- [W3C HTML5 Document Sections](https://www.w3.org/TR/html52/sections.html)

---

## Checkpoint 3.4: ARIA Landmarks (10 pts)

**What the scanner checks:**
- Implicit landmarks from semantic elements (`<main>` → main, `<nav>` → navigation, `<header>` → banner, `<footer>` → contentinfo, `<aside>` → complementary)
- Explicit ARIA roles (`role="navigation"`, `role="main"`, etc.)
- Additive ARIA attributes: `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, `aria-expanded`, `aria-current`, `aria-hidden`

**Scoring:**
- 10 pts — 3+ landmark regions AND at least 1 additive ARIA attribute
- 7 pts — 3+ landmark regions, no additive ARIA
- 5 pts — 1+ landmark AND 1+ additive ARIA attribute
- 3 pts — Any landmark or ARIA attribute present
- 0 pts — No landmarks or ARIA attributes found

**Why it matters:** ARIA landmarks help AI agents identify page regions (navigation, main content, footer). This is the same API used by screen readers and is increasingly used by AI browsing agents.

### Fix Workflow

1. **Use semantic HTML first** — these provide implicit landmarks without extra attributes:
   ```html
   <header>   <!-- implicit role="banner" -->
   <nav>      <!-- implicit role="navigation" -->
   <main>     <!-- implicit role="main" -->
   <footer>   <!-- implicit role="contentinfo" -->
   <aside>    <!-- implicit role="complementary" -->
   ```

2. **Add ARIA attributes for disambiguation and state:**
   ```html
   <nav aria-label="Primary">
     <a href="/" aria-current="page">Home</a>
     <a href="/about">About</a>
   </nav>

   <nav aria-label="Footer">
     <a href="/privacy">Privacy</a>
   </nav>

   <div aria-live="polite" aria-label="Search results">
     <!-- Dynamic content area -->
   </div>

   <button aria-expanded="false" aria-label="Toggle menu">Menu</button>
   ```

3. **Do NOT add redundant roles** to semantic elements:
   ```html
   <!-- WRONG — redundant, not recommended by W3C -->
   <main role="main">

   <!-- CORRECT — semantic element is sufficient -->
   <main>
   ```

4. **Verify** — check for 3+ landmark types plus at least one `aria-*` attribute.

**References:**
- [W3C Landmarks Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/)
- [MDN ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)

---

## Checkpoint 3.5: Image Alt Text (15 pts)

**What the scanner checks:** All `<img>` tags have non-empty `alt` attributes. Score = (images with alt / total images) * 15. No images on page = full score.

**Why it matters:** AI agents cannot see images. Alt text is the only way for AI systems to understand image content, context, and relevance to the surrounding text.

### Fix Workflow

1. **Find images missing alt text:**
   ```bash
   curl -s https://example.com | grep -oE '<img [^>]*>' | grep -v 'alt='
   ```

2. **Add appropriate alt text:**
   ```html
   <!-- Content images: describe what the image shows -->
   <img src="team-photo.jpg" alt="Engineering team at the 2026 company offsite">
   <img src="chart.png" alt="Revenue growth chart showing 40% increase in Q4 2025">
   <img src="product.jpg" alt="Wireless noise-cancelling headphones in matte black">

   <!-- Decorative images: use empty alt (NOT missing alt) -->
   <img src="divider.svg" alt="">
   <img src="bg-pattern.png" alt="">

   <!-- Icons with adjacent text: use empty alt to avoid repetition -->
   <img src="email-icon.svg" alt=""> <span>Email us</span>

   <!-- Logos: use the company/brand name -->
   <img src="logo.svg" alt="Acme Inc.">
   ```

3. **Alt text guidelines:**
   - Be specific and concise (under 125 characters)
   - Describe the content and function, not appearance
   - Don't start with "Image of..." or "Picture of..."
   - For charts/graphs, describe the key data point or trend
   - For decorative images, use `alt=""` (empty, not missing)

**References:**
- [WCAG Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)
- [MDN img alt attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#alt)

---

## Checkpoint 3.6: Language Attribute (5 pts)

**What the scanner checks:** `<html>` tag has a `lang` attribute with a valid BCP 47 language code.

**Scoring:**
- 5 pts — Valid BCP 47 code (e.g., `en`, `nl`, `en-US`)
- 2 pts — `lang` attribute present but invalid value
- 0 pts — No `lang` attribute

**Why it matters:** The `lang` attribute tells AI agents what language your content is in, enabling correct text processing, translation, and language-specific understanding.

### Fix Workflow

1. **Check current state:**
   ```bash
   curl -s https://example.com | grep -oE '<html[^>]*lang="[^"]*"'
   ```

2. **Add or fix the lang attribute:**
   ```html
   <!-- English -->
   <html lang="en">

   <!-- Regional variants -->
   <html lang="en-US">
   <html lang="en-GB">
   <html lang="nl-NL">
   <html lang="de-DE">
   <html lang="fr-FR">
   <html lang="ja">
   <html lang="zh-Hans">
   ```

3. **For multilingual content**, use `lang` on specific elements:
   ```html
   <html lang="en">
   <body>
     <p>This is English text.</p>
     <blockquote lang="fr">Ceci est en fran&ccedil;ais.</blockquote>
   </body>
   </html>
   ```

**References:**
- [MDN lang attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang)
- [W3C Declaring language in HTML](https://www.w3.org/International/questions/qa-html-language-declarations)

---

## Checkpoint 3.7: Descriptive Link Texts (10 pts)

**What the scanner checks:** Samples up to 50 links. Flags generic text: "click here", "read more", "learn more", "here", "link", "more", "details", "info", "more details". Score = (descriptive links / total sampled) * 10.

**Why it matters:** AI agents use link text to understand navigation and discover related content. Generic text like "click here" provides no context about where the link leads.

### Fix Workflow

1. **Find generic links:**
   ```bash
   curl -s https://example.com | grep -oiE '<a [^>]*>([^<]*)<\/a>' | grep -iE '>(click here|read more|learn more|here|link|more|details|info|more details)<'
   ```

2. **Replace with descriptive text:**
   ```html
   <!-- WRONG -->
   <a href="/pricing">Click here</a>
   <a href="/blog/ai-trends">Read more</a>
   <a href="/docs">Learn more</a>
   To sign up, <a href="/register">click here</a>.

   <!-- CORRECT -->
   <a href="/pricing">View pricing plans</a>
   <a href="/blog/ai-trends">Read our AI trends analysis</a>
   <a href="/docs">Explore the documentation</a>
   <a href="/register">Create your free account</a>.
   ```

3. **Patterns for common cases:**
   - Blog posts: "Read [article title]" instead of "Read more"
   - CTAs: describe the action — "Start free trial", "Download the report"
   - Navigation: use the destination name — "About us", "API documentation"
   - Lists: "[Item name] details" instead of "Details"

4. **For "Read more" in card layouts**, make the entire card clickable or use `aria-label`:
   ```html
   <!-- Option A: descriptive visible text -->
   <a href="/blog/ai-trends">Read AI trends analysis</a>

   <!-- Option B: aria-label when visual design requires short text -->
   <a href="/blog/ai-trends" aria-label="Read AI trends analysis">Read more</a>
   ```

**References:**
- [WCAG Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)
- [MDN Anchor element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a)

---

## Quick Wins Checklist

For the fastest score improvement, fix in this order:

1. **Add `<html lang="en">`** — 5 pts, one line (checkpoint 3.6)
2. **Add semantic elements** — wrap existing `<div>`s with `<header>`, `<nav>`, `<main>`, `<footer>` (checkpoint 3.3)
3. **Fix heading hierarchy** — ensure one `<h1>`, sequential levels (checkpoint 3.2)
4. **Add ARIA attributes** — `aria-label` on duplicate navs, `aria-current="page"` (checkpoint 3.4)
5. **Add alt text** to all images (checkpoint 3.5)
6. **Fix generic link texts** — replace "click here" and "read more" (checkpoint 3.7)
7. **Implement SSR** — largest effort but highest single-checkpoint score (checkpoint 3.1)

## Key Gotchas

Common mistakes that cause checkpoint failures:

1. **Multiple `<h1>` tags** — Components that each add their own `<h1>` break hierarchy
2. **Heading level skips** — Going from `<h1>` directly to `<h3>` without `<h2>`
3. **SPA with empty shell** — `<div id="root"></div>` scores 0 without SSR
4. **Missing alt vs empty alt** — `<img src="...">` (no alt) fails; `<img src="..." alt="">` (empty) is valid for decorative images
5. **Generic link text** — "Click here" and "Read more" provide no context for AI agents

> See [references/gotchas.md](references/gotchas.md) for detailed correct vs incorrect examples of each.

## References

- [references/semantic-html-guide.md](references/semantic-html-guide.md) — Semantic elements, ARIA mapping, heading patterns, link text patterns
- [references/ssr-strategies.md](references/ssr-strategies.md) — Framework-specific SSR implementation guides
- [references/gotchas.md](references/gotchas.md) — Common pitfalls with correct vs incorrect examples

## Instructions

1. **Identify failing checkpoints** from the IsAgentReady.com scan results
2. **Follow the fix workflow** for each failing checkpoint above
3. **Apply the code examples** — adapt HTML structure and content to the user's site
4. **Verify each fix** using the curl commands provided in each workflow
5. **Re-scan** at [isagentready.com](https://isagentready.com) to confirm improvements

If `$ARGUMENTS` is provided, interpret it as the URL to fix or the specific checkpoint to address.
