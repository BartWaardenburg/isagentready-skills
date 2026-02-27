# JSON-LD Patterns Reference

Advanced JSON-LD patterns for entity linking, @graph usage, combining multiple types, and common structural patterns.

## @graph Pattern

The `@graph` property bundles multiple entities in a single JSON-LD block. This is the preferred approach when a page describes multiple things (e.g., Organization + WebSite + Article).

### Basic @graph structure

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Your Company",
      "url": "https://example.com"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "name": "Your Company",
      "url": "https://example.com"
    }
  ]
}
```

Key points:
- `@context` goes at the top level, not inside each entity
- Each entity in the array is a separate node in the knowledge graph
- Use `@id` on each entity to enable cross-referencing

### When to use @graph vs separate blocks

**Use @graph** when entities are related and reference each other:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#org",
      "name": "Company"
    },
    {
      "@type": "WebSite",
      "publisher": { "@id": "https://example.com/#org" }
    }
  ]
}
```

**Use separate blocks** when entities are independent:
```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "BreadcrumbList", ... }
</script>
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "FAQPage", ... }
</script>
```

---

## Entity Linking with @id

Entity linking connects your JSON-LD entities into a coherent graph. AI systems follow these links to understand relationships.

### The URL#fragment pattern

Use your site URL with a hash fragment as the `@id`:

```
https://example.com/#organization
https://example.com/#website
https://example.com/#person-jane-doe
https://example.com/blog/my-post/#article
https://example.com/products/widget/#product
```

The fragment after `#` is arbitrary but should be descriptive. It doesn't need to resolve to an actual anchor on the page.

### Cross-referencing entities

Reference another entity by its `@id` using a nested object:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Acme Corp",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "name": "Acme Corp",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#organization" }
    },
    {
      "@type": "Article",
      "@id": "https://example.com/blog/ai-trends/#article",
      "headline": "AI Trends in 2026",
      "author": { "@id": "https://example.com/#organization" },
      "isPartOf": { "@id": "https://example.com/#website" },
      "publisher": { "@id": "https://example.com/#organization" }
    }
  ]
}
```

### Common cross-reference properties

| Property      | From Type   | To Type       | Meaning                          |
|---------------|-------------|---------------|----------------------------------|
| `publisher`   | Article     | Organization  | Who published this article       |
| `author`      | Article     | Person/Org    | Who wrote this article           |
| `isPartOf`    | WebPage     | WebSite       | This page belongs to this site   |
| `provider`    | Service     | Organization  | Who provides this service        |
| `organizer`   | Event       | Organization  | Who organizes this event         |
| `manufacturer`| Product     | Organization  | Who made this product            |
| `brand`       | Product     | Brand         | What brand this product is       |

---

## Nested vs Flat Entities

### Nested (inline)

The referenced entity is embedded directly:

```json
{
  "@type": "Article",
  "headline": "My Article",
  "author": {
    "@type": "Person",
    "name": "Jane Doe",
    "url": "https://example.com/jane"
  }
}
```

**Pros:** Simple, self-contained.
**Cons:** Can't be referenced by other entities, duplicates data if author appears multiple times.

### Flat (with @id)

The referenced entity is separate, linked by `@id`:

```json
{
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://example.com/#jane",
      "name": "Jane Doe",
      "url": "https://example.com/jane"
    },
    {
      "@type": "Article",
      "headline": "First Article",
      "author": { "@id": "https://example.com/#jane" }
    },
    {
      "@type": "Article",
      "headline": "Second Article",
      "author": { "@id": "https://example.com/#jane" }
    }
  ]
}
```

**Pros:** No duplication, entities form a graph, scores full marks on checkpoint 2.4.
**Cons:** Slightly more verbose for single-reference cases.

**Recommendation:** Use flat @id linking when an entity is referenced more than once or when you want to score checkpoint 2.4.

---

## Combining Types on One Page

### Homepage: Organization + WebSite

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Acme Corp",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "sameAs": [
        "https://twitter.com/acmecorp",
        "https://linkedin.com/company/acmecorp"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "name": "Acme Corp",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://example.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

### Blog post page: Organization + WebSite + Article + BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Acme Corp",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "name": "Acme Corp",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#organization" }
    },
    {
      "@type": "Article",
      "@id": "https://example.com/blog/ai-trends/#article",
      "headline": "AI Trends in 2026",
      "description": "Exploring the latest developments in AI",
      "datePublished": "2026-02-15T10:00:00+00:00",
      "author": { "@id": "https://example.com/#organization" },
      "publisher": { "@id": "https://example.com/#organization" },
      "isPartOf": { "@id": "https://example.com/#website" },
      "image": "https://example.com/blog/ai-trends/hero.jpg"
    },
    {
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
          "name": "Blog",
          "item": "https://example.com/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "AI Trends in 2026",
          "item": "https://example.com/blog/ai-trends"
        }
      ]
    }
  ]
}
```

### Product page: Organization + Product + BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Acme Corp",
      "url": "https://example.com"
    },
    {
      "@type": "Product",
      "@id": "https://example.com/products/widget-pro/#product",
      "name": "Widget Pro",
      "description": "Professional-grade widget",
      "image": "https://example.com/products/widget-pro.jpg",
      "brand": { "@id": "https://example.com/#organization" },
      "offers": {
        "@type": "Offer",
        "price": "99.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    },
    {
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
          "name": "Widget Pro",
          "item": "https://example.com/products/widget-pro"
        }
      ]
    }
  ]
}
```

### SaaS homepage: Organization + WebSite + SoftwareApplication

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "SaaS Company",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "sameAs": [
        "https://twitter.com/saascompany",
        "https://github.com/saascompany"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "name": "SaaS Company",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#organization" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://example.com/#app",
      "name": "SaaS Product",
      "operatingSystem": "Web",
      "applicationCategory": "BusinessApplication",
      "description": "Automate your workflow",
      "author": { "@id": "https://example.com/#organization" },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "0",
        "highPrice": "99",
        "priceCurrency": "USD",
        "offerCount": "3"
      }
    }
  ]
}
```

---

## SearchAction Pattern

Add to a WebSite entity to enable sitelinks search in Google:

```json
{
  "@type": "WebSite",
  "name": "Your Site",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

The `{search_term_string}` placeholder is replaced by Google with the user's query. The `query-input` property tells search engines this is a required parameter.

Only add SearchAction if your site actually has a search page at the specified URL.

---

## sameAs Pattern

Use `sameAs` to link your Organization to social profiles and authoritative sources:

```json
{
  "@type": "Organization",
  "name": "Your Company",
  "sameAs": [
    "https://twitter.com/yourcompany",
    "https://linkedin.com/company/yourcompany",
    "https://github.com/yourcompany",
    "https://www.crunchbase.com/organization/yourcompany",
    "https://en.wikipedia.org/wiki/Your_Company"
  ]
}
```

`sameAs` helps AI systems confirm your identity across platforms and build a stronger knowledge graph entry. Include all official social media profiles, Wikipedia page (if you have one), and Crunchbase/Wikidata entries.

---

## Multi-language Pattern

For sites with multiple languages, use the language-specific `@context`:

```json
{
  "@context": ["https://schema.org", { "@language": "nl" }],
  "@type": "Organization",
  "name": "Uw Bedrijf",
  "url": "https://example.nl",
  "description": "Een beschrijving van uw bedrijf"
}
```

Or specify language per property when mixing languages:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": { "@value": "Mijn Artikel", "@language": "nl" },
  "description": { "@value": "My Article", "@language": "en" }
}
```
