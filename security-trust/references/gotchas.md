# Security & Trust Gotchas

Common pitfalls that cause Security & Trust checkpoint failures. Every gotcha includes WRONG and CORRECT examples.

---

## 1. HSTS max-age Too Short

A short `max-age` means browsers only remember the HSTS policy briefly, leaving users vulnerable between visits.

### WRONG
```
Strict-Transport-Security: max-age=86400
```
This is only 1 day. Score: **10/20** (partial credit).

```
Strict-Transport-Security: max-age=604800
```
This is only 1 week. Score: **10/20** (partial credit).

### CORRECT
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
This is 1 year (31,536,000 seconds) with `includeSubDomains`. Score: **20/20**.

### Quick Reference
| Value     | Duration | Enough? |
|-----------|----------|---------|
| 86400     | 1 day    | No      |
| 604800    | 1 week   | No      |
| 2592000   | 30 days  | No      |
| 31536000  | 1 year   | Yes     |
| 63072000  | 2 years  | Yes     |

---

## 2. HSTS Without includeSubDomains

Missing `includeSubDomains` means subdomains (api.example.com, admin.example.com) are not protected by HSTS and can still be accessed over HTTP.

### WRONG
```
Strict-Transport-Security: max-age=31536000
```
Score: **16/20** — loses 4 points.

### CORRECT
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
Score: **20/20**.

### Why It Matters
An attacker who controls a subdomain (or a compromised subdomain) could be used as a stepping stone for cookie theft if that subdomain serves over HTTP.

---

## 3. CSP With Only Trivial Directives

A CSP that only contains `upgrade-insecure-requests` or `block-all-mixed-content` does not protect against XSS.

### WRONG
```
Content-Security-Policy: upgrade-insecure-requests
```
Score: **5/15** — trivial directive only.

```
Content-Security-Policy: block-all-mixed-content
```
Score: **5/15** — trivial directive only.

```
Content-Security-Policy: upgrade-insecure-requests; block-all-mixed-content
```
Score: **5/15** — still only trivial directives.

### CORRECT
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'
```
Score: **15/15** — meaningful directives that actually restrict script sources.

### What Makes CSP "Meaningful"
The scanner checks for directives that restrict resource loading:
- `default-src` — yes, this counts
- `script-src` — yes, this counts
- `style-src` — yes, this counts
- `img-src` — yes, this counts
- `upgrade-insecure-requests` — no, this is trivial
- `block-all-mixed-content` — no, this is trivial

At least one non-trivial directive is required for full points.

---

## 4. X-Frame-Options ALLOW-FROM (Deprecated)

`ALLOW-FROM` was never standardized and is not supported by Chrome, Firefox, or Edge. Sites relying on it have no frame protection in modern browsers.

### WRONG
```
X-Frame-Options: ALLOW-FROM https://trusted.example.com
```
This is ignored by Chrome and Firefox. Your site is effectively unprotected. Score: **0/5**.

### CORRECT — Option A: X-Frame-Options
```
X-Frame-Options: DENY
```
Or:
```
X-Frame-Options: SAMEORIGIN
```

### CORRECT — Option B: CSP frame-ancestors (supports specific origins)
```
Content-Security-Policy: frame-ancestors 'self' https://trusted.example.com
```
This is the modern replacement for `ALLOW-FROM` — it actually works in all browsers.

### CORRECT — Option C: Both
```
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self' https://trusted.example.com
```
When both are present, CSP `frame-ancestors` takes precedence in modern browsers, and `X-Frame-Options` serves as a fallback.

---

## 5. CORS Wildcard on Authenticated Endpoints

Using `Access-Control-Allow-Origin: *` is fine for public content but risky on endpoints that handle authentication.

### WRONG
```
# On an API endpoint that reads cookies/tokens:
Access-Control-Allow-Origin: *
```
Score: **7/10** — works but suboptimal.

Even worse:
```
# This is a spec violation — browsers will reject the response:
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```
The CORS spec forbids wildcard origin with credentials. Browsers block the response entirely.

### CORRECT — For public APIs
```
# No Access-Control-Allow-Origin header at all
# (browsers enforce Same-Origin Policy by default)
```
Score: **10/10**.

### CORRECT — For APIs that need cross-origin access
```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```
Score: **10/10** — specific origin with credentials.

### CORRECT — Dynamic origin matching
```nginx
# Nginx — validate origin against allowlist
map $http_origin $cors_origin {
    default "";
    "https://app.example.com"   $http_origin;
    "https://admin.example.com" $http_origin;
}

add_header Access-Control-Allow-Origin $cors_origin always;
```

### Common Mistake: Reflecting Any Origin
```nginx
# WRONG — reflects any origin, equivalent to wildcard but worse
add_header Access-Control-Allow-Origin $http_origin always;
```
This reflects any origin including malicious ones. Always validate against an allowlist.

---

## 6. Referrer-Policy: unsafe-url

`unsafe-url` sends the full URL (including path and query parameters) to all destinations, even on HTTPS-to-HTTP downgrades.

### WRONG
```
Referrer-Policy: unsafe-url
```
Score: **0/10** — explicitly flagged as unsafe.

This leaks sensitive data:
```
# User visits: https://example.com/account?session=abc123
# Clicks link to: http://external.com
# External receives: Referer: https://example.com/account?session=abc123
```

### CORRECT
```
Referrer-Policy: strict-origin-when-cross-origin
```
Score: **10/10**.

Same scenario:
```
# User visits: https://example.com/account?session=abc123
# Clicks link to: https://external.com
# External receives: Referer: https://example.com    (origin only — no path/query)
# Clicks link to: http://external.com
# External receives: (nothing — blocked because HTTPS→HTTP)
```

### All Safe Values
Any of these score 10/10:
- `no-referrer` — sends nothing ever
- `no-referrer-when-downgrade` — full URL for HTTPS→HTTPS, nothing for HTTPS→HTTP
- `origin` — always sends origin only
- `origin-when-cross-origin` — full URL same-origin, origin only cross-origin
- `same-origin` — full URL same-origin, nothing cross-origin
- `strict-origin` — origin for HTTPS→HTTPS, nothing for HTTPS→HTTP
- `strict-origin-when-cross-origin` — recommended default

---

## 7. Nginx add_header Without "always"

By default, Nginx's `add_header` only sends headers on 2xx and 3xx responses. Error pages (4xx, 5xx) won't have security headers.

### WRONG
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "DENY";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```
Headers only appear on 200 OK responses. A 404 page or 500 error won't have any security headers.

### CORRECT
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```
The `always` keyword ensures headers are sent on all response codes.

### Nginx Location Block Override
Another Nginx gotcha: if a `location` block has its own `add_header`, it overrides ALL `add_header` directives from the parent `server` block.

**WRONG:**
```nginx
server {
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    location /api/ {
        add_header Access-Control-Allow-Origin "https://app.example.com" always;
        # X-Content-Type-Options and X-Frame-Options are now GONE for /api/!
    }
}
```

**CORRECT:**
```nginx
server {
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    location /api/ {
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "DENY" always;
        add_header Access-Control-Allow-Origin "https://app.example.com" always;
    }
}
```
You must repeat all headers in any `location` block that adds its own `add_header`.

**Alternative:** Use the `ngx_http_headers_more_module` with `more_set_headers` which doesn't have this inheritance issue.

---

## Quick Checklist

Before deploying, verify you haven't fallen into these traps:

| Gotcha | How to Check |
|--------|-------------|
| HSTS max-age too short | `curl -sI ... \| grep -i strict-transport` — look for 31536000 |
| HSTS missing includeSubDomains | Same as above — look for `includeSubDomains` |
| CSP trivial only | `curl -sI ... \| grep -i content-security` — check for `default-src` or `script-src` |
| X-Frame-Options ALLOW-FROM | `curl -sI ... \| grep -i x-frame` — should be DENY or SAMEORIGIN |
| CORS wildcard | `curl -sI ... \| grep -i access-control` — no header is best |
| unsafe-url Referrer-Policy | `curl -sI ... \| grep -i referrer` — should NOT be unsafe-url |
| Nginx missing "always" | `curl -sI https://example.com/nonexistent-page \| grep -i strict` — check 404 has headers |
