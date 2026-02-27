# Common Gotchas — AI Content Discovery

Frequent mistakes that cause IsAgentReady checkpoint failures, with wrong and correct examples for each.

---

## 1. robots.txt Returns HTML Instead of Plain Text

Your web server serves the 404 error page (HTML) when `/robots.txt` doesn't exist as a file, but returns HTTP 200 instead of 404.

**WRONG:**
```
$ curl -s https://example.com/robots.txt | head -3
<!DOCTYPE html>
<html>
<head><title>404 Not Found</title></head>
```
The server returns HTML with a 200 status. The scanner sees this as an invalid robots.txt.

**CORRECT:**
```
$ curl -s https://example.com/robots.txt | head -3
User-agent: *
Allow: /

```
A plain text file with valid robots.txt directives.

**Fix:** Create an actual `robots.txt` file in your web root. If using a framework, add a static file route or controller for `/robots.txt`.

---

## 2. Wrong Content-Type for robots.txt

The file content is correct, but the server sends the wrong Content-Type header.

**WRONG:**
```
$ curl -sI https://example.com/robots.txt | grep -i content-type
Content-Type: text/html; charset=utf-8
```

**CORRECT:**
```
$ curl -sI https://example.com/robots.txt | grep -i content-type
Content-Type: text/plain; charset=utf-8
```

**Fix:** Configure your web server to serve `/robots.txt` as `text/plain`:
```nginx
# Nginx
location = /robots.txt {
  default_type text/plain;
}
```
```apache
# Apache
<Files "robots.txt">
  ForceType text/plain
</Files>
```

---

## 3. Wildcard Disallow Blocks All AI Crawlers

A blanket `Disallow: /` for all user-agents blocks everything, including AI crawlers, unless you add specific overrides.

**WRONG:**
```
User-agent: *
Disallow: /
```
This blocks all crawlers from accessing any page. AI crawlers that don't have their own explicit block will fall back to this rule and be blocked.

**CORRECT:**
```
User-agent: *
Disallow: /

# But allow AI crawlers explicitly (specific rules override wildcard)
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: ChatGPT-User
Allow: /
```
Specific user-agent rules take precedence over the wildcard block.

**Also correct** — if you don't need to block anything:
```
User-agent: *
Allow: /
```

---

## 4. Sitemap Is Not Valid XML

The scanner checks for `<urlset>` or `<sitemapindex>` elements. A file that isn't valid XML won't pass.

**WRONG — JSON sitemap:**
```json
{
  "urls": [
    {"loc": "https://example.com/"},
    {"loc": "https://example.com/about"}
  ]
}
```

**WRONG — HTML page at sitemap URL:**
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Sitemap</h1>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</body>
</html>
```

**WRONG — Plain text list:**
```
https://example.com/
https://example.com/about
https://example.com/products
```

**CORRECT:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2025-01-15</lastmod>
  </url>
  <url>
    <loc>https://example.com/about</loc>
  </url>
</urlset>
```

**Fix:** Use the standard sitemaps.org XML format. Most frameworks have plugins that generate this automatically.

---

## 5. Sitemap Directive Missing from robots.txt

You have a valid sitemap, but crawlers can't find it because it's not referenced in robots.txt.

**WRONG:**
```
User-agent: *
Allow: /
```
No `Sitemap:` directive — crawlers must guess the URL.

**CORRECT:**
```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

**Note:** The scanner also checks `/sitemap.xml` and `/sitemap_index.xml` as fallbacks, but including the directive in robots.txt is best practice and helps crawlers find sitemaps at non-standard URLs.

---

## 6. llms.txt Without URLs

The file exists but doesn't contain any links. The scanner requires at least one `http://` or `https://` URL.

**WRONG:**
```markdown
# My Company

We build amazing products for developers.

## About
We were founded in 2020 and have grown to 50 employees.

## Products
Our main product is a developer tool.
```
No URLs — this is just a description without any links to actual pages.

**CORRECT:**
```markdown
# My Company

> We build amazing products for developers.

## About
- [About Us](https://example.com/about)
- [Team](https://example.com/team)

## Products
- [Developer Tool](https://example.com/products/dev-tool)
- [API Reference](https://example.com/docs/api)
```
Contains markdown links with full URLs.

---

## 7. llms.txt Missing Heading

The file must start with a `#` markdown heading. Plain text without a heading fails validation.

**WRONG:**
```
My Company builds developer tools.

Links:
- https://example.com/docs
- https://example.com/api
```

**CORRECT:**
```markdown
# My Company

> My Company builds developer tools.

## Docs
- [Documentation](https://example.com/docs)
- [API Reference](https://example.com/api)
```

---

## 8. llms.txt Served as text/html

Common when a framework catches the `.txt` extension and renders it through a template engine.

**WRONG:**
```
$ curl -sI https://example.com/llms.txt | grep -i content-type
Content-Type: text/html; charset=utf-8
```

**CORRECT:**
```
$ curl -sI https://example.com/llms.txt | grep -i content-type
Content-Type: text/plain; charset=utf-8
```

**Also acceptable:**
```
Content-Type: text/markdown; charset=utf-8
```

**Fix:** Add explicit Content-Type configuration for `/llms.txt` in your server config, or serve it as a static file outside your framework's routing.

---

## 9. noai vs noindex — Different Severity

Both are restrictive, but they have very different impact on your score.

**`noai` — Partial penalty (8/15 points):**
```html
<meta name="robots" content="index, follow, noai">
```
The page is still indexed by search engines, but signals it shouldn't be used for AI training. You lose 7 points.

**`noindex` — Full penalty (0/15 points):**
```html
<meta name="robots" content="noindex, nofollow">
```
The page is completely hidden from all indexing. You lose all 15 points.

**CORRECT — No restrictions (15/15 points):**
```html
<meta name="robots" content="index, follow">
```
Or simply omit the meta tag entirely — the default is `index, follow`.

---

## 10. X-Robots-Tag Header Overriding Permissive Meta Tag

Your HTML says `index, follow` but a server-level header adds restrictions.

**WRONG:**
```html
<!-- In HTML: -->
<meta name="robots" content="index, follow">
```
```
# But the server sends:
X-Robots-Tag: noindex
```
The scanner checks both — the `noindex` from the header will fail the checkpoint.

**CORRECT:** Make sure both the meta tag and X-Robots-Tag header agree, or remove the restrictive header:
```nginx
# Nginx — remove restrictive header
# Remove: add_header X-Robots-Tag "noindex";
# Replace with:
add_header X-Robots-Tag "index, follow";
```

---

## 11. WAF Blocking AI Crawlers with Generic Bot Protection

Many WAF/CDN services (Cloudflare, Akamai, Sucuri) have "bot protection" features that block all automated traffic, including legitimate AI crawlers.

**WRONG — Cloudflare "Bot Fight Mode" blocking everything:**
```
$ curl -sI -A "Mozilla/5.0 (compatible; GPTBot/1.0)" https://example.com/
HTTP/2 403
```

**CORRECT — Allowlist AI crawlers in WAF rules:**
```
# Cloudflare: Security -> WAF -> Custom Rules
# Create rule: IF User-Agent contains "GPTBot" THEN Skip
# Create rule: IF User-Agent contains "ClaudeBot" THEN Skip
```

**Verify after fixing:**
```bash
curl -sI -A "Mozilla/5.0 (compatible; GPTBot/1.0)" https://example.com/
# Should return HTTP 200
```

---

## 12. robots.txt Disallow with Empty Value vs Disallow Root

These look similar but mean completely different things.

**Allows everything (empty path = no restriction):**
```
User-agent: GPTBot
Disallow:
```
Per RFC 9309, an empty Disallow value means "disallow nothing" — effectively allowing full access.

**Blocks everything (root path = block all):**
```
User-agent: GPTBot
Disallow: /
```
Blocks the entire site for GPTBot.

**Tip:** Use explicit `Allow: /` instead of `Disallow:` (empty) to make intent clear.
