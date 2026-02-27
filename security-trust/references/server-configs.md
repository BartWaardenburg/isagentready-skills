# Server Configurations for All Security Headers

Copy-paste configs that add all 7 security headers at once. Each config targets a perfect 75/75 score on the IsAgentReady.com Security & Trust category.

**Protections included in every config:**
1. HTTPS redirect (where applicable)
2. Strict-Transport-Security (HSTS) header
3. Content-Security-Policy (CSP) header
4. X-Content-Type-Options header
5. X-Frame-Options header
6. Referrer-Policy header
7. (CORS is secure by default — only add if you need cross-origin access)

---

## Nginx

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # --- Security Headers ---

    # HSTS (20 pts)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # CSP (15 pts) — adjust script-src/style-src for your site
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'" always;

    # X-Content-Type-Options (5 pts)
    add_header X-Content-Type-Options "nosniff" always;

    # Frame Protection (5 pts)
    add_header X-Frame-Options "DENY" always;

    # Referrer-Policy (10 pts)
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CORS — omit for 10 pts (secure default), or set specific origin:
    # add_header Access-Control-Allow-Origin "https://app.example.com" always;

    # --- End Security Headers ---

    root /var/www/example.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Important:** The `always` keyword ensures headers are sent on all response codes (2xx, 3xx, 4xx, 5xx). Without it, Nginx only sends `add_header` on 2xx and 3xx responses.

---

## Apache (.htaccess)

```apache
# HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# --- Security Headers ---

# HSTS (20 pts)
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

# CSP (15 pts) — adjust for your site
Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"

# X-Content-Type-Options (5 pts)
Header always set X-Content-Type-Options "nosniff"

# Frame Protection (5 pts)
Header always set X-Frame-Options "DENY"

# Referrer-Policy (10 pts)
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

**Requires:** `mod_headers` and `mod_rewrite` enabled:
```bash
sudo a2enmod headers rewrite
sudo systemctl restart apache2
```

---

## Caddy

```
example.com {
    # HTTPS is automatic with Caddy — no config needed for certificate

    # --- Security Headers ---
    header {
        # HSTS (20 pts)
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

        # CSP (15 pts) — adjust for your site
        Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"

        # X-Content-Type-Options (5 pts)
        X-Content-Type-Options "nosniff"

        # Frame Protection (5 pts)
        X-Frame-Options "DENY"

        # Referrer-Policy (10 pts)
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    root * /var/www/example.com
    file_server
}
```

**Note:** Caddy automatically provisions and renews TLS certificates. HSTS is also enabled by default, but setting it explicitly with the full directive ensures maximum points.

---

## Vercel (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.vercel-insights.com https://*.vercel-analytics.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Note:** Vercel handles HTTPS automatically. The CSP includes Vercel Analytics domains — remove them if you don't use Vercel Analytics. Vercel's framework may require `'unsafe-inline'` and `'unsafe-eval'` for script-src depending on your framework.

---

## Netlify (_headers)

Create a `_headers` file in your publish directory:

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
```

Or in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**Note:** Netlify handles HTTPS automatically.

---

## Cloudflare Workers

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch(request);
  const newResponse = new Response(response.body, response);

  // HSTS (20 pts)
  newResponse.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // CSP (15 pts) — adjust for your site
  newResponse.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
  );

  // X-Content-Type-Options (5 pts)
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');

  // Frame Protection (5 pts)
  newResponse.headers.set('X-Frame-Options', 'DENY');

  // Referrer-Policy (10 pts)
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return newResponse;
}
```

**Alternative: Cloudflare Transform Rules** (no code needed):
1. Dashboard → Rules → Transform Rules → Modify Response Header
2. Add each header as a static "Set" rule
3. Apply to all requests or specific paths

---

## Express.js (with Helmet)

```javascript
const express = require('express');
const helmet = require('helmet');

const app = express();

// Helmet sets most security headers with sensible defaults
app.use(helmet({
  // HSTS (20 pts)
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  // CSP (15 pts) — adjust for your site
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  // X-Content-Type-Options (5 pts) — enabled by default
  noSniff: true,
  // Frame Protection (5 pts)
  frameguard: { action: 'deny' },
  // Referrer-Policy (10 pts)
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

app.listen(3000);
```

**Without Helmet** (manual headers):
```javascript
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

---

## Next.js (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

**Note:** Next.js requires `'unsafe-inline'` and `'unsafe-eval'` in script-src for its runtime. For stricter CSP with Next.js, use nonce-based CSP via middleware — see [Next.js CSP docs](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy).

---

## Django

### settings.py (SecurityMiddleware)

```python
# --- Security Settings ---

# HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS (20 pts)
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# X-Content-Type-Options (5 pts) — enabled by default in Django
SECURE_CONTENT_TYPE_NOSNIFF = True

# Referrer-Policy (10 pts)
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# Frame Protection (5 pts) — Django sets X-Frame-Options by default
X_FRAME_OPTIONS = "DENY"
```

### CSP with django-csp

```bash
pip install django-csp
```

```python
# settings.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'csp.middleware.CSPMiddleware',  # Add after SecurityMiddleware
    # ... rest of middleware
]

# CSP (15 pts)
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'",)
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
CSP_IMG_SRC = ("'self'", "data:", "https:")
CSP_FONT_SRC = ("'self'",)
CSP_CONNECT_SRC = ("'self'",)
CSP_FRAME_ANCESTORS = ("'none'",)
CSP_OBJECT_SRC = ("'none'",)
CSP_BASE_URI = ("'self'",)
```

### CORS with django-cors-headers (optional)

```bash
pip install django-cors-headers
```

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be before CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    # ...
]

# Specific origins (10 pts) — do NOT use CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "https://app.example.com",
]
```

---

## Verification

After applying any config, verify all headers:

```bash
curl -sI https://example.com/ | grep -iE '(strict-transport|content-security|x-content-type|x-frame|access-control-allow-origin|referrer-policy)'
```

Expected output (CORS line only appears if you set it):
```
strict-transport-security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self'; ...
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin
```
