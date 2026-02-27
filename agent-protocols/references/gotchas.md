# Agent Protocols — Common Gotchas

Pitfalls that cause the IsAgentReady.com scanner to score lower than expected, with correct vs incorrect examples.

---

## 1. WebMCP needs BOTH tool-name AND tool-description

The scanner requires both attributes on the same element. Having only one scores 0.

**WRONG — only tool-name, no tool-description:**
```html
<form tool-name="search-products">
  <input type="text" name="q">
  <button type="submit">Search</button>
</form>
```
Result: 0 pts — scanner looks for both attributes on the same element.

**WRONG — only tool-description, no tool-name:**
```html
<form tool-description="Search the product catalog">
  <input type="text" name="q">
  <button type="submit">Search</button>
</form>
```
Result: 0 pts — same problem, needs both.

**CORRECT — both attributes present:**
```html
<form tool-name="search-products"
      tool-description="Search the product catalog by keyword">
  <input type="text" name="q" tool-param-description="Search keywords">
  <button type="submit">Search</button>
</form>
```
Result: 25 pts.

---

## 2. Hyphenated and non-hyphenated attributes both work

The scanner accepts both forms per the W3C proposal. Don't mix styles within one element though.

**CORRECT — hyphenated (recommended):**
```html
<form tool-name="search" tool-description="Search products">
```

**CORRECT — non-hyphenated (also accepted):**
```html
<form toolname="search" tooldescription="Search products">
```

**CORRECT — tool-param-description variants:**
```html
<input tool-param-description="Search query">
<input toolparamdescription="Search query">
```

Both styles score identically.

---

## 3. Imperative API scores less than declarative

The three WebMCP approaches score differently for checkpoint 4.1.

**10 pts — imperative API only:**
```html
<script>
  navigator.modelContext.provideContext({
    tools: [{ name: "search", description: "Search products" }]
  });
</script>
```

**15 pts — page manifest only:**
```html
<script type="application/json" id="webmcp">
{"tools": [{"name": "search", "description": "Search products"}]}
</script>
```

**25 pts — declarative attributes (highest):**
```html
<form tool-name="search" tool-description="Search products">
  <input type="text" name="q">
</form>
```

If you can only do one, choose declarative attributes for maximum score.

---

## 4. A2A Agent Card needs all 4 required fields for full score

Missing even one field drops from 25 pts to 15 pts. Missing 3+ fields scores 0.

**WRONG — missing `capabilities` (scores 15, not 25):**
```json
{
  "name": "My Agent",
  "description": "Customer support agent",
  "url": "https://example.com/agent"
}
```

**WRONG — missing `url` and `capabilities` (scores 0):**
```json
{
  "name": "My Agent",
  "description": "Customer support agent"
}
```

**CORRECT — all 4 required fields present (scores 25):**
```json
{
  "name": "My Agent",
  "description": "Customer support agent",
  "url": "https://example.com/agent",
  "capabilities": {"streaming": true}
}
```

The `capabilities` object can be empty `{}` — it just needs to exist as a key.

---

## 5. Swagger 2.x gets partial credit, not full

The scanner differentiates between OpenAPI versions.

**15 pts — Swagger 2.x:**
```json
{
  "swagger": "2.0",
  "info": {"title": "My API", "version": "1.0.0"},
  "paths": {}
}
```

**20 pts — OpenAPI 3.x (full score):**
```json
{
  "openapi": "3.1.0",
  "info": {"title": "My API", "version": "1.0.0"},
  "paths": {}
}
```

Upgrade from Swagger 2.x to OpenAPI 3.x for the full 20 points.

---

## 6. HTML responses at API endpoints are ignored

If your OpenAPI URL serves a Swagger UI HTML page, the scanner ignores it entirely.

**WRONG — Swagger UI at /api-docs (HTML, scores 0):**
```
GET /api-docs
Content-Type: text/html

<!DOCTYPE html>
<html>
  <head><title>Swagger UI</title></head>
  ...
</html>
```
Result: 0 pts — scanner detects HTML and skips this endpoint.

**CORRECT — JSON spec at /openapi.json:**
```
GET /openapi.json
Content-Type: application/json

{"openapi": "3.1.0", "info": {"title": "My API", ...}}
```
Result: 20 pts.

**Fix:** Serve the raw JSON/YAML spec at one of the checked paths (`/openapi.json`, `/swagger.json`, etc.) in addition to any HTML documentation UI.

---

## 7. Empty JSON objects fail for MCP discovery and agents.json

The scanner requires non-empty JSON. An empty object or array scores 0.

**WRONG — empty object at /.well-known/mcp.json:**
```json
{}
```
Result: 0 pts — must have at least one key-value pair.

**WRONG — empty array at /.well-known/agents.json:**
```json
[]
```
Result: 0 pts — scanner expects a JSON object (map), not an array.

**CORRECT — non-empty object:**
```json
{
  "mcpServers": {
    "main": {"url": "https://example.com/mcp"}
  }
}
```
Result: 10 pts.

---

## 8. WebMCP page manifest requires specific script attributes

The `<script>` tag must have both `type="application/json"` AND `id="webmcp"`. Missing either one means the scanner won't detect it.

**WRONG — missing id attribute:**
```html
<script type="application/json">
{"tools": [{"name": "search", "description": "Search products"}]}
</script>
```

**WRONG — wrong type attribute:**
```html
<script type="text/javascript" id="webmcp">
{"tools": [{"name": "search", "description": "Search products"}]}
</script>
```

**WRONG — id on wrong element:**
```html
<div id="webmcp">
  <script type="application/json">
  {"tools": [{"name": "search", "description": "Search products"}]}
  </script>
</div>
```

**CORRECT — both attributes on the script tag (order doesn't matter):**
```html
<script type="application/json" id="webmcp">
{"tools": [{"name": "search", "description": "Search products"}]}
</script>
```

```html
<!-- Also correct — reversed attribute order -->
<script id="webmcp" type="application/json">
{"tools": [{"name": "search", "description": "Search products"}]}
</script>
```

---

## 9. WebMCP manifest checked at two paths

The scanner checks both `/.well-known/webmcp` (no extension) and `/.well-known/webmcp.json`. Either one works.

**WRONG — wrong path:**
```
/.well-known/webmcp-manifest.json    ← not checked
/.well-known/web-mcp.json            ← not checked
/webmcp.json                         ← not checked
```

**CORRECT — either of these:**
```
/.well-known/webmcp                  ← checked
/.well-known/webmcp.json             ← checked
```

---

## 10. agents.json checked at two paths

The scanner checks `/.well-known/agents.json` first, then `/agents.json`.

**WRONG — wrong path:**
```
/.well-known/agent-list.json         ← not checked
/api/agents.json                     ← not checked
```

**CORRECT — either of these:**
```
/.well-known/agents.json             ← checked first
/agents.json                         ← checked second
```

---

## 11. A2A Agent Card must be a JSON object

If the endpoint returns valid JSON but it's not an object (e.g., an array), it scores 0.

**WRONG — array instead of object:**
```json
[
  {"name": "Agent 1", "url": "https://example.com/agent1"},
  {"name": "Agent 2", "url": "https://example.com/agent2"}
]
```
Result: 0 pts — scanner expects a JSON object with named fields.

**CORRECT — JSON object:**
```json
{
  "name": "Agent 1",
  "description": "Customer support",
  "url": "https://example.com/agent",
  "capabilities": {}
}
```

---

## 12. Well-known paths may be blocked by WAF, CDN, or middleware

Common infrastructure can block `/.well-known/` requests or strip custom routes.

**Symptoms:**
- Files exist but scanner reports "not found"
- Works locally but fails in production
- Returns 403, 404, or redirects to homepage

**Common causes and fixes:**

| Cause                              | Fix                                                    |
|------------------------------------|--------------------------------------------------------|
| CDN caches 404 for unknown paths   | Add cache bypass rule for `/.well-known/*`             |
| WAF blocks `.json` file requests   | Allowlist `/.well-known/` path prefix                  |
| Framework doesn't serve static     | Add explicit routes for each endpoint                  |
| Reverse proxy strips path          | Ensure proxy passes `/.well-known/` to backend         |

**Test:** `curl -I https://yoursite.com/.well-known/agent.json` — should return 200 with `Content-Type: application/json`.

---

## 13. OpenAPI YAML detection requires specific formatting

For YAML files, the scanner checks for `openapi:` or `swagger:` at the start of a line.

**WRONG — indented (not detected as OpenAPI):**
```yaml
spec:
  openapi: "3.1.0"
```

**CORRECT — top-level key:**
```yaml
openapi: "3.1.0"
info:
  title: My API
  version: 1.0.0
```

---

## Quick reference: All checked paths

| Checkpoint | Paths checked                                                                        |
|------------|--------------------------------------------------------------------------------------|
| 4.1        | HTML content (no path — checks page HTML)                                            |
| 4.2        | `/.well-known/webmcp`, `/.well-known/webmcp.json`                                   |
| 4.3        | `/.well-known/agent.json`                                                            |
| 4.4        | `/.well-known/mcp.json`                                                              |
| 4.5        | `/openapi.json`, `/openapi.yaml`, `/swagger.json`, `/api-docs`, `/.well-known/openapi` |
| 4.6        | `/.well-known/agents.json`, `/agents.json`                                           |
