# Agent Protocols: Common Gotchas

Errors that make the IsAgentReady.com scanner give a lower result than expected, with correct and incorrect examples. For the points of each checkpoint, see the scoring document that the SKILL.md links to.

---

## 1. WebMCP needs toolname AND tooldescription

The scanner needs both attributes on the same element. One attribute alone does not count.

**WRONG: only toolname**
```html
<form toolname="search_products">
  <input type="text" name="q">
  <button type="submit">Search</button>
</form>
```

**CORRECT: both attributes**
```html
<form toolname="search_products" tooldescription="Search the product catalog by keyword">
  <label for="q">Search</label>
  <input id="q" name="q" toolparamdescription="Search keywords">
  <button type="submit">Search</button>
</form>
```

---

## 2. Hyphenated attributes are legacy

Chrome documents the attributes without hyphens. The scanner marks `tool-name` and `tool-description` as legacy and gives them partial credit only.

**WRONG: hyphenated (legacy)**
```html
<form tool-name="search" tool-description="Search products">
```

**CORRECT: no hyphens**
```html
<form toolname="search_products" tooldescription="Search the product catalog">
```

---

## 3. Use document.modelContext, not navigator.modelContext

The current imperative API is `document.modelContext.registerTool()`. `navigator.modelContext`, `provideContext` and `toolcall` events come from old drafts and give partial credit only. A `<script id="webmcp">` manifest does not count at all.

**WRONG: old draft API**
```html
<script>
  navigator.modelContext.provideContext({ tools: [{ name: "search", description: "Search products" }] });
</script>
```

**CORRECT: current API with feature detection**
```html
<script>
  document.modelContext?.registerTool({
    name: "search_products",
    description: "Search the product catalog",
    inputSchema: { type: "object", properties: { q: { type: "string" } }, required: ["q"] },
    execute: async ({ q }) => ({ content: [{ type: "text", text: await search(q) }] }),
  });
</script>
```

---

## 4. A2A 1.0 needs supportedInterfaces

An A2A 1.0 card needs `name`, `description`, `version`, `capabilities` and one complete `supportedInterfaces` entry. A card in the 0.3 shape (top-level `url`, `preferredTransport`) gets partial credit as legacy.

**WRONG: A2A 0.3 shape**
```json
{
  "name": "My Agent",
  "description": "Customer support agent",
  "url": "https://example.com/agent",
  "capabilities": { "streaming": true }
}
```

**CORRECT: A2A 1.0 shape**
```json
{
  "name": "My Agent",
  "description": "Customer support agent",
  "version": "1.0.0",
  "capabilities": { "streaming": false },
  "supportedInterfaces": [
    { "url": "https://example.com/a2a/v1", "protocolBinding": "JSONRPC", "protocolVersion": "1.0" }
  ]
}
```

The interface `url` must be an absolute HTTPS URL. `protocolBinding` is `JSONRPC`, `GRPC` or `HTTP+JSON`.

---

## 5. Swagger 2.x gets partial credit, not full

The scanner differentiates between OpenAPI versions.

**PARTIAL: Swagger 2.x**
```json
{
  "swagger": "2.0",
  "info": {"title": "My API", "version": "1.0.0"},
  "paths": {}
}
```

**CORRECT: OpenAPI 3.x**
```json
{
  "openapi": "3.1.0",
  "info": {"title": "My API", "version": "1.0.0"},
  "paths": {}
}
```

Upgrade from Swagger 2.x to OpenAPI 3.x for full credit.

---

## 6. HTML responses at API endpoints are ignored

If your OpenAPI URL serves a Swagger UI HTML page, the scanner ignores it entirely.

**WRONG: Swagger UI at /api-docs (HTML, scores 0):**
```
GET /api-docs
Content-Type: text/html

<!DOCTYPE html>
<html>
  <head><title>Swagger UI</title></head>
  ...
</html>
```
Result: fail. Scanner detects HTML and skips this endpoint.

**CORRECT: JSON spec at /openapi.json:**
```
GET /openapi.json
Content-Type: application/json

{"openapi": "3.1.0", "info": {"title": "My API", ...}}
```
Result: pass.

**Fix:** Serve the raw JSON/YAML spec at one of the checked paths (`/openapi.json`, `/swagger.json`, etc.) in addition to any HTML documentation UI.

---

## 7. Empty JSON objects fail for MCP discovery and agents.json

The scanner requires non-empty JSON. An empty object or array scores 0.

**WRONG: empty object at /.well-known/mcp.json:**
```json
{}
```
Result: fail. Must have at least one key-value pair.

**WRONG: empty array at /.well-known/agents.json:**
```json
[]
```
Result: fail. Scanner expects a JSON object (map), not an array.

**CORRECT: non-empty object:**
```json
{
  "mcpServers": {
    "main": {"url": "https://example.com/mcp"}
  }
}
```
Result: pass.

---

## 8. agents.json checked at two paths

The scanner checks `/.well-known/agents.json` first, then `/agents.json`.

**WRONG: wrong path:**
```
/.well-known/agent-list.json         ← not checked
/api/agents.json                     ← not checked
```

**CORRECT: either of these:**
```
/.well-known/agents.json             ← checked first
/agents.json                         ← checked second
```

---

## 9. A2A Agent Card must be a JSON object

If the endpoint returns valid JSON that is not an object (for example an array), the check fails.

**WRONG: array instead of object**
```json
[{ "name": "Agent 1" }, { "name": "Agent 2" }]
```

**CORRECT: one JSON object for each card**
```json
{
  "name": "Agent 1",
  "description": "Customer support",
  "version": "1.0.0",
  "capabilities": {},
  "supportedInterfaces": [{ "url": "https://example.com/a2a/v1", "protocolBinding": "JSONRPC", "protocolVersion": "1.0" }]
}
```

---

## 10. Well-known paths may be blocked by WAF, CDN, or middleware

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

**Test:** `curl -I https://yoursite.com/.well-known/agent-card.json`: should return 200 with `Content-Type: application/json`.

---

## 11. OpenAPI YAML detection requires specific formatting

For YAML files, the scanner checks for `openapi:` or `swagger:` at the start of a line.

**WRONG: indented (not detected as OpenAPI):**
```yaml
spec:
  openapi: "3.1.0"
```

**CORRECT: top-level key:**
```yaml
openapi: "3.1.0"
info:
  title: My API
  version: 1.0.0
```

---

## Quick reference: discovery paths

| Checkpoint | Paths checked |
|---|---|
| 4.1 | Page HTML and same-origin scripts |
| 4.3 | `/.well-known/agent-card.json`, then `/.well-known/agent.json` |
| 4.4 | `/.well-known/mcp.json`, `/.well-known/mcp/server-card.json`, `/.well-known/mcp/server-cards.json` |
| 4.5 | `/openapi.json`, `/openapi.yaml`, `/swagger.json`, `/api-docs`, `/.well-known/openapi` |
| 4.6 | `/.well-known/agents.json`, `/agents.json` |
| 4.10 | `/.well-known/api-catalog` |
| 4.11 | `/.well-known/agent-skills/index.json`, `/.well-known/skills/index.json` |
| 4.14 | `/.well-known/ucp` |
| 4.15 | `/.well-known/acp.json` |
| 4.21 | Link relation, then `/.well-known/ai-catalog.json` |
| 4.26 | `/ask?query=` (GET) |
