---
name: ai-content-discovery
description: Fixes AI content discovery issues — creates and optimizes robots.txt, AI crawler directives, XML sitemaps, llms.txt, and meta robots tags so AI systems can find, crawl, and understand website content. Use when asked to "fix robots.txt", "add llms.txt", "create a sitemap", "allow AI crawlers", "fix AI discoverability", "improve AI content discovery score", "make site crawlable by AI", or any robots.txt, sitemap, or llms.txt task.
---

# AI Content Discovery

Fixes Category 1 (AI Content Discovery, 30% weight) issues from [IsAgentReady.com](https://isagentready.com). This category checks whether AI systems can find, crawl, and understand your website's content. It evaluates 6 checkpoints worth 90 points total.

## When to Use

- Fixing robots.txt issues (missing, wrong content type, blocking bots)
- Adding or updating AI crawler directives (GPTBot, ClaudeBot, etc.)
- Creating or fixing XML sitemaps
- Creating llms.txt or llms-full.txt files
- Removing restrictive meta robots tags (noindex, noai)
- Fixing WAF/CDN bot blocking issues
- Any task to "improve AI discoverability" or "make site crawlable by AI"

## When NOT to Use

- Adding structured data / JSON-LD (use `structured-data` skill)
- Fixing semantic HTML or heading hierarchy (use `content-semantics` skill)
- Setting up agent protocols like WebMCP or A2A (use `agent-protocols` skill)
- Configuring security headers like CSP or HSTS (use `security-trust` skill)

## Checkpoints Overview

| ID  | Checkpoint                  | Max Points | What It Tests                                                    |
|-----|-----------------------------|------------|------------------------------------------------------------------|
| 1.8 | HTTP bot accessibility      | 15         | Page returns HTTP 200-299 (not 401/403 from WAF)                |
| 1.1 | robots.txt present          | 15         | /robots.txt returns 200 with text/plain Content-Type            |
| 1.2 | AI crawler directives       | 15         | Allow/Disallow rules for 13 AI user-agents in robots.txt        |
| 1.3 | XML Sitemap                 | 15         | Valid XML sitemap with `<urlset>` or `<sitemapindex>`           |
| 1.4 | llms.txt                    | 15         | /llms.txt with markdown heading + URLs; bonus for /llms-full.txt|
| 1.5 | Meta robots / X-Robots-Tag  | 15         | No restrictive directives (noindex, noai, noimageai)            |

## Checkpoint 1.8: HTTP Bot Accessibility (15 pts)

**What passes:** HTTP status 200-299.
**What fails:** HTTP 401 or 403 (WAF/CDN blocking bots).

### Fix Workflow

1. **Diagnose** — test with an AI crawler user-agent:
   ```bash
   curl -sI -A "Mozilla/5.0 (compatible; GPTBot/1.0)" https://example.com/
   curl -sI -A "Mozilla/5.0 (compatible; ClaudeBot/1.0)" https://example.com/
   ```

2. **If blocked by Cloudflare** — create a WAF exception:
   ```
   # Dashboard -> Security -> WAF -> Custom Rules -> Create rule:
   #   Field: User Agent | Operator: contains | Value: GPTBot
   #   Action: Skip remaining rules
   #
   # Repeat for ClaudeBot, Amazonbot, ChatGPT-User, etc.
   ```

3. **If blocked by Nginx rate limiting** — allow AI user-agents:
   ```nginx
   map $http_user_agent $is_ai_bot {
     default         0;
     "~*GPTBot"      1;
     "~*ClaudeBot"   1;
     "~*Amazonbot"   1;
     "~*ChatGPT"     1;
   }

   # Skip rate limiting for AI bots
   limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

   server {
     location / {
       if ($is_ai_bot) {
         # Allow AI bots through without rate limits
       }
       limit_req zone=general burst=20;
     }
   }
   ```

4. **If blocked by Apache** — allow in `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTP_USER_AGENT} (GPTBot|ClaudeBot|Amazonbot) [NC]
   RewriteRule ^ - [L]
   ```

5. **Verify** — re-test with curl to confirm 200 response.

---

## Checkpoint 1.1: robots.txt Present (15 pts)

**What passes:** `/robots.txt` returns HTTP 200 with `Content-Type: text/plain`.
**What fails:** Missing file (404), HTML error page served, or wrong Content-Type.

### Fix Workflow

1. **Check current state:**
   ```bash
   curl -sI https://example.com/robots.txt | head -20
   ```

2. **Create `/robots.txt`** at your web root:
   ```
   User-agent: *
   Allow: /

   # Allow AI crawlers explicitly
   User-agent: GPTBot
   Allow: /

   User-agent: ClaudeBot
   Allow: /

   User-agent: Google-Extended
   Allow: /

   Sitemap: https://example.com/sitemap.xml
   ```

3. **Ensure correct Content-Type** — the server must return `text/plain`:

   **Nginx:**
   ```nginx
   location = /robots.txt {
     default_type text/plain;
   }
   ```

   **Apache (`.htaccess`):**
   ```apache
   <Files "robots.txt">
     ForceType text/plain
   </Files>
   ```

   **Express/Node.js:**
   ```javascript
   app.get('/robots.txt', (req, res) => {
     res.type('text/plain');
     res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
   });
   ```

4. **Verify:**
   ```bash
   curl -sI https://example.com/robots.txt | grep -i content-type
   # Expected: Content-Type: text/plain
   ```

> See [references/robots-txt-guide.md](references/robots-txt-guide.md) for complete robots.txt syntax and rules.

---

## Checkpoint 1.2: AI Crawler Directives (15 pts)

**What passes:** All 13 AI crawlers explicitly allowed (15 pts), or some allowed with none blocked (15 pts), or wildcard `Allow: /` with none blocked (15 pts).
**Partial credit:** No AI crawlers mentioned but default allow applies (10 pts), or mixed policies with some blocked (7 pts).
**What fails:** All AI crawlers explicitly disallowed (0 pts).

### The 13 AI User-Agents

| User-Agent          | Owner          | Purpose                        |
|---------------------|----------------|--------------------------------|
| GPTBot              | OpenAI         | Training data crawling         |
| ChatGPT-User        | OpenAI         | Real-time browsing in ChatGPT  |
| OAI-SearchBot       | OpenAI         | SearchGPT results              |
| ClaudeBot           | Anthropic      | Training data crawling         |
| Claude-User         | Anthropic      | Real-time browsing in Claude   |
| Claude-SearchBot    | Anthropic      | Claude search results          |
| Google-Extended     | Google         | Gemini AI training             |
| Amazonbot           | Amazon         | Alexa/AI training              |
| Bytespider          | ByteDance      | TikTok/AI training             |
| CCBot               | Common Crawl   | Open dataset crawling          |
| PerplexityBot       | Perplexity     | AI search results              |
| Applebot-Extended   | Apple          | Apple Intelligence training    |
| meta-externalagent  | Meta           | Meta AI training               |

### Fix Workflow

1. **Check current directives:**
   ```bash
   curl -s https://example.com/robots.txt
   ```

2. **Add explicit Allow directives** for each AI crawler to your robots.txt:
   ```
   # AI Crawlers — explicitly allow
   User-agent: GPTBot
   Allow: /

   User-agent: ChatGPT-User
   Allow: /

   User-agent: OAI-SearchBot
   Allow: /

   User-agent: ClaudeBot
   Allow: /

   User-agent: Claude-User
   Allow: /

   User-agent: Claude-SearchBot
   Allow: /

   User-agent: Google-Extended
   Allow: /

   User-agent: Amazonbot
   Allow: /

   User-agent: Bytespider
   Allow: /

   User-agent: CCBot
   Allow: /

   User-agent: PerplexityBot
   Allow: /

   User-agent: Applebot-Extended
   Allow: /

   User-agent: meta-externalagent
   Allow: /
   ```

3. **If you want to allow all crawlers** — a simple wildcard also works:
   ```
   User-agent: *
   Allow: /
   ```

4. **If you want selective control** — allow some, block others:
   ```
   # Allow search-oriented AI crawlers
   User-agent: ChatGPT-User
   Allow: /

   User-agent: PerplexityBot
   Allow: /

   # Block training-oriented crawlers
   User-agent: GPTBot
   Disallow: /

   User-agent: CCBot
   Disallow: /
   ```

> See [references/robots-txt-guide.md](references/robots-txt-guide.md) for full syntax and AI user-agent details.

---

## Checkpoint 1.3: XML Sitemap (15 pts)

**What passes:** Valid XML sitemap found at a discoverable URL with `<urlset>` or `<sitemapindex>`.
**What fails:** No sitemap found, or sitemap is not valid XML.

The scanner checks these locations in order:
1. URLs from `Sitemap:` directives in robots.txt
2. `/sitemap.xml`
3. `/sitemap_index.xml`

### Fix Workflow

1. **Check if a sitemap exists:**
   ```bash
   curl -sI https://example.com/sitemap.xml | head -5
   curl -s https://example.com/robots.txt | grep -i sitemap
   ```

2. **Create `/sitemap.xml`:**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://example.com/</loc>
       <lastmod>2025-01-15</lastmod>
       <changefreq>weekly</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>https://example.com/about</loc>
       <lastmod>2025-01-10</lastmod>
     </url>
   </urlset>
   ```

3. **For large sites, use a sitemap index:**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <sitemap>
       <loc>https://example.com/sitemap-pages.xml</loc>
       <lastmod>2025-01-15</lastmod>
     </sitemap>
     <sitemap>
       <loc>https://example.com/sitemap-blog.xml</loc>
       <lastmod>2025-01-14</lastmod>
     </sitemap>
   </sitemapindex>
   ```

4. **Add the Sitemap directive to robots.txt:**
   ```
   Sitemap: https://example.com/sitemap.xml
   ```

5. **Verify the sitemap is valid XML:**
   ```bash
   curl -s https://example.com/sitemap.xml | head -5
   # Should start with <?xml and contain <urlset or <sitemapindex
   ```

### Framework-Specific Generation

Most frameworks have sitemap plugins — prefer automated generation over manual files:

- **WordPress:** Yoast SEO or built-in (`/wp-sitemap.xml`)
- **Next.js:** `next-sitemap` package or App Router `sitemap.ts`
- **Rails:** `sitemap_generator` gem
- **Django:** `django.contrib.sitemaps`
- **Laravel:** `spatie/laravel-sitemap`
- **Phoenix/Elixir:** Custom plug or controller route

---

## Checkpoint 1.4: llms.txt (15 pts)

**What passes:** `/llms.txt` returns HTTP 200 with `text/plain` or `text/markdown`, starts with a `#` heading, and contains at least one URL. Bonus: `/llms-full.txt` companion found.
**What fails:** Missing file, wrong content type, no heading, or no URLs.

### Fix Workflow

1. **Create `/llms.txt`** — a markdown-formatted overview of your site for LLMs:
   ```markdown
   # Your Company Name

   > Brief description of what your company does.

   ## Docs
   - [Getting Started](https://example.com/docs/getting-started)
   - [API Reference](https://example.com/docs/api)
   - [Tutorials](https://example.com/docs/tutorials)

   ## Products
   - [Product Overview](https://example.com/products)
   - [Pricing](https://example.com/pricing)

   ## Optional
   - [Blog](https://example.com/blog)
   - [Changelog](https://example.com/changelog)
   - [Status Page](https://status.example.com)
   ```

2. **Optionally create `/llms-full.txt`** — expanded version with more detail:
   ```markdown
   # Your Company Name

   > Detailed description of your company, products, and services.

   ## Getting Started

   Full getting started content here, not just a link.
   Include setup instructions, prerequisites, etc.

   ## API Reference

   Inline API documentation or detailed summaries of endpoints.
   ```

3. **Ensure correct Content-Type** — must be `text/plain` or `text/markdown`:

   **Nginx:**
   ```nginx
   location = /llms.txt {
     default_type text/plain;
   }
   location = /llms-full.txt {
     default_type text/plain;
   }
   ```

   **Apache:**
   ```apache
   <Files "llms.txt">
     ForceType text/plain
   </Files>
   <Files "llms-full.txt">
     ForceType text/plain
   </Files>
   ```

4. **Verify:**
   ```bash
   curl -sI https://example.com/llms.txt | grep -i content-type
   curl -s https://example.com/llms.txt | head -5
   # First line must start with #
   # Must contain at least one https:// URL
   ```

> See [references/llms-txt-guide.md](references/llms-txt-guide.md) for the full specification and examples for different site types.

---

## Checkpoint 1.5: Meta Robots / X-Robots-Tag (15 pts)

**What passes:** No restrictive directives found (15 pts).
**Partial credit:** Restrictive directives other than noindex found (8 pts) — e.g., nofollow, nosnippet, noai, noimageai.
**What fails:** `noindex` directive found (0 pts).

The scanner checks both:
- `<meta name="robots" content="...">` in HTML
- `X-Robots-Tag` HTTP response header

### Restrictive Directives

| Directive   | Effect                                     |
|-------------|--------------------------------------------|
| `noindex`   | Prevents indexing entirely (worst for AI)   |
| `nofollow`  | Prevents following links on the page        |
| `nosnippet` | Prevents showing snippets in search results |
| `noai`      | Signals no AI usage (some crawlers respect) |
| `noimageai` | Signals no AI usage of images               |

### Fix Workflow

1. **Check current meta robots:**
   ```bash
   curl -s https://example.com/ | grep -i 'name="robots"'
   curl -sI https://example.com/ | grep -i x-robots-tag
   ```

2. **Remove or replace restrictive tags** in your HTML `<head>`:
   ```html
   <!-- WRONG: blocks AI indexing -->
   <meta name="robots" content="noindex, nofollow">

   <!-- CORRECT: allows AI indexing -->
   <meta name="robots" content="index, follow">

   <!-- ALSO CORRECT: omit entirely (default is index, follow) -->
   ```

3. **Remove restrictive X-Robots-Tag headers:**

   **Nginx:**
   ```nginx
   # Remove if present:
   # add_header X-Robots-Tag "noindex";

   # Replace with (or remove entirely):
   add_header X-Robots-Tag "index, follow";
   ```

4. **For specific AI directives** — if you have `noai` or `noimageai` and want to allow AI:
   ```html
   <!-- Remove noai/noimageai to allow AI systems -->
   <meta name="robots" content="index, follow">
   ```

5. **Verify:**
   ```bash
   curl -s https://example.com/ | grep -i 'name="robots"'
   # Should show: content="index, follow" or no meta robots tag at all
   ```

---

## Key Gotchas

1. **robots.txt returns HTML** — 404 page served instead of a real robots.txt file
2. **Wrong Content-Type** — robots.txt or llms.txt served as `text/html` instead of `text/plain`
3. **Wildcard Disallow blocks everything** — `User-agent: * / Disallow: /` blocks all AI crawlers
4. **Sitemap is not valid XML** — JSON or HTML page served at `/sitemap.xml`
5. **llms.txt has no URLs** — File exists but is just plain text without any links
6. **noai vs noindex confusion** — `noai` costs 7 points, `noindex` costs all 15

> See [references/gotchas.md](references/gotchas.md) for detailed correct vs incorrect examples of each.

## References

- [robots-txt-guide.md](references/robots-txt-guide.md) — Complete robots.txt syntax, AI user-agents, and testing
- [llms-txt-guide.md](references/llms-txt-guide.md) — llms.txt specification, content structure, and site-type examples
- [gotchas.md](references/gotchas.md) — Common pitfalls with wrong vs correct examples

## Instructions

1. **Identify failing checkpoints** from the IsAgentReady.com scan results
2. **Follow the fix workflow** for each failing checkpoint above
3. **Apply the code examples** — adapt URLs, domain names, and content to the user's site
4. **Verify each fix** using the curl commands provided in each workflow
5. **Re-scan** at [isagentready.com](https://isagentready.com) to confirm improvements

If `$ARGUMENTS` is provided, interpret it as the URL to fix or the specific checkpoint to address.
