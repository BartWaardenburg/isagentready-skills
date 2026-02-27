# robots.txt & AI Crawler Directives — Complete Guide

## What is robots.txt?

robots.txt is a plain text file at the root of a website (`/robots.txt`) that tells web crawlers which pages they can and cannot access. It follows the Robots Exclusion Protocol, standardized in [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309).

AI crawlers (GPTBot, ClaudeBot, etc.) check robots.txt before crawling, just like traditional search engine crawlers.

## File Requirements

### Location
- Must be at the site root: `https://example.com/robots.txt`
- One robots.txt per origin (scheme + host + port)
- Subdomains need their own: `https://blog.example.com/robots.txt`

### Content-Type
- **Must** be served as `Content-Type: text/plain`
- If served as `text/html`, crawlers may ignore it
- The IsAgentReady scanner will fail this checkpoint if Content-Type is wrong

### HTTP Status
- **200**: File is read and rules are applied
- **404**: No restrictions — crawlers treat the site as fully open
- **5xx**: Crawlers may temporarily restrict crawling (cautious approach)

## Syntax Reference

### Basic Structure

```
User-agent: <crawler-name>
Allow: <path>
Disallow: <path>

Sitemap: <url>
```

### Rules

1. **User-agent** declares which crawler the following rules apply to
2. **Allow** explicitly permits crawling a path
3. **Disallow** blocks crawling a path
4. **Sitemap** points to your XML sitemap (can appear anywhere in the file)
5. Blank lines separate rule groups
6. Lines starting with `#` are comments

### Pattern Matching

```
Disallow: /private/     # Blocks /private/ and everything under it
Disallow: /             # Blocks the entire site
Disallow:               # Blocks nothing (equivalent to Allow: /)
Allow: /public/         # Explicitly allows /public/ even if parent is disallowed
Allow: /                # Allows everything
```

### Wildcards (Supported by Most Crawlers)

```
Disallow: /*.pdf$       # Blocks all PDF files
Disallow: /*/admin      # Blocks any path containing /admin
Allow: /public/*.html$  # Allows HTML files under /public/
```

### Precedence Rules

Per RFC 9309:
1. The most specific user-agent match wins (exact name over `*`)
2. For matching paths, the longest pattern takes precedence
3. `Allow` takes precedence over `Disallow` when path lengths are equal

## The 13 AI User-Agents

These are the AI crawlers checked by the IsAgentReady scanner:

### OpenAI

| User-Agent      | Purpose                           | Documentation |
|-----------------|-----------------------------------|---------------|
| GPTBot          | Training data for GPT models      | [OpenAI GPTBot docs](https://platform.openai.com/docs/bots/gptbot) |
| ChatGPT-User    | Real-time browsing in ChatGPT     | [OpenAI ChatGPT-User docs](https://platform.openai.com/docs/bots/chatgpt-user) |
| OAI-SearchBot   | SearchGPT search results          | [OpenAI SearchBot docs](https://platform.openai.com/docs/bots/oai-searchbot) |

### Anthropic

| User-Agent        | Purpose                          | Documentation |
|-------------------|----------------------------------|---------------|
| ClaudeBot         | Training data for Claude models  | [Anthropic ClaudeBot](https://docs.anthropic.com/en/docs/about-claude/models#web-crawling) |
| Claude-User       | Real-time browsing in Claude     | — |
| Claude-SearchBot  | Claude search results            | — |

### Google

| User-Agent       | Purpose                          | Documentation |
|------------------|----------------------------------|---------------|
| Google-Extended  | Gemini AI training (not search)  | [Google crawlers overview](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers) |

### Other Major AI Crawlers

| User-Agent         | Owner        | Purpose                    |
|--------------------|--------------|----------------------------|
| Amazonbot          | Amazon       | Alexa and AI training      |
| Bytespider         | ByteDance    | TikTok and AI training     |
| CCBot              | Common Crawl | Open web dataset           |
| PerplexityBot      | Perplexity   | AI-powered search          |
| Applebot-Extended  | Apple        | Apple Intelligence training|
| meta-externalagent | Meta         | Meta AI training           |

## Complete robots.txt Templates

### Allow All AI Crawlers (Recommended for Maximum Score)

```
User-agent: *
Allow: /

# AI Crawlers — explicit Allow
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

Sitemap: https://example.com/sitemap.xml
```

### Allow Search Bots, Block Training Bots

```
User-agent: *
Allow: /

# Allow AI search (real-time browsing)
User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

# Block AI training crawlers
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

### Partial Access (Protect Sensitive Areas)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /internal/

User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```

## Testing Your robots.txt

### With curl

```bash
# Check it exists and has correct Content-Type
curl -sI https://example.com/robots.txt

# View the contents
curl -s https://example.com/robots.txt

# Test as a specific bot
curl -s -A "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)" \
  https://example.com/robots.txt
```

### With Google's Testing Tool

Google Search Console includes a robots.txt tester:
https://search.google.com/search-console/robots-testing-tool

### Manual Verification Checklist

1. HTTP status is 200
2. Content-Type header contains `text/plain`
3. Body is not HTML (no `<!DOCTYPE` or `<html>` tags)
4. Contains at least one `User-agent:` directive
5. AI crawler user-agents have explicit Allow directives
6. `Sitemap:` directive points to a valid URL

## Server Configuration

### Nginx

```nginx
location = /robots.txt {
  root /var/www/html;
  default_type text/plain;
  try_files /robots.txt =404;
}
```

### Apache

```apache
# In .htaccess or virtual host config
<Files "robots.txt">
  ForceType text/plain
</Files>
```

### Caddy

```caddyfile
example.com {
  file_server
  handle /robots.txt {
    header Content-Type text/plain
  }
}
```

### Express / Node.js

```javascript
const path = require('path');

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});
```

## External References

- [RFC 9309 — Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309)
- [Google robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google crawlers and user agents](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [OpenAI GPTBot documentation](https://platform.openai.com/docs/bots/gptbot)
- [Anthropic ClaudeBot documentation](https://docs.anthropic.com/en/docs/about-claude/models#web-crawling)
