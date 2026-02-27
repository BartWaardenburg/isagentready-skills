# WebMCP Implementation Guide

Complete reference for implementing WebMCP — the W3C proposal for exposing website functionality to AI agents.

## Overview

WebMCP provides three complementary mechanisms for AI agent interaction:

| Mechanism        | How it works                                     | Scanner score |
|------------------|--------------------------------------------------|---------------|
| Declarative API  | HTML attributes on forms (`tool-name`, etc.)     | 25 pts (4.1)  |
| Page manifest    | `<script type="application/json" id="webmcp">`   | 15 pts (4.1)  |
| Imperative API   | `navigator.modelContext` / `toolcall` events      | 10 pts (4.1)  |
| Well-known       | `/.well-known/webmcp.json`                        | 10 pts (4.2)  |

The declarative API scores highest because it's the most accessible — agents can discover tools by parsing HTML without executing JavaScript.

---

## Declarative API (25 pts)

### Attribute reference

| Attribute                | Element(s)                     | Purpose                              |
|--------------------------|--------------------------------|--------------------------------------|
| `tool-name`              | `form`, `input`, `select`, `textarea` | Unique tool identifier         |
| `tool-description`       | `form`, `input`, `select`, `textarea` | Human-readable tool description |
| `tool-param-description` | `input`, `select`, `textarea`  | Parameter-level description (bonus)  |

**Both hyphenated and non-hyphenated forms are accepted:** `tool-name` / `toolname`, `tool-description` / `tooldescription`, `tool-param-description` / `toolparamdescription`.

### Rules

1. **Both `tool-name` AND `tool-description` are required** on the same element. Having only one attribute scores 0.
2. Place attributes on the `<form>` element for form-level tool declaration.
3. `tool-param-description` goes on individual `<input>`, `<select>`, or `<textarea>` elements.
4. `tool-name` should be a kebab-case identifier (e.g., `search-products`, not `Search Products`).
5. `tool-description` should be a clear, concise sentence describing what the tool does.

### Examples

#### Search form

```html
<form action="/search" method="GET"
      tool-name="search-products"
      tool-description="Search the product catalog by keyword, category, or price range">
  <input type="text" name="q"
         placeholder="Search products..."
         tool-param-description="Search keywords or product name">
  <select name="sort"
          tool-param-description="Sort order: relevance, price-low, price-high, newest">
    <option value="relevance">Relevance</option>
    <option value="price-low">Price: Low to High</option>
    <option value="price-high">Price: High to Low</option>
    <option value="newest">Newest First</option>
  </select>
  <input type="number" name="max_price"
         tool-param-description="Maximum price filter in USD">
  <button type="submit">Search</button>
</form>
```

#### Booking form

```html
<form action="/bookings" method="POST"
      tool-name="book-appointment"
      tool-description="Book an appointment for a consultation. Requires date, time slot, and contact info.">
  <input type="date" name="date"
         tool-param-description="Preferred appointment date (YYYY-MM-DD)">
  <select name="time_slot"
          tool-param-description="Available time slot (morning, afternoon, evening)">
    <option value="morning">Morning (9:00-12:00)</option>
    <option value="afternoon">Afternoon (13:00-17:00)</option>
    <option value="evening">Evening (18:00-20:00)</option>
  </select>
  <input type="text" name="name"
         tool-param-description="Full name for the booking">
  <input type="email" name="email"
         tool-param-description="Email address for confirmation">
  <textarea name="notes"
            tool-param-description="Optional notes or special requests"></textarea>
  <button type="submit">Book Now</button>
</form>
```

#### E-commerce add-to-cart

```html
<form action="/cart/add" method="POST"
      tool-name="add-to-cart"
      tool-description="Add a product to the shopping cart with specified quantity and options">
  <input type="hidden" name="product_id" value="SKU-12345"
         tool-param-description="Product SKU identifier">
  <input type="number" name="quantity" value="1" min="1" max="99"
         tool-param-description="Number of items to add (1-99)">
  <select name="size"
          tool-param-description="Size selection: S, M, L, XL">
    <option value="S">Small</option>
    <option value="M">Medium</option>
    <option value="L">Large</option>
    <option value="XL">Extra Large</option>
  </select>
  <button type="submit">Add to Cart</button>
</form>
```

#### Newsletter signup

```html
<form action="/newsletter/subscribe" method="POST"
      tool-name="subscribe-newsletter"
      tool-description="Subscribe to the email newsletter">
  <input type="email" name="email"
         tool-param-description="Email address to subscribe">
  <button type="submit">Subscribe</button>
</form>
```

---

## Page Manifest (15 pts partial for 4.1)

A page-level JSON manifest provides structured metadata about the tools available on the current page. This is detected as a partial signal for checkpoint 4.1.

### Format

```html
<script type="application/json" id="webmcp">
{
  "tools": [
    {
      "name": "search-products",
      "description": "Search the product catalog by keyword",
      "parameters": [
        {
          "name": "q",
          "type": "string",
          "description": "Search keywords",
          "required": true
        },
        {
          "name": "category",
          "type": "string",
          "description": "Category filter",
          "required": false,
          "enum": ["electronics", "books", "clothing"]
        }
      ]
    },
    {
      "name": "add-to-cart",
      "description": "Add a product to the shopping cart",
      "parameters": [
        {
          "name": "product_id",
          "type": "string",
          "description": "Product SKU",
          "required": true
        },
        {
          "name": "quantity",
          "type": "integer",
          "description": "Number of items",
          "required": false
        }
      ]
    }
  ]
}
</script>
```

### Requirements

- `<script>` tag must have `type="application/json"` AND `id="webmcp"` (order doesn't matter)
- Content must be valid JSON
- Place in `<head>` or `<body>` — both work

### When to use page manifest vs declarative

| Use case                              | Approach            |
|---------------------------------------|---------------------|
| Standard HTML forms                   | Declarative attrs   |
| JavaScript-driven interactions        | Page manifest       |
| Both static and dynamic tools on page | Both (complement)   |
| Want maximum score                    | Declarative attrs   |

---

## Imperative API (10 pts partial for 4.1)

The imperative API uses JavaScript to register tools dynamically. Detected as a partial signal.

### navigator.modelContext

```html
<script>
  if (navigator.modelContext) {
    navigator.modelContext.provideContext({
      tools: [
        {
          name: "search-products",
          description: "Search the product catalog",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search keywords" },
              limit: { type: "integer", description: "Max results" }
            },
            required: ["query"]
          }
        }
      ]
    });
  }
</script>
```

### toolcall event listener

```html
<script>
  document.addEventListener('toolcall', (event) => {
    const { name, parameters } = event.detail;

    switch (name) {
      case 'search-products':
        performSearch(parameters.query, parameters.limit);
        break;
      case 'add-to-cart':
        addToCart(parameters.product_id, parameters.quantity);
        break;
    }
  });
</script>
```

### Combining imperative with declarative

For maximum score, use declarative attributes AND the imperative API:

```html
<!-- Declarative: agent sees the tool via HTML -->
<form tool-name="search-products"
      tool-description="Search products"
      id="search-form">
  <input type="text" name="q" tool-param-description="Search query">
  <button type="submit">Search</button>
</form>

<!-- Imperative: handles tool calls programmatically -->
<script>
  document.addEventListener('toolcall', (event) => {
    if (event.detail.name === 'search-products') {
      const form = document.getElementById('search-form');
      form.querySelector('[name="q"]').value = event.detail.parameters.q;
      form.submit();
    }
  });
</script>
```

---

## Well-Known Manifest (10 pts — checkpoint 4.2)

The well-known manifest enables **pre-navigation discovery** — agents can learn your tools without loading any page.

### Path

Serve at `/.well-known/webmcp` or `/.well-known/webmcp.json` (scanner checks both).

### Full schema

```json
{
  "spec": "webmcp/0.1",
  "tools": [
    {
      "name": "search-products",
      "description": "Search the product catalog by keyword, category, or price",
      "url": "/search",
      "method": "GET",
      "parameters": [
        {
          "name": "q",
          "type": "string",
          "description": "Search query",
          "required": true
        },
        {
          "name": "category",
          "type": "string",
          "description": "Product category",
          "required": false,
          "enum": ["electronics", "books", "clothing", "home"]
        },
        {
          "name": "max_price",
          "type": "number",
          "description": "Maximum price in USD",
          "required": false
        }
      ]
    },
    {
      "name": "get-product-details",
      "description": "Get detailed product information including price, availability, and reviews",
      "url": "/api/products/{id}",
      "method": "GET",
      "parameters": [
        {
          "name": "id",
          "type": "string",
          "description": "Product ID or SKU",
          "required": true
        }
      ]
    },
    {
      "name": "subscribe-newsletter",
      "description": "Subscribe an email address to the newsletter",
      "url": "/newsletter/subscribe",
      "method": "POST",
      "parameters": [
        {
          "name": "email",
          "type": "string",
          "description": "Email address",
          "required": true
        }
      ]
    }
  ]
}
```

### Server configuration

**Nginx:**
```nginx
location /.well-known/webmcp.json {
    alias /var/www/html/.well-known/webmcp.json;
    default_type application/json;
    add_header Access-Control-Allow-Origin "*";
}
```

**Apache (.htaccess):**
```apache
<Files "webmcp.json">
    ForceType application/json
    Header set Access-Control-Allow-Origin "*"
</Files>
```

**Express/Node:**
```javascript
const manifest = require('./webmcp.json');
app.get('/.well-known/webmcp.json', (req, res) => {
  res.json(manifest);
});
```

**Next.js (App Router):**
```typescript
// app/.well-known/webmcp.json/route.ts
import manifest from '@/webmcp.json';

export async function GET() {
  return Response.json(manifest);
}
```

---

## References

- [WebMCP W3C Proposal](https://webmachinelearning.github.io/webmcp/) — Official specification
- [WebMCP GitHub](https://github.com/nicolo-ribaudo/webmcp) — Source and discussion
- [W3C Web Machine Learning](https://webmachinelearning.github.io/) — Parent working group
