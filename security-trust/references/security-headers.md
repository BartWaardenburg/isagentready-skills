# Security Headers Deep Dive

Detailed reference for all 7 security headers checked by the IsAgentReady.com scanner (Security & Trust category).

---

## 1. HTTPS (checkpoint 5.1)

### Purpose
HTTPS encrypts all communication between browser/agent and server using TLS. It prevents eavesdropping, tampering, and impersonation.

### Scoring

| Condition                        | Result |
|----------------------------------|--------|
| HTTPS with valid certificate     | Pass |
| HTTPS with invalid/expired cert  | Partial |
| HTTP only (no HTTPS)             | Fail |

### Certificate Requirements
- Valid (not expired, not self-signed for production)
- Covers the exact domain (or wildcard `*.example.com`)
- Trusted chain (issued by recognized CA)
- Let's Encrypt certificates are free and fully trusted

### Impact on AI Agents
- All major AI agent frameworks refuse HTTP endpoints for tool calls
- OpenAI's function calling requires HTTPS endpoints
- Anthropic's tool use requires HTTPS for external URLs
- MCP servers communicate over HTTPS in remote configurations

---

## 2. Strict-Transport-Security / HSTS (checkpoint 5.3)

### Purpose
HSTS tells browsers: "Always use HTTPS for this domain. Never attempt HTTP." This prevents:
- Protocol downgrade attacks (SSL stripping)
- Cookie hijacking on the initial HTTP request
- Man-in-the-middle on the first visit (with preload)

### Header Format
```
Strict-Transport-Security: max-age=<seconds>; includeSubDomains; preload
```

### Directives

| Directive          | Required | Purpose                                        |
|--------------------|----------|------------------------------------------------|
| `max-age`          | Yes      | How long (seconds) to remember HSTS policy     |
| `includeSubDomains`| No       | Apply to all subdomains too                    |
| `preload`          | No       | Consent to browser preload list inclusion      |

### Scoring

| Condition                                        | Result |
|--------------------------------------------------|--------|
| `max-age>=31536000` + `includeSubDomains`        | Pass |
| `max-age>=31536000` without `includeSubDomains`  | Partial |
| `max-age>0` but less than 31536000               | Partial |
| Missing header or `max-age=0`                    | Fail |

### max-age Values

| Value      | Duration | Result        |
|------------|----------|---------------|
| 86400      | 1 day    | Partial       |
| 604800     | 1 week   | Partial       |
| 2592000    | 30 days  | Partial       |
| 31536000   | 1 year   | Pass          |
| 63072000   | 2 years  | Pass          |

The magic number is **31536000** (1 year). Anything less gets partial credit.

### HSTS Preload Process

The HSTS preload list is hardcoded into browsers (Chrome, Firefox, Safari, Edge). Once on the list, even the very first visit to your site is forced HTTPS.

**Requirements for preload submission:**
1. Valid HTTPS certificate
2. Redirect HTTP to HTTPS on the same host
3. HSTS header on the HTTPS response with:
   - `max-age` of at least 31536000 (1 year)
   - `includeSubDomains` directive
   - `preload` directive
4. All subdomains must support HTTPS

**Submit at:** [hstspreload.org](https://hstspreload.org)

**Warning:** Preload is difficult to undo. Removal takes months. Only submit when you're confident all subdomains support HTTPS permanently.

---

## 3. Content-Security-Policy / CSP (checkpoint 5.4)

### Purpose
CSP controls which resources (scripts, styles, images, etc.) the browser is allowed to load. It's the primary defense against XSS (Cross-Site Scripting) attacks.

### Header Format
```
Content-Security-Policy: directive1 value1; directive2 value2; ...
```

### Key Directives

| Directive          | Controls                      | Example                          |
|--------------------|-------------------------------|----------------------------------|
| `default-src`      | Fallback for all directives   | `default-src 'self'`             |
| `script-src`       | JavaScript sources            | `script-src 'self' https://cdn.example.com` |
| `style-src`        | CSS sources                   | `style-src 'self' 'unsafe-inline'` |
| `img-src`          | Image sources                 | `img-src 'self' data: https:`    |
| `font-src`         | Font sources                  | `font-src 'self'`               |
| `connect-src`      | XHR/fetch/WebSocket targets   | `connect-src 'self' https://api.example.com` |
| `frame-src`        | iframe sources                | `frame-src 'none'`              |
| `frame-ancestors`  | Who can embed this page       | `frame-ancestors 'none'`        |
| `object-src`       | Plugin sources (Flash, etc.)  | `object-src 'none'`             |
| `base-uri`         | Restricts `<base>` element    | `base-uri 'self'`               |
| `form-action`      | Form submission targets       | `form-action 'self'`            |
| `upgrade-insecure-requests` | Auto-upgrade HTTP to HTTPS | (no value needed)          |
| `block-all-mixed-content`   | Block HTTP on HTTPS pages  | (no value needed)           |

### Source Values

| Value               | Meaning                                    |
|---------------------|--------------------------------------------|
| `'self'`            | Same origin only                           |
| `'none'`            | Block everything                           |
| `'unsafe-inline'`   | Allow inline scripts/styles (weakens CSP)  |
| `'nonce-<base64>'`  | Allow specific inline scripts by nonce     |
| `'strict-dynamic'`  | Trust scripts loaded by trusted scripts    |
| `https:`            | Any HTTPS URL                              |
| `data:`             | Data URIs (e.g., `data:image/png`)         |
| `https://cdn.example.com` | Specific origin                     |

### Scoring

| Condition                                            | Result |
|------------------------------------------------------|--------|
| Meaningful directives (default-src, script-src, etc.)| Pass |
| Only trivial directives (upgrade-insecure-requests, block-all-mixed-content) | Partial |
| No CSP header                                        | Fail |

### Trivial vs Meaningful
The scanner specifically checks whether CSP contains more than just:
- `upgrade-insecure-requests`
- `block-all-mixed-content`

These are useful but don't actually prevent XSS. A meaningful CSP must restrict script sources.

### Nonce-Based CSP (Advanced)
Instead of `'unsafe-inline'`, use nonces for inline scripts:

```html
<!-- Server generates a unique nonce per request -->
<script nonce="abc123def456">
  // This script is allowed
</script>
```

```
Content-Security-Policy: script-src 'nonce-abc123def456' 'strict-dynamic'
```

Benefits:
- No `'unsafe-inline'` needed
- Each page load has a unique nonce
- `'strict-dynamic'` allows scripts loaded by nonced scripts

### CSP Report-Only Mode
Test your CSP without breaking anything:

```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

This logs violations without blocking resources. Use it to identify what you need to whitelist before switching to enforcing mode.

---

## 4. X-Content-Type-Options (checkpoint 5.5)

### Purpose
Prevents MIME type sniffing. Without this header, browsers may interpret a file differently than its `Content-Type` declares: e.g., treating a text file as JavaScript and executing it.

### Header Format
```
X-Content-Type-Options: nosniff
```

There is only one valid value: `nosniff`.

### Scoring

| Condition     | Result |
|---------------|--------|
| `nosniff`     | Pass |
| Missing/other | Fail |

### What It Prevents
- An attacker uploads a `.txt` file containing JavaScript
- Without `nosniff`, the browser might execute it as JS if loaded via `<script>`
- With `nosniff`, the browser strictly respects the declared Content-Type

---

## 5. Frame Protection (checkpoint 5.6)

### Purpose
Prevents clickjacking: where an attacker embeds your site in an invisible iframe and tricks users into clicking elements on your page while thinking they're interacting with the attacker's page.

### Two Approaches

#### X-Frame-Options (Legacy, Widely Supported)

```
X-Frame-Options: DENY           # Never allow framing
X-Frame-Options: SAMEORIGIN     # Only allow framing by same origin
```

**Note:** `ALLOW-FROM https://example.com` is deprecated and not supported by Chrome or Firefox. Do not use it.

#### CSP frame-ancestors (Modern, More Flexible)

```
Content-Security-Policy: frame-ancestors 'none'                    # Same as DENY
Content-Security-Policy: frame-ancestors 'self'                    # Same as SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self' https://trusted.com  # Allow specific origins
```

### Scoring

| Condition                                         | Result |
|---------------------------------------------------|--------|
| X-Frame-Options (DENY or SAMEORIGIN)              | Pass |
| CSP frame-ancestors directive present              | Pass |
| Both present                                       | Pass |
| Neither present                                    | Fail |

### Recommendation
Use CSP `frame-ancestors` as the primary mechanism (more flexible, standards-based) and add `X-Frame-Options` as a fallback for older browsers.

---

## 6. CORS Configuration (checkpoint 5.7)

### Purpose
Cross-Origin Resource Sharing controls which external origins can make requests to your site. Without CORS headers, browsers block cross-origin requests by default (Same-Origin Policy).

### Header Format
```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Origin: *
```

### What the scanner checks
Checkpoint 5.7 is an emerging bonus probe. It runs only on the same-origin API operation that checkpoint 4.19 verifies. It sends a preflight and a GET with the same method and headers. It does not follow redirects. It checks `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, wildcards with credentials, and `Vary: Origin` when the allowed origin changes per request. When the API is temporarily not available, the check skips.

| Condition | Result |
|---|---|
| Preflight and GET agree, no wildcard with credentials, `Vary: Origin` for a dynamic origin | Pass |
| Headers are missing, do not agree, or combine a wildcard with credentials | Partial or Fail |

### Wildcard Risks
`Access-Control-Allow-Origin: *` means any website can read responses from your site. This is fine for:
- Public APIs with no authentication
- Static assets (CDN, fonts)
- Open data endpoints

It's risky for:
- Endpoints that use cookies or tokens for auth
- Admin APIs
- User-specific data endpoints

**Important:** Browsers never send credentials (cookies) with wildcard CORS. But if you also set `Access-Control-Allow-Credentials: true`, the browser rejects the response entirely: wildcard + credentials is a spec violation.

### Preflight Requests
For non-simple requests (PUT, DELETE, custom headers), browsers send an OPTIONS preflight:
```
OPTIONS /api/resource
Origin: https://app.example.com
Access-Control-Request-Method: PUT
```

Your server must respond with:
```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

---

## 7. Referrer-Policy (checkpoint 5.9)

### Purpose
Controls how much referrer information is sent when navigating from your site to another. Without this header, the full URL (including query parameters) may leak to third-party sites.

### Header Format
```
Referrer-Policy: strict-origin-when-cross-origin
```

### Valid Values

| Value                             | Cross-Origin Sends          | Same-Origin Sends |
|-----------------------------------|-----------------------------|--------------------|
| `no-referrer`                     | Nothing                     | Nothing            |
| `no-referrer-when-downgrade`      | Full URL (HTTPS to HTTPS only) | Full URL        |
| `origin`                          | Origin only                 | Origin only        |
| `origin-when-cross-origin`        | Origin only                 | Full URL           |
| `same-origin`                     | Nothing                     | Full URL           |
| `strict-origin`                   | Origin (HTTPS to HTTPS only)| Origin only        |
| `strict-origin-when-cross-origin` | Origin (HTTPS to HTTPS only)| Full URL           |
| `unsafe-url`                      | Full URL always             | Full URL           |

### Scoring

| Condition                     | Result |
|-------------------------------|--------|
| Any safe value present        | Pass |
| Missing header                | Fail |
| `unsafe-url`                  | Fail |

### Recommended Value
**`strict-origin-when-cross-origin`** is the best default:
- Same-origin navigation: sends full URL (useful for analytics)
- Cross-origin HTTPS to HTTPS: sends only origin (no path/query leakage)
- HTTPS to HTTP: sends nothing (prevents downgrade leakage)

This is also the default browser behavior in modern browsers, but setting the header explicitly ensures consistency and scores points.

### Why unsafe-url Is Dangerous
```
# User visits: https://example.com/account?token=secret123
# Clicks a link to https://external.com

# With unsafe-url:
Referer: https://example.com/account?token=secret123   # Token leaked!

# With strict-origin-when-cross-origin:
Referer: https://example.com                            # Safe: only origin
```
