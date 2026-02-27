# Structured Data Gotchas

Common pitfalls when implementing JSON-LD structured data, with wrong and correct examples.

---

## 1. Client-side rendered JSON-LD

JSON-LD injected via JavaScript after page load may not be seen by all crawlers. Google's crawler executes JavaScript, but many AI crawlers (Perplexity, ChatGPT) do not.

### WRONG — Injected via JavaScript

```html
<script>
  const schema = { "@context": "https://schema.org", "@type": "Organization", "name": "Company" };
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(schema);
  document.head.appendChild(el);
</script>
```

### CORRECT — Static in HTML

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company",
  "url": "https://example.com"
}
</script>
```

**Rule:** Always render JSON-LD in the initial HTML response. For SPAs, use server-side rendering (SSR) or static site generation (SSG) to include JSON-LD in the HTML.

---

## 2. Missing @context

Without `@context`, the JSON-LD block is meaningless to parsers. The scanner specifically checks for schema.org in the context.

### WRONG — No @context

```json
{
  "@type": "Organization",
  "name": "Company",
  "url": "https://example.com"
}
```

### CORRECT — With @context

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company",
  "url": "https://example.com"
}
```

**Rule:** Every standalone JSON-LD block must have `"@context": "https://schema.org"`. When using `@graph`, put `@context` at the top level only.

---

## 3. http vs https for schema.org

Both `http://schema.org` and `https://schema.org` work, but `https` is preferred and what Google recommends.

### WRONG — Mixed protocols

```json
{
  "@context": "http://schema.org",
  "@type": "Organization",
  "name": "Company",
  "url": "https://example.com"
}
```

### CORRECT — Consistent https

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company",
  "url": "https://example.com"
}
```

**Rule:** Always use `https://schema.org` for the `@context`. The scanner accepts both, but `https` is the modern standard.

---

## 4. Duplicate @type in same block

Having two entities of the same type in one `@graph` block is flagged as a validation issue (checkpoint 2.6).

### WRONG — Two Organizations in one @graph

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "name": "Parent Company" },
    { "@type": "Organization", "name": "Subsidiary" }
  ]
}
```

### CORRECT — Separate blocks or use nested entities

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Parent Company",
  "url": "https://example.com",
  "subOrganization": {
    "@type": "Organization",
    "name": "Subsidiary",
    "url": "https://subsidiary.example.com"
  }
}
```

Or use two separate `<script>` blocks:

```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Organization", "name": "Parent Company", "url": "https://example.com" }
</script>
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Organization", "name": "Subsidiary", "url": "https://subsidiary.example.com" }
</script>
```

**Rule:** Avoid duplicate `@type` values within the same `@graph`. Use nested properties, separate blocks, or more specific subtypes.

---

## 5. Empty required fields

Fields that exist but have empty values (`""`, `[]`, `null`) are worse than missing them — they signal broken data.

### WRONG — Empty name

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "",
  "url": "https://example.com"
}
```

### WRONG — Empty mainEntity

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": []
}
```

### CORRECT — Populated values

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "url": "https://example.com"
}
```

**Rule:** Never include required properties with empty values. Either provide real data or omit the property entirely if it's optional. The scanner checks for empty strings, empty arrays, and null values.

---

## 6. BreadcrumbList on homepage

BreadcrumbList on a homepage is semantically meaningless — the homepage is the root, there's nothing above it.

### WRONG — Breadcrumb on homepage

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    }
  ]
}
```

### CORRECT — Breadcrumb on inner pages only

On `https://example.com/products/widget`:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://example.com/products"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Widget",
      "item": "https://example.com/products/widget"
    }
  ]
}
```

**Rule:** The scanner skips BreadcrumbList checks on homepages (paths `/`, `""`, or no path). Only add BreadcrumbList on pages with actual navigation depth.

---

## 7. @id without cross-references

Adding `@id` to entities but never referencing them from other entities gives partial credit (7/10) but not full marks.

### WRONG — @id present but never referenced

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Company"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "name": "Company Site"
    }
  ]
}
```

### CORRECT — @id with cross-reference

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Company"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "name": "Company Site",
      "publisher": { "@id": "https://example.com/#organization" }
    }
  ]
}
```

**Rule:** When you add `@id` to entities, always reference at least one `@id` from another entity (via `publisher`, `author`, `isPartOf`, `provider`, etc.). That's what creates an actual linked graph.

---

## 8. Invalid JSON

The most common silent failure. Invalid JSON means the entire block is ignored.

### WRONG — Trailing comma

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company",
  "url": "https://example.com",
}
```

### WRONG — Single quotes

```json
{
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'Company'
}
```

### WRONG — Unescaped characters in strings

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "He said "hello" to everyone"
}
```

### CORRECT — Valid JSON

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "He said \"hello\" to everyone"
}
```

**Rule:** Always validate JSON before deploying. Use `JSON.parse()` in the browser console or a JSON validator. Common issues: trailing commas, single quotes, unescaped quotes in strings, comments (JSON doesn't support comments).

---

## 9. Wrong @type casing

Schema.org types are case-sensitive. `organization` is not the same as `Organization`.

### WRONG — Lowercase type

```json
{
  "@context": "https://schema.org",
  "@type": "organization",
  "name": "Company"
}
```

### WRONG — All caps

```json
{
  "@context": "https://schema.org",
  "@type": "ORGANIZATION",
  "name": "Company"
}
```

### CORRECT — PascalCase

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company"
}
```

**Rule:** Schema.org types use PascalCase (`Organization`, `WebSite`, `FAQPage`, `SoftwareApplication`). Properties use camelCase (`name`, `sameAs`, `startDate`, `mainEntity`).

---

## 10. Placing JSON-LD inside template loops

When using server-side templates, avoid generating duplicate JSON-LD blocks for each item in a list.

### WRONG — JSON-LD per loop iteration (Django/Jinja2 example)

```html
{% for product in products %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{ product.name }}"
}
</script>
{% endfor %}
```

This creates N separate JSON-LD blocks with the same `@type`, triggering duplicate type warnings.

### CORRECT — Single block with @graph or ItemList

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {% for product in products %}
    {
      "@type": "ListItem",
      "position": {{ forloop.counter }},
      "item": {
        "@type": "Product",
        "name": "{{ product.name }}",
        "url": "{{ product.url }}"
      }
    }{% if not forloop.last %},{% endif %}
    {% endfor %}
  ]
}
</script>
```

**Rule:** For list pages, use a single `ItemList` wrapper or a single `@graph` block. Only individual detail pages should have a standalone Product/Article/etc. block.

---

## 11. Mixing JSON-LD with microdata/RDFa

Structured data formats should not conflict. If you have microdata in HTML attributes AND JSON-LD in a `<script>` block for the same entity, search engines may see duplicates.

### WRONG — Same data in both formats

```html
<div itemscope itemtype="https://schema.org/Organization">
  <span itemprop="name">Company</span>
</div>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company"
}
</script>
```

### CORRECT — One format only (prefer JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company",
  "url": "https://example.com"
}
</script>
```

**Rule:** Pick one structured data format and use it consistently. JSON-LD is recommended by Google and is the only format checked by IsAgentReady.com.
