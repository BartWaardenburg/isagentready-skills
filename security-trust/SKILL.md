---
name: security-trust
description: Fixes security and trust issues — configures HTTPS, HSTS, Content-Security-Policy, X-Content-Type-Options, frame protection, CORS, and Referrer-Policy headers so AI agents and platforms trust the website for interaction. Use when asked to "fix security headers", "add HSTS", "configure CSP", "fix HTTPS", "improve security score", "add security headers", "fix CORS", "add Referrer-Policy", or any security header configuration task.
---

# Security & Trust

Fixes Category 5 (Security & Trust, 15% weight) issues from [IsAgentReady.com](https://isagentready.com). This category checks whether AI agents and platforms can trust your website for secure interaction. It evaluates 7 checkpoints worth 75 points total.

## When to Use

- Fixing HTTPS or SSL certificate issues
- Adding or configuring HSTS (Strict-Transport-Security)
- Creating or improving Content-Security-Policy
- Adding X-Content-Type-Options, X-Frame-Options, or frame-ancestors
- Fixing CORS configuration (Access-Control-Allow-Origin)
- Adding or fixing Referrer-Policy headers
- Any task to "improve security score" or "add security headers"

## When NOT to Use

- Fixing robots.txt, sitemaps, or AI crawler access (use `ai-content-discovery` skill)
- Adding structured data / JSON-LD (use `structured-data` skill)
- Fixing semantic HTML or heading hierarchy (use `content-semantics` skill)
- Setting up agent protocols like WebMCP or A2A (use `agent-protocols` skill)

## Checkpoints Overview

| ID  | Checkpoint              | Max Points | What It Tests                                              |
|-----|-------------------------|------------|------------------------------------------------------------|
| 5.1 | HTTPS                   | 10         | Final URL uses https://, valid SSL certificate             |
| 5.3 | HSTS header             | 20         | Strict-Transport-Security with max-age and includeSubDomains |
| 5.4 | Content-Security-Policy | 15         | CSP header with meaningful directives                      |
| 5.5 | X-Content-Type-Options  | 5          | Must be exactly "nosniff"                                  |
| 5.6 | Frame protection        | 5          | X-Frame-Options or CSP frame-ancestors                     |
| 5.7 | CORS configuration      | 10         | Access-Control-Allow-Origin (absence or specific origin)   |
| 5.9 | Referrer-Policy         | 10         | Header present with a safe value                           |

---

## Fix All Headers at Once

The fastest path to a perfect security score is adding all 7 headers in a single configuration change.

> See [references/server-configs.md](references/server-configs.md) for complete copy-paste configs for Nginx, Apache, Caddy, Vercel, Netlify, Cloudflare Workers, Express.js, Next.js, and Django.

After applying your config, verify all headers at once:

```bash
curl -sI https://example.com/ | grep -iE '(strict-transport|content-security|x-content-type|x-frame|access-control|referrer-policy)'
```

---

## Checkpoint 5.1: HTTPS (10 pts)

**What passes:** Final URL uses `https://` with a valid SSL certificate (10 pts).
**Partial credit:** HTTPS with an invalid/expired certificate (4 pts).
**What fails:** HTTP without redirect to HTTPS (0 pts).

**Why it matters:** HTTPS is the baseline for secure communication. AI agents and crawlers refuse to interact with insecure sites — no agent framework will send credentials or user data over plain HTTP.

### Fix Workflow

1. **Check current state:**
   ```bash
   curl -sI http://example.com/ | head -10
   curl -sI https://example.com/ | head -10
   ```

2. **Install a free SSL certificate with Certbot (Let's Encrypt):**
   ```bash
   # Ubuntu/Debian with Nginx
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d example.com -d www.example.com

   # Ubuntu/Debian with Apache
   sudo apt install certbot python3-certbot-apache
   sudo certbot --apache -d example.com -d www.example.com
   ```

3. **Force HTTPS redirect:**

   **Nginx:**
   ```nginx
   server {
     listen 80;
     server_name example.com www.example.com;
     return 301 https://$host$request_uri;
   }
   ```

   **Apache (`.htaccess`):**
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

4. **Set up auto-renewal:**
   ```bash
   sudo certbot renew --dry-run
   # Certbot adds a cron/systemd timer automatically
   ```

5. **Verify:**
   ```bash
   curl -sI https://example.com/ | head -5
   # Should show HTTP/2 200 or HTTP/1.1 200
   ```

**References:** [Let's Encrypt](https://letsencrypt.org/getting-started/), [web.dev: Why HTTPS Matters](https://web.dev/why-https-matters/)

---

## Checkpoint 5.3: HSTS Header (20 pts)

**What passes:** `Strict-Transport-Security` header with `max-age>=31536000` and `includeSubDomains` (20 pts).
**Partial credit:** `max-age>=31536000` without `includeSubDomains` (16 pts), or short `max-age` (10 pts).
**What fails:** Header missing or `max-age=0` (0 pts).

**Why it matters:** HSTS prevents protocol downgrade attacks and SSL stripping. It tells browsers to always use HTTPS, even if a user types `http://`. Without HSTS, a man-in-the-middle can intercept the initial HTTP request before the redirect.

### Fix Workflow

1. **Check current state:**
   ```bash
   curl -sI https://example.com/ | grep -i strict-transport
   ```

2. **Add the HSTS header:**

   **Nginx:**
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
   ```

   **Apache:**
   ```apache
   Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
   ```

   **Caddy** (automatic — HSTS is enabled by default).

3. **Verify:**
   ```bash
   curl -sI https://example.com/ | grep -i strict-transport
   # Expected: strict-transport-security: max-age=31536000; includeSubDomains; preload
   ```

4. **Optional: submit to HSTS preload list** at [hstspreload.org](https://hstspreload.org) — this hardcodes HSTS into browsers so even the first visit is forced HTTPS.

> See [references/security-headers.md](references/security-headers.md) for max-age math and the preload submission process.
> See [references/gotchas.md](references/gotchas.md) for the "max-age too short" pitfall.

**References:** [MDN: Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security), [HSTS Preload List](https://hstspreload.org)

---

## Checkpoint 5.4: Content-Security-Policy (15 pts)

**What passes:** CSP header with meaningful directives like `default-src`, `script-src`, `style-src` (15 pts).
**Partial credit:** CSP header with only trivial directives (`upgrade-insecure-requests` or `block-all-mixed-content`) (5 pts).
**What fails:** No CSP header (0 pts).

**Why it matters:** CSP prevents XSS and code injection attacks. For AI agents, CSP ensures the content they read hasn't been tampered with by injected scripts — it's a signal that the site maintains content integrity.

### Fix Workflow

1. **Check current state:**
   ```bash
   curl -sI https://example.com/ | grep -i content-security-policy
   ```

2. **Add a starter CSP** — restrictive but practical:

   **Nginx:**
   ```nginx
   add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'" always;
   ```

   **Apache:**
   ```apache
   Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'"
   ```

3. **If you use third-party scripts** (analytics, CDNs), whitelist them:
   ```
   script-src 'self' https://cdn.example.com https://www.googletagmanager.com;
   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
   font-src 'self' https://fonts.gstatic.com;
   img-src 'self' data: https:;
   connect-src 'self' https://api.example.com;
   ```

4. **Test before enforcing** — use `Content-Security-Policy-Report-Only` first:
   ```nginx
   add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self'; report-uri /csp-report" always;
   ```

5. **Verify:**
   ```bash
   curl -sI https://example.com/ | grep -i content-security-policy
   # Should show meaningful directives, not just upgrade-insecure-requests
   ```

> See [references/security-headers.md](references/security-headers.md) for the full directive reference and nonce-based CSP.
> See [references/gotchas.md](references/gotchas.md) for the "trivial CSP" pitfall.

**References:** [MDN: Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy), [OWASP: CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---

## Checkpoint 5.5: X-Content-Type-Options (5 pts)

**What passes:** Header value is exactly `nosniff` (5 pts).
**What fails:** Header missing or any other value (0 pts).

**Why it matters:** Prevents MIME type sniffing attacks where browsers interpret files as a different content type than declared, potentially executing malicious code disguised as harmless files.

### Fix Workflow

1. **Check current state:**
   ```bash
   curl -sI https://example.com/ | grep -i x-content-type
   ```

2. **Add the header:**

   **Nginx:**
   ```nginx
   add_header X-Content-Type-Options "nosniff" always;
   ```

   **Apache:**
   ```apache
   Header always set X-Content-Type-Options "nosniff"
   ```

3. **Verify:**
   ```bash
   curl -sI https://example.com/ | grep -i x-content-type
   # Expected: x-content-type-options: nosniff
   ```

**References:** [MDN: X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

---

## Checkpoint 5.6: Frame Protection (5 pts)

**What passes:** `X-Frame-Options: DENY` or `SAMEORIGIN`, OR CSP `frame-ancestors` directive (5 pts).
**What fails:** Neither header present (0 pts).

**Why it matters:** Prevents clickjacking attacks where your site is embedded in a malicious iframe. This protects users who follow AI-suggested links from being tricked into interacting with hidden content.

### Fix Workflow

1. **Check current state:**
   ```bash
   curl -sI https://example.com/ | grep -iE '(x-frame-options|frame-ancestors)'
   ```

2. **Add frame protection** — choose one approach:

   **Option A: X-Frame-Options (widely supported):**
   ```nginx
   # Nginx
   add_header X-Frame-Options "DENY" always;
   ```
   ```apache
   # Apache
   Header always set X-Frame-Options "DENY"
   ```

   **Option B: CSP frame-ancestors (modern, more flexible):**
   ```nginx
   # Add to your existing CSP:
   add_header Content-Security-Policy "frame-ancestors 'none'; ..." always;
   ```

   **Option C: Both (belt and suspenders):**
   ```nginx
   add_header X-Frame-Options "DENY" always;
   add_header Content-Security-Policy "frame-ancestors 'none'; default-src 'self'" always;
   ```

3. **If your site needs to be embedded** by specific origins:
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN" always;
   # Or with CSP (more precise):
   add_header Content-Security-Policy "frame-ancestors 'self' https://trusted.example.com" always;
   ```

4. **Verify:**
   ```bash
   curl -sI https://example.com/ | grep -iE '(x-frame|frame-ancestors)'
   ```

> See [references/gotchas.md](references/gotchas.md) for the deprecated `ALLOW-FROM` pitfall.

**References:** [MDN: X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options), [MDN: CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)

---

## Checkpoint 5.7: CORS Configuration (10 pts)

**What passes:** No `Access-Control-Allow-Origin` header (secure default, 10 pts), or specific origin (10 pts).
**Partial credit:** Wildcard `*` (7 pts).
**What fails:** N/A — any response scores at least 7 if the header is present.

**Why it matters:** CORS controls which origins can make cross-origin requests to your site. Proper configuration protects your APIs while allowing legitimate agent integrations. A wildcard `*` isn't dangerous for public content but signals less intentional security posture.

### Fix Workflow

1. **Check current state:**
   ```bash
   curl -sI https://example.com/ | grep -i access-control-allow-origin
   ```

2. **If no header is present** — you already score 10/10. No action needed.

3. **If you see `Access-Control-Allow-Origin: *`** and want full points — restrict to specific origins:

   **Nginx:**
   ```nginx
   # Instead of: add_header Access-Control-Allow-Origin "*";
   # Use a map for dynamic origin matching:
   map $http_origin $cors_origin {
     default "";
     "https://app.example.com" $http_origin;
     "https://agent.example.com" $http_origin;
   }

   add_header Access-Control-Allow-Origin $cors_origin always;
   ```

   **Express.js:**
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: ['https://app.example.com', 'https://agent.example.com']
   }));
   ```

4. **If you need wildcard for a public API** — that's fine, you still get 7/10.

5. **Verify:**
   ```bash
   curl -sI -H "Origin: https://app.example.com" https://example.com/api/ | grep -i access-control
   ```

> See [references/gotchas.md](references/gotchas.md) for the "wildcard on authenticated endpoints" pitfall.

**References:** [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## Checkpoint 5.9: Referrer-Policy (10 pts)

**What passes:** `Referrer-Policy` header present with a safe value (10 pts).
**What fails:** Header missing (0 pts) or value is `unsafe-url` (0 pts).

**Safe values:** `no-referrer`, `no-referrer-when-downgrade`, `origin`, `origin-when-cross-origin`, `same-origin`, `strict-origin`, `strict-origin-when-cross-origin`.

**Why it matters:** Controls what referrer information leaks to third parties. Without it, full URLs (including query parameters with tokens, session IDs) may be sent to external sites.

### Fix Workflow

1. **Check current state:**
   ```bash
   curl -sI https://example.com/ | grep -i referrer-policy
   ```

2. **Add the header** — `strict-origin-when-cross-origin` is the recommended default:

   **Nginx:**
   ```nginx
   add_header Referrer-Policy "strict-origin-when-cross-origin" always;
   ```

   **Apache:**
   ```apache
   Header always set Referrer-Policy "strict-origin-when-cross-origin"
   ```

3. **Verify:**
   ```bash
   curl -sI https://example.com/ | grep -i referrer-policy
   # Expected: referrer-policy: strict-origin-when-cross-origin
   ```

> See [references/gotchas.md](references/gotchas.md) for the "unsafe-url" pitfall.

**References:** [MDN: Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)

---

## Key Gotchas

Common mistakes that cause checkpoint failures:

1. **HSTS max-age too short** — `max-age=86400` (1 day) scores only 10/20; use `max-age=31536000` (1 year)
2. **CSP with only trivial directives** — `upgrade-insecure-requests` alone scores only 5/15
3. **HSTS without includeSubDomains** — scores 16/20 instead of 20/20
4. **X-Frame-Options ALLOW-FROM** — deprecated, not supported by modern browsers; use CSP `frame-ancestors` instead
5. **CORS wildcard on auth endpoints** — `Access-Control-Allow-Origin: *` on endpoints that use cookies or tokens
6. **unsafe-url Referrer-Policy** — leaks full URLs including query parameters; scores 0/10
7. **Nginx add_header without "always"** — headers only sent on 2xx responses, missing on 3xx/4xx/5xx

> See [references/gotchas.md](references/gotchas.md) for detailed correct vs incorrect examples of each.

---

## References

- [security-headers.md](references/security-headers.md) — Deep dive on all 7 headers: purpose, valid values, scoring, impact
- [server-configs.md](references/server-configs.md) — Copy-paste configs for Nginx, Apache, Caddy, Vercel, Netlify, Cloudflare, Express, Next.js, Django
- [gotchas.md](references/gotchas.md) — Common pitfalls with wrong vs correct examples

## Instructions

1. **Identify failing checkpoints** from the IsAgentReady.com scan results
2. **For the fastest fix**, use the "Fix All Headers at Once" section with a server config from [references/server-configs.md](references/server-configs.md)
3. **For individual fixes**, follow the fix workflow for each failing checkpoint
4. **Verify all headers** with the curl command in the "Fix All Headers at Once" section
5. **Re-scan** at [isagentready.com](https://isagentready.com) to confirm improvements

If `$ARGUMENTS` is provided, interpret it as the URL to fix or the specific checkpoint to address.
