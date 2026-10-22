# WebMCP Implementation Guide

WebMCP lets a web page expose its functions to AI agents as tools. This guide covers the two current mechanisms: the declarative API (HTML attributes) and the imperative API (JavaScript). Scanner results for WebMCP are experimental evidence. They do not change the headline score.

## Overview

| Mechanism | How it works | Scanner status |
|---|---|---|
| Declarative API | `toolname` and `tooldescription` on a form or field | Current, counts for 4.1 |
| Imperative API | `document.modelContext.registerTool()` | Current, counts for 4.1 |
| Legacy hyphenated attributes | `tool-name`, `tool-description` | Partial, informational |
| Legacy `navigator.modelContext`, `provideContext`, `toolcall` | Old drafts | Partial, informational |

No spec defines a WebMCP manifest file or a page-level `<script id="webmcp">` manifest. The scanner ignores both. Do not create them.

---

## Declarative API

### Attribute reference

| Attribute | Element(s) | Purpose |
|---|---|---|
| `toolname` | `form`, `input`, `select`, `textarea` | Tool identifier in snake_case |
| `tooldescription` | `form`, `input`, `select`, `textarea` | What the tool does, 10 or more characters |
| `toolparamdescription` | `input`, `select`, `textarea` | What one parameter means |
| `toolautosubmit` | `form` | The agent can submit without a user click. Use it only for search and filter forms. |

### Rules

1. Put `toolname` and `tooldescription` on the same element. One attribute alone does not count.
2. Use snake_case names such as `search_products`.
3. Give each field a `name`, a `<label>` and a `toolparamdescription`. Checkpoint 4.7 checks these.
4. Do not put secrets in any attribute. Checkpoint 5.10 checks this.
5. Do not use `toolautosubmit` on login, payment, delete or send forms. Checkpoint 5.11 checks this.

### Search form

```html
<form action="/search" method="get" toolname="search_products"
      tooldescription="Search the product catalog by keyword, category or maximum price" toolautosubmit>
  <label for="q">Search</label>
  <input id="q" name="q" type="search" toolparamdescription="Search keywords or product name">

  <label for="category">Category</label>
  <select id="category" name="category" toolparamdescription="Product category, for example books or electronics">
    <option value="">All categories</option>
    <option value="books">Books</option>
    <option value="electronics">Electronics</option>
  </select>

  <label for="max_price">Maximum price</label>
  <input id="max_price" name="max_price" type="number" toolparamdescription="Maximum price in USD">
  <button type="submit">Search</button>
</form>
```

### Booking form (no auto-submit)

```html
<form action="/bookings" method="post" toolname="book_appointment"
      tooldescription="Book a consultation. Needs a date, a time slot and an email address.">
  <label for="date">Date</label>
  <input id="date" name="date" type="date" toolparamdescription="Appointment date (YYYY-MM-DD)">

  <label for="slot">Time slot</label>
  <select id="slot" name="slot" toolparamdescription="Time slot: morning or afternoon">
    <option value="morning">Morning</option>
    <option value="afternoon">Afternoon</option>
  </select>

  <label for="email">Email address</label>
  <input id="email" name="email" type="email" autocomplete="email" toolparamdescription="Email address for the confirmation">
  <button type="submit">Book</button>
</form>
```

---

## Imperative API

Use the imperative API when a tool does not map to one HTML form, for example a tool that reads application state.

```html
<script>
  document.modelContext?.registerTool({
    name: "get_cart",
    description: "Return the items and the total of the current shopping cart",
    annotations: { readOnlyHint: true },
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      const cart = await fetch("/api/cart", { headers: { accept: "application/json" } }).then((r) => r.json());
      return { content: [{ type: "text", text: JSON.stringify(cart) }] };
    },
  });
</script>
```

Rules:

- Use `document.modelContext`. Feature-detect it with optional chaining.
- Give each tool a valid `name`, a non-empty `description` and an `execute` callback.
- When you give an `inputSchema`, make it a JSON Schema object.
- Add `annotations.readOnlyHint: true` to tools that do not change data.
- The scanner reads the inline scripts and up to five same-origin scripts. A script URL that contains `webmcp` or `modelcontext` is read first.

---

## Coverage (checkpoint 4.9)

The scanner counts visible forms, search inputs, action buttons and filter controls. Content under `hidden`, `inert`, `template`, `script`, `style` or `noscript` does not count. Annotate the search, filter and main action forms first. Aim for 50% or more coverage.

---

## References

- [WebMCP specification draft](https://webmachinelearning.github.io/webmcp/): the W3C Web Machine Learning community draft
- [Chrome WebMCP early preview](https://developer.chrome.com/blog/webmcp-epp): the attributes and the API that Chrome documents
