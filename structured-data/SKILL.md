---
name: structured-data
description: Fixes structured data issues — adds and validates JSON-LD markup with Schema.org types including Organization, WebSite, Product, Article, FAQPage, BreadcrumbList, and entity linking so AI search engines can understand and cite website content. Use when asked to "add JSON-LD", "fix structured data", "add schema markup", "improve structured data score", "add Organization schema", "add BreadcrumbList", "fix Schema.org", "add product markup", or any JSON-LD or Schema.org task.
---

# Structured Data

Fixes Category 2 (AI Search Signals, 20% weight) issues from [IsAgentReady.com](https://isagentready.com). This category measures how well a website communicates its content to AI search engines through machine-readable structured data.

## When to Use

- User asks to add or fix JSON-LD / structured data / schema markup
- IsAgentReady scan shows low Category 2 (AI Search Signals) score
- Specific checkpoint failures: 2.1 through 2.6
- User wants Organization, WebSite, Product, Article, FAQ, or BreadcrumbList markup
- User asks to improve visibility in AI search (Perplexity, ChatGPT, AI Overviews)

## When NOT to Use

- Microdata or RDFa issues (this skill covers JSON-LD only)
- OpenGraph or Twitter Card meta tags (those are social sharing, not structured data)
- robots.txt, sitemap, or AI crawler issues (use `ai-content-discovery` skill)
- Semantic HTML or heading hierarchy (use `content-semantics` skill)
- Security headers or HTTPS issues (use `security-trust` skill)

## How AI Search Signals Scoring Works

| ID  | Checkpoint                    | Points | Pass Criteria                                                |
|-----|-------------------------------|--------|--------------------------------------------------------------|
| 2.1 | JSON-LD present               | 20     | `<script type="application/ld+json">` with schema.org @context |
| 2.2 | Organization / WebSite schema | 15     | @type Organization or WebSite with `name` + `url`            |
| 2.3 | High-value schema types       | 20     | Content-appropriate type with required properties            |
| 2.4 | Entity linking (@id)          | 10     | Entities with @id + cross-references between them            |
| 2.5 | BreadcrumbList markup         | 10     | Valid BreadcrumbList with position, name, item per element    |
| 2.6 | Schema validation             | 10     | No duplicate @type, no missing/empty required fields         |

**Total: 85 points. Partial credit available for 2.2, 2.3, 2.4, 2.5, 2.6.**

---

## Checkpoint 2.1: JSON-LD Present (20 pts)

### What the scanner checks
Looks for `<script type="application/ld+json">` blocks where the parsed JSON contains `@context` with `schema.org`.

### Why it matters
JSON-LD is the preferred format for structured data by Google and AI search engines. It tells AI systems exactly what your page is about using a standardized vocabulary. Without it, AI systems must guess your content's meaning from unstructured HTML.

### Fix workflow

1. **Identify your page type.** Determine what your page represents: a company homepage (Organization), a product page (Product), a blog post (Article), etc.

2. **Add a JSON-LD block** in the `<head>` (preferred) or before `</body>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}
</script>
```

3. **Validate** the JSON is well-formed. Common mistakes: trailing commas, unescaped quotes, missing closing braces.

4. **Verify** with [Google Rich Results Test](https://search.google.com/test/rich-results) or [Schema.org Validator](https://validator.schema.org/).

### References
- [Schema.org Getting Started](https://schema.org/docs/gs.html)
- [Google Structured Data Guide](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [W3C JSON-LD Specification](https://www.w3.org/TR/json-ld11/)

---

## Checkpoint 2.2: Organization / WebSite Schema (15 pts)

### What the scanner checks
JSON-LD with `@type` of `Organization` or `WebSite`. Required properties: `name`, `url`. Bonus properties: `logo`, `sameAs`, `contactPoint`.

### Scoring
- Full (15 pts): Organization or WebSite with `name` + `url`
- Partial (7 pts): Type found but missing `name` or `url`
- Fail (0 pts): Neither type found

### Why it matters
Organization and WebSite schemas establish your brand identity in the knowledge graph. AI systems use these to attribute content, display rich results, and build entity relationships.

### Fix workflow

1. **Add Organization schema** (recommended for all sites):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/yourcompany",
    "https://linkedin.com/company/yourcompany",
    "https://github.com/yourcompany"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@example.com",
    "contactType": "customer service"
  }
}
</script>
```

2. **Add WebSite schema** (for sites with search functionality):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your Site Name",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

3. **Ensure `name` and `url` are present** — these are required for full credit. Empty strings don't count.

### References
- [Schema.org Organization](https://schema.org/Organization)
- [Schema.org WebSite](https://schema.org/WebSite)
- [Google Structured Data Guide](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

---

## Checkpoint 2.3: High-Value Schema Types (20 pts)

### What the scanner checks
Looks for any of 17 content-specific schema types with their required properties.

### Scoring
- Full (20 pts): At least one high-value type with all required properties
- Partial (10 pts): Type found but missing required properties
- Fail (0 pts): No high-value types found

### Why it matters
Certain schema types trigger rich results in Google and are used by AI search engines like Perplexity and ChatGPT to generate citations and structured answers. The right type depends on your content.

### Fix workflow

1. **Choose the right type** for your content:

| Content Type     | Schema Type          | Required Properties                                    |
|------------------|----------------------|--------------------------------------------------------|
| Blog/news        | Article              | `headline`                                             |
| Products         | Product              | `name`                                                 |
| SaaS/tools       | SoftwareApplication  | `name`                                                 |
| FAQ pages        | FAQPage              | `mainEntity`                                           |
| Local businesses | LocalBusiness        | `name`, `address`                                      |
| Services         | Service              | `name`                                                 |
| Events           | Event                | `name`, `startDate`                                    |
| How-to guides    | HowTo                | `name`, `step`                                         |
| Courses          | Course               | `name`, `description`                                  |
| Job listings     | JobPosting           | `title`, `description`, `datePosted`, `hiringOrganization` |
| Videos           | VideoObject          | `name`                                                 |
| Recipes          | Recipe               | `name`                                                 |
| Q&A pages        | QAPage               | `mainEntity`                                           |

2. **Add the JSON-LD** for your content type. See [references/schema-types.md](references/schema-types.md) for complete templates.

3. **Include all required properties** — partial credit (10 pts) is given if the type is present but missing required fields.

### References
- [Google Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
- [Schema.org Getting Started](https://schema.org/docs/gs.html)
- Full templates: [references/schema-types.md](references/schema-types.md)

---

## Checkpoint 2.4: Entity Linking via @id (10 pts)

### What the scanner checks
JSON-LD entities with `@id` properties, and cross-references between entities using those `@id` values.

### Scoring
- Full (10 pts): Entities with `@id` + at least one cross-reference
- Partial (7 pts): Entities with `@id` but no cross-references
- Fail (0 pts): No entities use `@id`
- Skip (0/0): No JSON-LD present at all

### Why it matters
Entity linking via `@id` creates a connected graph of your content. AI systems can follow these references to build deeper understanding of relationships between your pages, organization, and content.

### Fix workflow

1. **Add `@id` to each entity** using the URL#fragment pattern:

```json
{
  "@type": "Organization",
  "@id": "https://example.com/#organization",
  "name": "Your Company",
  "url": "https://example.com"
}
```

2. **Cross-reference entities** using `@id`:

```html
<script type="application/ld+json">
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
      "name": "Your Site",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#organization" }
    },
    {
      "@type": "Article",
      "@id": "https://example.com/blog/post/#article",
      "headline": "My Article",
      "author": { "@id": "https://example.com/#organization" },
      "isPartOf": { "@id": "https://example.com/#website" }
    }
  ]
}
</script>
```

3. **Use `@graph`** to bundle multiple entities in a single JSON-LD block. See [references/json-ld-patterns.md](references/json-ld-patterns.md) for detailed patterns.

### References
- [W3C JSON-LD Specification](https://www.w3.org/TR/json-ld11/)
- [Schema.org Getting Started](https://schema.org/docs/gs.html)
- Patterns: [references/json-ld-patterns.md](references/json-ld-patterns.md)

---

## Checkpoint 2.5: BreadcrumbList Markup (10 pts)

### What the scanner checks
`@type: BreadcrumbList` with `itemListElement` array. Each element must have `position`, `name`, and `item` (URL).

### Scoring
- Full (10 pts): Valid BreadcrumbList with all items having position + name + item
- Partial (5 pts): BreadcrumbList found but items missing required properties
- Fail (0 pts): No BreadcrumbList found
- Skip (0/0): Homepage scan (breadcrumbs not applicable)

### Why it matters
BreadcrumbList helps AI agents understand your site hierarchy and navigation structure. It enables rich breadcrumb display in search results and improves content categorization.

### Fix workflow

1. **Add BreadcrumbList** for every non-homepage page:

```html
<script type="application/ld+json">
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
      "name": "Widget Pro",
      "item": "https://example.com/products/widget-pro"
    }
  ]
}
</script>
```

2. **Ensure each item has all three properties:**
   - `position`: Integer starting at 1
   - `name`: Human-readable label
   - `item`: Full URL of that breadcrumb level

3. **Match your visible breadcrumbs** — the JSON-LD should reflect the actual breadcrumb navigation shown on the page.

### References
- [Schema.org BreadcrumbList](https://schema.org/BreadcrumbList)
- [Google Structured Data Guide](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

---

## Checkpoint 2.6: Schema Validation (10 pts)

### What the scanner checks
Validates structural correctness: no duplicate `@type` in same block, required properties present for each type, no empty required fields.

### Scoring
- Full (10 pts): No validation issues
- Partial (5 pts): 1-2 issues
- Fail (0 pts): 3+ issues
- Skip (0/0): No JSON-LD present

### Why it matters
Invalid structured data is ignored by search engines and AI systems. Validation errors mean your markup effort provides zero benefit — properly structured data is essential.

### Fix workflow

1. **Check for duplicate @type** in the same JSON-LD block:

```json
// WRONG — two Organization entities in same @graph
{
  "@graph": [
    { "@type": "Organization", "name": "Company A" },
    { "@type": "Organization", "name": "Company B" }
  ]
}
```

2. **Ensure required properties exist** for each type. See the required properties table in checkpoint 2.3.

3. **Remove empty required fields:**

```json
// WRONG — empty name
{ "@type": "Organization", "name": "", "url": "https://example.com" }

// CORRECT
{ "@type": "Organization", "name": "Your Company", "url": "https://example.com" }
```

4. **Validate with external tools:**
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema.org Validator](https://validator.schema.org/)

See [references/gotchas.md](references/gotchas.md) for common validation pitfalls.

### References
- [Schema.org Validator](https://validator.schema.org/)
- [Schema.org Getting Started](https://schema.org/docs/gs.html)
- Pitfalls: [references/gotchas.md](references/gotchas.md)

---

## Quick Wins: Maximum Score Path

For a site with no structured data, add these in order for the fastest score improvement:

1. **Organization JSON-LD** (solves 2.1 + 2.2 = 35 pts)
2. **Content-appropriate type** like Article or Product (solves 2.3 = 20 pts)
3. **Wrap in @graph with @id** and cross-references (solves 2.4 = 10 pts)
4. **Add BreadcrumbList** on non-homepage pages (solves 2.5 = 10 pts)
5. **Validate** — fix any duplicate types or empty fields (solves 2.6 = 10 pts)

**Combined @graph example** that covers checkpoints 2.1-2.4 + 2.6:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Your Company",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "name": "Your Company",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#organization" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://example.com/#app",
      "name": "Your App",
      "operatingSystem": "Web",
      "applicationCategory": "BusinessApplication",
      "author": { "@id": "https://example.com/#organization" }
    }
  ]
}
</script>
```

## Key Gotchas

Common mistakes that cause checkpoint failures:

1. **Missing @context** — JSON without `"@context": "https://schema.org"` is not recognized
2. **Trailing commas in JSON** — JSON-LD must be valid JSON; trailing commas break parsing
3. **Duplicate @type in same @graph** — Two Organization entities trigger validation warnings
4. **Empty required fields** — `"name": ""` counts as missing
5. **Wrong @type casing** — `"organization"` or `"ORGANIZATION"` won't match; use PascalCase `"Organization"`

> See [references/gotchas.md](references/gotchas.md) for detailed correct vs incorrect examples of each.

## References

- [references/schema-types.md](references/schema-types.md) — Complete JSON-LD templates for all 19 schema types
- [references/json-ld-patterns.md](references/json-ld-patterns.md) — @graph, entity linking, combining types, SearchAction
- [references/gotchas.md](references/gotchas.md) — Common pitfalls with correct vs incorrect examples

## Instructions

1. **Identify failing checkpoints** from the IsAgentReady.com scan results
2. **Follow the fix workflow** for each failing checkpoint above
3. **Apply the code examples** — adapt organization name, URLs, and content types to the user's site
4. **Validate** with [Google Rich Results Test](https://search.google.com/test/rich-results) or [Schema.org Validator](https://validator.schema.org/)
5. **Re-scan** at [isagentready.com](https://isagentready.com) to confirm improvements

If `$ARGUMENTS` is provided, interpret it as the URL to fix or the specific checkpoint to address.
