# A2A, MCP Discovery, OpenAPI & agents.json Guide

Complete reference for implementing non-WebMCP agent protocols: Google A2A Agent Cards, Anthropic MCP discovery, OpenAPI specifications, and agents.json.

---

## Protocol Comparison

| Protocol       | Purpose                           | Endpoint                    | Checkpoint | Points |
|----------------|-----------------------------------|-----------------------------|------------|--------|
| A2A Agent Card | Agent-to-agent capability ads     | `/.well-known/agent.json`   | 4.3        | 25     |
| MCP Discovery  | AI tool/data server discovery     | `/.well-known/mcp.json`     | 4.4        | 10     |
| OpenAPI        | API documentation for AI agents   | `/openapi.json` (+ others)  | 4.5        | 20     |
| agents.json    | Agent endpoint directory          | `/.well-known/agents.json`  | 4.6        | 10     |

### When to use which

- **A2A Agent Card** — Your site hosts an AI agent that other agents should communicate with
- **MCP Discovery** — You have an MCP server providing tools/resources to AI assistants
- **OpenAPI** — You have a REST API that AI agents should call programmatically
- **agents.json** — You have multiple agent endpoints to advertise as a directory
- **All of them** — Maximum coverage; they serve complementary purposes

---

## A2A Agent Card (25 pts — checkpoint 4.3)

### Required fields (all 4 needed for full score)

| Field          | Type   | Description                                    |
|----------------|--------|------------------------------------------------|
| `name`         | string | Human-readable agent name                      |
| `description`  | string | What the agent does                            |
| `url`          | string | Endpoint URL where the agent accepts requests  |
| `capabilities` | object | Supported interaction modes                    |

### Scoring

- All 4 required fields present → **25 pts**
- 2-3 required fields present → **15 pts**
- 0-1 required fields present → **0 pts**

### Complete Agent Card

```json
{
  "name": "Acme Commerce Agent",
  "description": "AI assistant for product search, order tracking, and customer support at Acme Corp",
  "url": "https://acme.example.com/agent",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  },
  "skills": [
    {
      "id": "product-search",
      "name": "Product Search",
      "description": "Search and browse the product catalog with filters",
      "tags": ["commerce", "search"],
      "examples": [
        "Find blue running shoes under $100",
        "Show me the latest electronics deals"
      ]
    },
    {
      "id": "order-tracking",
      "name": "Order Tracking",
      "description": "Track order status, shipping, and delivery updates",
      "tags": ["commerce", "orders"]
    },
    {
      "id": "customer-support",
      "name": "Customer Support",
      "description": "Handle returns, exchanges, and general inquiries",
      "tags": ["support"]
    }
  ],
  "defaultInputModes": ["text/plain", "application/json"],
  "defaultOutputModes": ["text/plain", "application/json"],
  "authentication": {
    "schemes": ["bearer"],
    "credentials": null
  },
  "provider": {
    "organization": "Acme Corp",
    "url": "https://acme.example.com"
  }
}
```

### All A2A Agent Card fields

| Field                    | Required | Type     | Description                                        |
|--------------------------|----------|----------|----------------------------------------------------|
| `name`                   | Yes      | string   | Agent name                                         |
| `description`            | Yes      | string   | What the agent does                                |
| `url`                    | Yes      | string   | Agent endpoint URL                                 |
| `capabilities`           | Yes      | object   | Streaming, push notifications, etc.                |
| `skills`                 | No       | array    | List of agent skills/abilities                     |
| `defaultInputModes`      | No       | array    | Accepted input MIME types                          |
| `defaultOutputModes`     | No       | array    | Output MIME types                                  |
| `authentication`         | No       | object   | Auth requirements                                  |
| `provider`               | No       | object   | Organization info                                  |

### Capabilities object

```json
{
  "streaming": true,
  "pushNotifications": false,
  "stateTransitionHistory": false
}
```

- `streaming` — Agent supports Server-Sent Events for real-time responses
- `pushNotifications` — Agent can send async notifications
- `stateTransitionHistory` — Agent tracks and exposes task state changes

### Minimal passing Agent Card

```json
{
  "name": "My Agent",
  "description": "An AI assistant",
  "url": "https://example.com/agent",
  "capabilities": {}
}
```

This scores full 25 pts — all 4 required fields are present. The `capabilities` object can be empty.

---

## MCP Discovery (10 pts — checkpoint 4.4)

### Requirements

- Serve at `/.well-known/mcp.json`
- Must return a valid, non-empty JSON object
- Empty `{}` fails (map_size must be > 0)

### Standard format

```json
{
  "mcpServers": {
    "primary": {
      "url": "https://example.com/mcp/sse",
      "name": "Example Primary Server",
      "description": "Product catalog search and order management tools",
      "transport": "sse"
    },
    "analytics": {
      "url": "https://example.com/mcp/analytics",
      "name": "Analytics Server",
      "description": "Website analytics and reporting data",
      "transport": "sse"
    }
  }
}
```

### Server entry fields

| Field         | Type   | Description                                 |
|---------------|--------|---------------------------------------------|
| `url`         | string | MCP server endpoint URL                     |
| `name`        | string | Human-readable server name                  |
| `description` | string | What tools/resources the server provides    |
| `transport`   | string | Transport type: `sse`, `stdio`, `streamable-http` |

### MCP server types

| Transport        | Use case                            | URL format                      |
|------------------|-------------------------------------|---------------------------------|
| `sse`            | Web-hosted servers                  | `https://example.com/mcp/sse`   |
| `streamable-http`| Newer HTTP-based transport          | `https://example.com/mcp`       |
| `stdio`          | Local CLI tools (not web-relevant)  | N/A                             |

### Minimal passing discovery document

```json
{
  "mcpServers": {
    "main": {
      "url": "https://example.com/mcp"
    }
  }
}
```

Any non-empty JSON object passes. The scanner doesn't validate specific fields — it only checks for a valid, non-empty JSON object.

---

## OpenAPI / API Documentation (20 pts — checkpoint 4.5)

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

1. **Always include `operationId`** — AI agents use this as the function name when generating API calls
2. **Write clear `summary` and `description`** — These become the tool descriptions agents see
3. **Document all parameters** — Include `description`, `type`, `required`, and `enum` where applicable
4. **Use `$ref` for shared schemas** — Keeps the spec readable and consistent
5. **Include `servers` array** — Agents need to know the base URL

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

## agents.json (10 pts — checkpoint 4.6)

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
const agentCard = require('./well-known/agent.json');
const mcpDiscovery = require('./well-known/mcp.json');
const agentsJson = require('./well-known/agents.json');
const openapi = require('./openapi.json');

app.get('/.well-known/agent.json', (req, res) => res.json(agentCard));
app.get('/.well-known/mcp.json', (req, res) => res.json(mcpDiscovery));
app.get('/.well-known/agents.json', (req, res) => res.json(agentsJson));
app.get('/openapi.json', (req, res) => res.json(openapi));
```

---

## References

- [Google A2A Protocol](https://google.github.io/A2A/) — A2A specification
- [A2A Agent Card spec](https://google.github.io/A2A/#/topics/agent_card) — Agent Card field reference
- [Model Context Protocol](https://modelcontextprotocol.io) — MCP documentation
- [MCP Specification](https://spec.modelcontextprotocol.io) — Detailed MCP spec
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) — OpenAPI 3.1 spec
- [Swagger Editor](https://editor.swagger.io/) — Online OpenAPI editor and validator
