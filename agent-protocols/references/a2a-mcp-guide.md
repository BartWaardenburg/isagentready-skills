# A2A, MCP, OpenAPI and agents.json Guide

Reference for the agent protocols other than WebMCP: A2A Agent Cards, MCP server cards, OpenAPI documents and agents.json. For the points of each checkpoint, see the scoring document that the SKILL.md links to.

---

## Protocol Comparison

| Protocol | Purpose | Endpoint | Checkpoint |
|---|---|---|---|
| A2A Agent Card | Agent-to-agent capability card | `/.well-known/agent-card.json` | 4.3 |
| MCP server card | MCP server discovery | `/.well-known/mcp/server-card.json` | 4.4, 4.18 |
| OpenAPI | API description for agents | `/openapi.json` (and others) | 4.5, 4.17, 4.19 |
| agents.json | Agent endpoint directory | `/.well-known/agents.json` | 4.6 |

### When to use which

- **A2A Agent Card**: the site hosts an agent that other agents talk to.
- **MCP server card**: the site runs an MCP server with tools or resources.
- **OpenAPI**: the site has a REST API that agents call.
- **agents.json**: the site has more than one agent endpoint to list.

---

## A2A Agent Card (checkpoint 4.3)

The scanner reads `/.well-known/agent-card.json` first and then `/.well-known/agent.json`.

### Required fields (A2A 1.0)

| Field | Type | Description |
|---|---|---|
| `name` | string | Agent name |
| `description` | string | What the agent does |
| `version` | string | Version of the agent |
| `capabilities` | object | Supported features (streaming, push notifications, extended card) |
| `supportedInterfaces` | array | One or more entries with `url`, `protocolBinding` and `protocolVersion` |

Each `supportedInterfaces` entry needs:

- `url`: an absolute HTTPS URL on a production host
- `protocolBinding`: `JSONRPC`, `GRPC` or `HTTP+JSON`
- `protocolVersion`: a non-empty string, for example `1.0`

A card in the A2A 0.3 shape (top-level `url`, `protocolVersion`, `preferredTransport`) gets partial credit as legacy.

### Complete Agent Card

```json
{
  "name": "Acme Commerce Agent",
  "description": "Product search, order tracking and customer support for Acme Corp",
  "version": "1.2.0",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false,
    "extendedAgentCard": false
  },
  "supportedInterfaces": [
    { "url": "https://acme.example.com/a2a/v1", "protocolBinding": "JSONRPC", "protocolVersion": "1.0" }
  ],
  "skills": [
    {
      "id": "product_search",
      "name": "Product search",
      "description": "Search the product catalog with filters",
      "tags": ["commerce", "search"],
      "examples": ["Find blue running shoes under 100 USD"]
    },
    {
      "id": "order_tracking",
      "name": "Order tracking",
      "description": "Get the shipping status of an order",
      "tags": ["commerce", "orders"]
    }
  ],
  "defaultInputModes": ["text/plain", "application/json"],
  "defaultOutputModes": ["application/json"],
  "provider": { "organization": "Acme Corp", "url": "https://acme.example.com" }
}
```

### AP2 payments (checkpoint 4.16)

To declare the Agent Payments Protocol, add the extension to the card:

```json
"extensions": [
  { "uri": "https://google.github.io/A2A/extensions/ap2", "description": "Supports Agent Payments Protocol", "required": false }
]
```

---

## MCP Server Card (checkpoints 4.4 and 4.18)

The scanner reads `/.well-known/mcp.json`, `/.well-known/mcp/server-card.json` and `/.well-known/mcp/server-cards.json` in this order.

- 4.4 passes when the card has a top-level `name` or `serverInfo.name` (SEP-1649). A legacy `mcpServers` map also passes.
- A JSON document without these fields gives partial credit. An empty `{}` fails.
- 4.18 checks the quality of the card: identity and version, transport type and endpoint, capabilities, auth metadata, and a description or instructions.

### Complete server card

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
  "name": "com.example/catalog",
  "title": "Example catalog",
  "version": "1.0.0",
  "description": "Search products and read order status. Read-only tools need no token.",
  "websiteUrl": "https://example.com",
  "capabilities": { "tools": {}, "resources": {} },
  "remotes": [
    {
      "type": "streamable-http",
      "url": "https://example.com/mcp",
      "supportedProtocolVersions": ["2026-07-28", "2025-03-26"],
      "headers": [
        { "name": "Authorization", "description": "Bearer token for order tools", "isRequired": false, "isSecret": true }
      ]
    }
  ]
}
```

### Live verification (checkpoint 4.20)

The scanner connects to the same-origin Streamable HTTP endpoint from the card. It tries `server/discover` (MCP 2026-07-28) first. It falls back to `initialize` only when the server returns an exact method-not-found error. It lists the advertised tools and resources. It sends one random invalid method and expects HTTP 404 with method-not-found. It never calls a tool and sends no credentials.

### MCP Apps (checkpoint 4.25)

When a tool returns an interface, link the tool to a `ui://` resource with `_meta.ui.resourceUri`. Serve the resource from `resources/read` with the MIME type `text/html;profile=mcp-app`.

---

## OpenAPI / API Documentation (checkpoint 4.5)

### Checked paths (in order)

1. `/openapi.json`
2. `/openapi.yaml`
3. `/swagger.json`
4. `/api-docs`
5. `/.well-known/openapi`

Scanner stops at the first non-HTML response found.

### Scoring

| Condition                                | Score |
|------------------------------------------|-------|
| OpenAPI 3.x (`"openapi": "3.x.x"`)      | 20    |
| Swagger 2.x (`"swagger": "2.0"`)        | 15    |
| Endpoint exists but not parseable        | 10    |
| No endpoint found / all return HTML      | 0     |

### Minimum viable OpenAPI 3.x spec

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "My API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/search": {
      "get": {
        "operationId": "searchItems",
        "summary": "Search items by keyword",
        "parameters": [
          {
            "name": "q",
            "in": "query",
            "required": true,
            "schema": {"type": "string"},
            "description": "Search query"
          }
        ],
        "responses": {
          "200": {"description": "Successful response"}
        }
      }
    }
  }
}
```

### OpenAPI best practices for AI agents

1. **Always include `operationId`**: AI agents use this as the function name when generating API calls
2. **Write clear `summary` and `description`**: These become the tool descriptions agents see
3. **Document all parameters**: Include `description`, `type`, `required`, and `enum` where applicable
4. **Use `$ref` for shared schemas**: Keeps the spec readable and consistent
5. **Include `servers` array**: Agents need to know the base URL

### Complete example with multiple endpoints

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "E-Commerce API",
    "version": "2.0.0",
    "description": "API for product search, cart management, and order tracking"
  },
  "servers": [
    {"url": "https://api.example.com/v2"}
  ],
  "paths": {
    "/products/search": {
      "get": {
        "operationId": "searchProducts",
        "summary": "Search products by keyword and filters",
        "tags": ["Products"],
        "parameters": [
          {
            "name": "q",
            "in": "query",
            "required": true,
            "schema": {"type": "string"},
            "description": "Search keywords"
          },
          {
            "name": "category",
            "in": "query",
            "schema": {"type": "string", "enum": ["electronics", "books", "clothing"]},
            "description": "Filter by category"
          },
          {
            "name": "min_price",
            "in": "query",
            "schema": {"type": "number"},
            "description": "Minimum price in USD"
          },
          {
            "name": "max_price",
            "in": "query",
            "schema": {"type": "number"},
            "description": "Maximum price in USD"
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {"type": "integer", "default": 20, "maximum": 100},
            "description": "Maximum results to return"
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
                    "total": {"type": "integer"},
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
    },
    "/products/{id}": {
      "get": {
        "operationId": "getProduct",
        "summary": "Get product details by ID",
        "tags": ["Products"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {"type": "string"},
            "description": "Product ID"
          }
        ],
        "responses": {
          "200": {
            "description": "Product details",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/Product"}
              }
            }
          },
          "404": {"description": "Product not found"}
        }
      }
    },
    "/orders/{id}": {
      "get": {
        "operationId": "getOrder",
        "summary": "Get order status and tracking information",
        "tags": ["Orders"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {"type": "string"},
            "description": "Order ID"
          }
        ],
        "responses": {
          "200": {
            "description": "Order details with tracking",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/Order"}
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
          "description": {"type": "string"},
          "price": {"type": "number"},
          "currency": {"type": "string", "default": "USD"},
          "category": {"type": "string"},
          "inStock": {"type": "boolean"}
        }
      },
      "Order": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "status": {"type": "string", "enum": ["pending", "processing", "shipped", "delivered"]},
          "trackingUrl": {"type": "string", "format": "uri"},
          "estimatedDelivery": {"type": "string", "format": "date"}
        }
      }
    }
  }
}
```

### YAML format

YAML is also accepted. The scanner detects `openapi:` or `swagger:` at the start of a line:

```yaml
openapi: "3.1.0"
info:
  title: My API
  version: 1.0.0
paths:
  /api/search:
    get:
      operationId: searchItems
      summary: Search items
      parameters:
        - name: q
          in: query
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Search results
```

---

## agents.json (checkpoint 4.6)

### Checked paths

1. `/.well-known/agents.json` (checked first)
2. `/agents.json`

### Requirements

- Must return valid JSON
- Must be non-empty (not `{}` or `[]`)

### Format

```json
{
  "agents": [
    {
      "name": "Customer Support Agent",
      "description": "Handles customer inquiries, returns, and order issues",
      "url": "https://example.com/agents/support",
      "protocol": "a2a",
      "capabilities": ["text", "streaming"],
      "skills": ["order-tracking", "returns", "faq"]
    },
    {
      "name": "Product Advisor",
      "description": "Recommends products based on needs and preferences",
      "url": "https://example.com/agents/advisor",
      "protocol": "a2a",
      "capabilities": ["text"],
      "skills": ["product-search", "comparison", "recommendations"]
    },
    {
      "name": "Analytics API",
      "description": "Provides site analytics and reporting data via MCP",
      "url": "https://example.com/mcp/analytics",
      "protocol": "mcp"
    }
  ]
}
```

### Agent entry fields

| Field          | Type   | Description                                   |
|----------------|--------|-----------------------------------------------|
| `name`         | string | Agent name                                    |
| `description`  | string | What the agent does                           |
| `url`          | string | Agent endpoint URL                            |
| `protocol`     | string | Protocol type: `a2a`, `mcp`, `openapi`, etc.  |
| `capabilities` | array  | Supported interaction modes                   |
| `skills`       | array  | List of skill IDs or names                    |

### Minimal passing agents.json

```json
{
  "agents": [
    {
      "name": "My Agent",
      "url": "https://example.com/agent"
    }
  ]
}
```

Any valid, non-empty JSON passes. The scanner doesn't validate specific agent fields.

---

## Server Configuration

### Serving all well-known files (Nginx)

```nginx
location /.well-known/ {
    default_type application/json;
    add_header Access-Control-Allow-Origin "*";
    add_header Cache-Control "public, max-age=3600";
}
```

### Serving all well-known files (Apache)

```apache
<Directory ".well-known">
    ForceType application/json
    Header set Access-Control-Allow-Origin "*"
    Header set Cache-Control "public, max-age=3600"
</Directory>
```

### Express/Node (all endpoints)

```javascript
const agentCard = require('./well-known/agent-card.json');
const serverCard = require('./well-known/mcp/server-card.json');
const agentsJson = require('./well-known/agents.json');
const openapi = require('./openapi.json');

app.get('/.well-known/agent-card.json', (req, res) => res.json(agentCard));
app.get('/.well-known/mcp/server-card.json', (req, res) => res.json(serverCard));
app.get('/.well-known/agents.json', (req, res) => res.json(agentsJson));
app.get('/openapi.json', (req, res) => res.json(openapi));
```

---

## References

- [A2A specification](https://a2a-protocol.org/latest/specification/): A2A 1.0 and the Agent Card fields
- [Model Context Protocol](https://modelcontextprotocol.io): MCP documentation
- [MCP Specification](https://spec.modelcontextprotocol.io): Detailed MCP spec
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html): OpenAPI 3.1 spec
- [Swagger Editor](https://editor.swagger.io/): Online OpenAPI editor and validator
