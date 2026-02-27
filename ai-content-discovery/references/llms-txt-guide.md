# llms.txt — Specification and Examples

## What is llms.txt?

llms.txt is a proposed standard (by [Jeremy Howard](https://www.answer.ai/posts/2024-09-03-llmstxt.html)) that provides LLMs with a structured, markdown-formatted overview of a website. While robots.txt tells crawlers what they *can* access, llms.txt tells LLMs what they *should* read to understand your site.

**Specification:** [llmstxt.org](https://llmstxt.org/)

## File Requirements

### Location
- Primary: `https://example.com/llms.txt`
- Companion (optional): `https://example.com/llms-full.txt`

### Content-Type
- Must be `text/plain` or `text/markdown`
- If served as `text/html`, the scanner will fail this checkpoint

### Validation Rules (IsAgentReady Scanner)

The scanner checks three things:
1. **Content-Type** — `text/plain` or `text/markdown`
2. **Starts with heading** — First non-empty line must begin with `#`
3. **Contains URLs** — At least one `http://` or `https://` URL in the body

All three must pass for the checkpoint to score.

## File Structure

### llms.txt (Summary)

```markdown
# Company or Site Name

> Brief description of what this site/company does.

## Section Name
- [Link Title](https://example.com/path)
- [Another Link](https://example.com/other-path)

## Another Section
- [More Links](https://example.com/more)
```

### Required Elements

| Element     | Description                                      | Example                     |
|-------------|--------------------------------------------------|-----------------------------|
| `# Heading` | Site/company name as H1                          | `# Acme Corp`              |
| `> Quote`   | Brief description (optional but recommended)     | `> We build developer tools`|
| `## Section`| Group links by topic                             | `## Documentation`          |
| `- [Link]`  | Markdown links to key pages                      | `- [API Docs](https://...)` |

### llms-full.txt (Expanded — Optional)

The companion file contains the same structure but with inline content instead of (or in addition to) links. This gives LLMs the actual content without needing to fetch each URL.

```markdown
# Company Name

> Detailed description of the company and its products.

## Getting Started

Here is the full getting started guide content, written inline...

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
Run the following command:
...

## API Reference

### Authentication
All API requests require a Bearer token...
```

## Examples by Site Type

### SaaS Product

```markdown
# Acme Analytics

> Acme Analytics is a privacy-first web analytics platform for modern teams.

## Product
- [Features](https://acme.com/features)
- [Pricing](https://acme.com/pricing)
- [Integrations](https://acme.com/integrations)

## Documentation
- [Getting Started](https://docs.acme.com/getting-started)
- [API Reference](https://docs.acme.com/api)
- [SDKs & Libraries](https://docs.acme.com/sdks)
- [Webhooks](https://docs.acme.com/webhooks)

## Resources
- [Blog](https://acme.com/blog)
- [Changelog](https://acme.com/changelog)
- [Status Page](https://status.acme.com)

## Legal
- [Privacy Policy](https://acme.com/privacy)
- [Terms of Service](https://acme.com/terms)
```

### Documentation Site

```markdown
# FastDB Documentation

> FastDB is an open-source, high-performance embedded database.

## Getting Started
- [Installation](https://fastdb.dev/docs/install)
- [Quick Start](https://fastdb.dev/docs/quickstart)
- [Configuration](https://fastdb.dev/docs/config)

## Core Concepts
- [Data Model](https://fastdb.dev/docs/data-model)
- [Queries](https://fastdb.dev/docs/queries)
- [Transactions](https://fastdb.dev/docs/transactions)
- [Indexing](https://fastdb.dev/docs/indexing)

## API Reference
- [Client API](https://fastdb.dev/api/client)
- [Server API](https://fastdb.dev/api/server)
- [REST API](https://fastdb.dev/api/rest)

## Community
- [GitHub](https://github.com/fastdb/fastdb)
- [Discord](https://discord.gg/fastdb)
- [Contributing Guide](https://fastdb.dev/docs/contributing)
```

### E-Commerce Site

```markdown
# Green Goods

> Green Goods sells sustainable, eco-friendly household products.

## Shop
- [All Products](https://greengoods.com/products)
- [Kitchen](https://greengoods.com/products/kitchen)
- [Bathroom](https://greengoods.com/products/bathroom)
- [Cleaning](https://greengoods.com/products/cleaning)

## Information
- [About Us](https://greengoods.com/about)
- [Our Mission](https://greengoods.com/mission)
- [Sustainability](https://greengoods.com/sustainability)

## Customer Support
- [FAQ](https://greengoods.com/faq)
- [Shipping & Returns](https://greengoods.com/shipping)
- [Contact](https://greengoods.com/contact)

## Legal
- [Privacy Policy](https://greengoods.com/privacy)
- [Terms & Conditions](https://greengoods.com/terms)
```

### Blog / Content Site

```markdown
# Tech Weekly

> Tech Weekly covers the latest in software engineering, AI, and developer tools.

## Popular Articles
- [Understanding LLM Agents](https://techweekly.com/llm-agents)
- [The State of WebAssembly in 2025](https://techweekly.com/wasm-2025)
- [Building with AI APIs](https://techweekly.com/ai-apis-guide)

## Categories
- [AI & Machine Learning](https://techweekly.com/category/ai)
- [Web Development](https://techweekly.com/category/web)
- [DevOps](https://techweekly.com/category/devops)
- [Open Source](https://techweekly.com/category/oss)

## About
- [About Tech Weekly](https://techweekly.com/about)
- [Editorial Guidelines](https://techweekly.com/guidelines)
- [RSS Feed](https://techweekly.com/feed.xml)
```

### Agency / Portfolio

```markdown
# Studio Nine

> Studio Nine is a digital design agency specializing in brand identity and web experiences.

## Work
- [Portfolio](https://studionine.com/work)
- [Case Studies](https://studionine.com/case-studies)

## Services
- [Brand Identity](https://studionine.com/services/branding)
- [Web Design](https://studionine.com/services/web-design)
- [UX Strategy](https://studionine.com/services/ux)

## Company
- [About](https://studionine.com/about)
- [Team](https://studionine.com/team)
- [Contact](https://studionine.com/contact)
- [Blog](https://studionine.com/blog)
```

## Best Practices

### Content Selection

Include links to pages that:
- Describe what your company/product does
- Contain your most important documentation
- Are frequently referenced by users asking about your product
- Provide pricing, features, or comparison information

Exclude:
- Login/signup pages
- User dashboards (require authentication)
- Pages with mostly dynamic/personalized content
- Legal pages (unless particularly relevant)

### Ordering

- Put the most important sections first
- Within sections, order by relevance/popularity
- Keep to 10-30 links total — this is a curated overview, not a sitemap

### Updates

- Update llms.txt when you add major new pages or sections
- Keep URLs current — broken links reduce the file's usefulness
- Version the file with `lastmod` comments if helpful:
  ```markdown
  # Acme Corp
  <!-- Last updated: 2025-01-15 -->
  ```

## Server Configuration

### Nginx

```nginx
location = /llms.txt {
  root /var/www/html;
  default_type text/plain;
}

location = /llms-full.txt {
  root /var/www/html;
  default_type text/plain;
}
```

### Apache

```apache
<Files "llms.txt">
  ForceType text/plain
</Files>
<Files "llms-full.txt">
  ForceType text/plain
</Files>
```

### Caddy

```caddyfile
handle /llms.txt {
  header Content-Type text/plain
  file_server
}
handle /llms-full.txt {
  header Content-Type text/plain
  file_server
}
```

### Dynamic Generation (Express Example)

```javascript
app.get('/llms.txt', (req, res) => {
  res.type('text/plain');
  res.send(`# My App

> My App helps developers build faster.

## Docs
- [Getting Started](https://myapp.com/docs/start)
- [API Reference](https://myapp.com/docs/api)

## Product
- [Features](https://myapp.com/features)
- [Pricing](https://myapp.com/pricing)
`);
});
```

## Testing

```bash
# Check HTTP status and Content-Type
curl -sI https://example.com/llms.txt

# View contents and verify structure
curl -s https://example.com/llms.txt

# Verify it starts with a # heading
curl -s https://example.com/llms.txt | head -1

# Verify it contains URLs
curl -s https://example.com/llms.txt | grep -c 'https://'

# Check companion file
curl -sI https://example.com/llms-full.txt
```

## External References

- [llmstxt.org — Official specification](https://llmstxt.org/)
- [Jeremy Howard — llms.txt proposal](https://www.answer.ai/posts/2024-09-03-llmstxt.html)
- [llmstxt.org directory — Sites using llms.txt](https://llmstxt.org/directory.html)
