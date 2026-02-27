---
name: agent-protocols
description: Implements AI agent interaction protocols — adds WebMCP declarative tool annotations, WebMCP manifests, Google A2A Agent Cards, MCP discovery documents, OpenAPI specifications, and agents.json so AI agents can directly interact with website functionality. Use when asked to "add WebMCP", "implement A2A", "create agent card", "add MCP discovery", "create OpenAPI spec", "add agents.json", "improve agent protocols score", "make site agent-interactive", or any WebMCP, A2A, MCP, or OpenAPI task.
---

# Agent Protocols

Fixes Category 4 (Agent Protocols, 15% weight) issues from [IsAgentReady.com](https://isagentready.com). This category checks whether AI agents can discover and use your website's functionality directly through standardized protocols.

## When to Use

- Site has forms or interactive features that AI agents should use
- Building an API that AI agents should discover and call
- Running AI agent services that need to advertise capabilities
- IsAgentReady.com scanner reports low Agent Protocols score
- Asked to "add WebMCP", "implement A2A", "create agent card", "add MCP discovery", "make site agent-ready"

## When NOT to Use

- Site is purely static content with no interactive features or APIs
- Implementing security headers or CSP → use `security-trust` skill
- Adding structured data / Schema.org → use `structured-data` skill
- Improving semantic HTML or SSR → use `content-semantics` skill
- Adding robots.txt, sitemap, llms.txt → use `ai-content-discovery` skill

## Checkpoints Overview

| ID  | Checkpoint              | Points | What passes                                                     |
|-----|-------------------------|--------|-----------------------------------------------------------------|
| 4.1 | WebMCP Declarative API  | 25     | Forms with `tool-name` + `tool-description` attributes          |
| 4.2 | WebMCP manifest         | 10     | Valid JSON at `/.well-known/webmcp` or `/.well-known/webmcp.json` |
| 4.3 | A2A Agent Card          | 25     | `/.well-known/agent.json` with name, description, url, capabilities |
| 4.4 | MCP Discovery           | 10     | Non-empty JSON object at `/.well-known/mcp.json`                |
| 4.5 | OpenAPI / API docs      | 20     | OpenAPI 3.x at standard paths (JSON or YAML)                   |
| 4.6 | agents.json             | 10     | Valid non-empty JSON at `/.well-known/agents.json` or `/agents.json` |

**Total: 100 points**

---

## Checkpoint 4.1: WebMCP Declarative API (25 pts)

> WebMCP is the W3C proposal for exposing website functionality directly to AI agents. Declarative tool annotations on forms let agents perform actions (search, purchase, book) without screen scraping.

**What the scanner checks:** HTML forms/inputs with both `tool-name` AND `tool-description` attributes. Also detects page manifest and imperative API (partial credit).

**Scoring:** Declarative attributes = 25 pts | Page manifest only = 15 pts | Imperative API only = 10 pts | None = 0

### Fix workflow

**Step 1: Identify interactive forms on your site**

Find forms that perform useful actions: search, contact, booking, purchase, filtering, login.

**Step 2: Add WebMCP declarative attributes to each form**

```html
<!-- Search form -->
<form action="/search" method="GET"
      tool-name="search-products"
      tool-description="Search the product catalog by keyword, category, or price range">
  <input type="text" name="query"
         tool-param-description="Search keywords">
  <select name="category"
          tool-param-description="Product category filter">
    <option value="">All categories</option>
    <option value="electronics">Electronics</option>
    <option value="books">Books</option>
  </select>
  <button type="submit">Search</button>
</form>
```

```html
<!-- Contact form -->
<form action="/contact" method="POST"
      tool-name="send-message"
      tool-description="Send a message to customer support">
  <input type="text" name="name"
         tool-param-description="Full name of the sender">
  <input type="email" name="email"
         tool-param-description="Email address for replies">
  <textarea name="message"
            tool-param-description="Message content"></textarea>
  <button type="submit">Send</button>
</form>
```

**Step 3 (optional): Add a page-level manifest for richer metadata**

```html
<script type="application/json" id="webmcp">
{
  "tools": [
    {
      "name": "search-products",
      "description": "Search the product catalog",
      "parameters": [
        {"name": "query", "type": "string", "required": true},
        {"name": "category", "type": "string", "required": false}
      ]
    }
  ]
}
</script>
```

**Key rules:**
- MUST have BOTH `tool-name` AND `tool-description` on the form — one alone won't score
- Both hyphenated (`tool-name`) and non-hyphenated (`toolname`) forms are accepted
- `tool-param-description` on inputs is optional but recommended for richer context
- Works on `<form>`, `<input>`, `<select>`, and `<textarea>` elements

> See [references/webmcp-guide.md](references/webmcp-guide.md) for imperative API, page manifests, and advanced patterns.

---

## Checkpoint 4.2: WebMCP Manifest (10 pts)

> A WebMCP manifest enables pre-navigation discovery — AI agents can learn what tools your site offers before loading any page.

**What the scanner checks:** Valid JSON at `/.well-known/webmcp` or `/.well-known/webmcp.json`.

### Fix workflow

**Step 1: Create the manifest file**

```json
{
  "spec": "webmcp/0.1",
  "tools": [
    {
      "name": "search-products",
      "description": "Search the product catalog by keyword",
      "url": "/search",
      "method": "GET",
      "parameters": [
        {"name": "q", "type": "string", "description": "Search query", "required": true}
      ]
    },
    {
      "name": "get-product",
      "description": "Get product details by ID",
      "url": "/api/products/{id}",
      "method": "GET",
      "parameters": [
        {"name": "id", "type": "string", "description": "Product ID", "required": true}
      ]
    }
  ]
}
```

**Step 2: Serve at the well-known path**

The file must be accessible at `/.well-known/webmcp` or `/.well-known/webmcp.json` and return `Content-Type: application/json`.

- **Static sites (Nginx/Apache):** Place file in `.well-known/` directory
- **Node/Express:** `app.get('/.well-known/webmcp.json', (req, res) => res.json(manifest))`
- **Rails/Django/Phoenix:** Add a route that returns the JSON
- **Serverless:** Add a function at the path

**Bonus:** Include a `"spec"` field (e.g., `"webmcp/0.1"`) for version identification.

> See [references/webmcp-guide.md](references/webmcp-guide.md) for manifest schema details.

---

## Checkpoint 4.3: A2A Agent Card (25 pts)

> Google's Agent-to-Agent (A2A) protocol enables autonomous agent-to-agent communication. An Agent Card advertises your agent's capabilities to other AI systems.

**What the scanner checks:** `/.well-known/agent.json` with all 4 required fields: `name`, `description`, `url`, `capabilities`.

**Scoring:** All 4 fields = 25 pts | 2-3 fields = 15 pts | <2 fields = 0 pts

### Fix workflow

**Step 1: Create the Agent Card**

```json
{
  "name": "Acme Support Agent",
  "description": "AI assistant for customer support, order tracking, and product recommendations",
  "url": "https://example.com/agent",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": false
  },
  "skills": [
    {
      "id": "order-tracking",
      "name": "Order Tracking",
      "description": "Track order status and delivery updates"
    },
    {
      "id": "product-search",
      "name": "Product Search",
      "description": "Search and recommend products"
    }
  ],
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain", "application/json"]
}
```

**Step 2: Serve at `/.well-known/agent.json`**

Must return valid JSON with `Content-Type: application/json`.

**Required fields (all 4 needed for full score):**
- `name` — Human-readable agent name
- `description` — What the agent does
- `url` — Endpoint where the agent accepts requests
- `capabilities` — Object describing what the agent supports

> See [references/a2a-mcp-guide.md](references/a2a-mcp-guide.md) for all A2A fields and advanced configuration.

---

## Checkpoint 4.4: MCP Discovery (10 pts)

> The Model Context Protocol (MCP) by Anthropic is the standard for connecting AI assistants to external tools and data. A discovery document lets AI systems find your MCP server.

**What the scanner checks:** `/.well-known/mcp.json` returns a valid non-empty JSON object.

### Fix workflow

**Step 1: Create the MCP discovery document**

```json
{
  "mcpServers": {
    "main": {
      "url": "https://example.com/mcp",
      "name": "Example MCP Server",
      "description": "Provides product search, order management, and customer data tools"
    }
  }
}
```

**Step 2: Serve at `/.well-known/mcp.json`**

Must return valid JSON with `Content-Type: application/json`. The JSON must be a non-empty object — empty `{}` will fail.

> See [references/a2a-mcp-guide.md](references/a2a-mcp-guide.md) for MCP discovery patterns and server configuration.

---

## Checkpoint 4.5: OpenAPI / API Documentation (20 pts)

> OpenAPI specifications let AI agents understand and call your API programmatically. AI coding assistants and agent frameworks use OpenAPI to generate correct API calls automatically.

**What the scanner checks:** Non-HTML response at `/openapi.json`, `/openapi.yaml`, `/swagger.json`, `/api-docs`, or `/.well-known/openapi`.

**Scoring:** OpenAPI 3.x = 20 pts | Swagger 2.x = 15 pts | Endpoint exists but unparseable = 10 pts | Not found = 0

### Fix workflow

**Step 1: Create an OpenAPI 3.x specification**

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "My Site API",
    "version": "1.0.0",
    "description": "API for product search and order management"
  },
  "servers": [
    {"url": "https://example.com"}
  ],
  "paths": {
    "/api/search": {
      "get": {
        "operationId": "searchProducts",
        "summary": "Search products by keyword",
        "parameters": [
          {
            "name": "q",
            "in": "query",
            "required": true,
            "schema": {"type": "string"},
            "description": "Search query"
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {"type": "integer", "default": 20},
            "description": "Max results to return"
          }
        ],
        "responses": {
          "200": {
            "description": "Search results",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "results": {
                      "type": "array",
                      "items": {"$ref": "#/components/schemas/Product"}
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Product": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "name": {"type": "string"},
          "price": {"type": "number"}
        }
      }
    }
  }
}
```

**Step 2: Serve at a standard path**

Serve at `/openapi.json` (preferred) or any of: `/openapi.yaml`, `/swagger.json`, `/api-docs`, `/.well-known/openapi`.

**Key rules:**
- Must NOT return HTML — the scanner ignores HTML responses at these endpoints
- Include `"openapi": "3.x.x"` for full score; `"swagger": "2.0"` gets partial (15 pts)
- Use `operationId` on each operation — AI agents use these as function names

> See [references/a2a-mcp-guide.md](references/a2a-mcp-guide.md) for OpenAPI best practices for AI agents.

---

## Checkpoint 4.6: agents.json (10 pts)

> agents.json provides a directory of AI agent endpoints on your site. It helps agent orchestration systems discover and connect to your available AI services.

**What the scanner checks:** Valid non-empty JSON at `/.well-known/agents.json` or `/agents.json`.

### Fix workflow

**Step 1: Create agents.json**

```json
{
  "agents": [
    {
      "name": "Customer Support Agent",
      "description": "Handles customer inquiries, order tracking, and returns",
      "url": "https://example.com/agents/support",
      "protocol": "a2a",
      "capabilities": ["text", "streaming"]
    },
    {
      "name": "Product Recommendation Agent",
      "description": "Recommends products based on preferences and browsing history",
      "url": "https://example.com/agents/recommendations",
      "protocol": "a2a",
      "capabilities": ["text"]
    }
  ]
}
```

**Step 2: Serve at `/.well-known/agents.json` or `/agents.json`**

Must return valid, non-empty JSON. Empty `{}` or `[]` will fail.

---

## Quick-start: Implement all 6 checkpoints

For a site that has a search form and a basic API, here's the minimum to pass all checkpoints:

### 1. Annotate your forms (4.1)

Add `tool-name` and `tool-description` to every interactive `<form>`.

### 2. Create `/.well-known/` directory with 4 JSON files

```
.well-known/
  webmcp.json      # 4.2 — tool manifest
  agent.json       # 4.3 — A2A Agent Card
  mcp.json         # 4.4 — MCP discovery
  agents.json      # 4.6 — agent directory
```

### 3. Serve OpenAPI spec (4.5)

Serve your API spec at `/openapi.json`.

### 4. Configure your web server

Ensure all `/.well-known/*` paths return `Content-Type: application/json` and are not blocked by your WAF, CDN, or middleware.

---

## Key Gotchas

Common mistakes that cause checkpoint failures:

1. **WebMCP needs BOTH attributes** — `tool-name` alone scores 0
2. **A2A Agent Card needs all 4 required fields** — missing `capabilities` drops to 15 pts
3. **HTML at API endpoints is ignored** — Swagger UI pages don't count as OpenAPI
4. **Empty JSON objects fail** — `{}` at `mcp.json` scores 0
5. **Swagger 2.x gets partial credit** — upgrade to OpenAPI 3.x for full score
6. **Both hyphenated and non-hyphenated work** — `tool-name` and `toolname` both accepted

> See [references/gotchas.md](references/gotchas.md) for detailed correct vs incorrect examples of each.

## References

- [WebMCP implementation guide](references/webmcp-guide.md) — Declarative API, page manifests, imperative API, well-known manifest
- [A2A, MCP & OpenAPI guide](references/a2a-mcp-guide.md) — A2A Agent Cards, MCP discovery, OpenAPI specs, agents.json, protocol comparison
- [Common gotchas](references/gotchas.md) — Pitfalls with correct vs incorrect examples

## Instructions

1. **Identify failing checkpoints** from the IsAgentReady.com scan results
2. **Determine which protocols apply** — WebMCP for interactive forms, A2A/MCP for AI agent services, OpenAPI for APIs
3. **Follow the fix workflow** for each failing checkpoint above
4. **Apply the code examples** — adapt tool names, descriptions, and endpoints to the user's site
5. **Verify** that `/.well-known/*` paths return valid JSON with correct Content-Type
6. **Re-scan** at [isagentready.com](https://isagentready.com) to confirm improvements

If `$ARGUMENTS` is provided, interpret it as the URL to fix or the specific checkpoint to address.
