# isagentready-skills

Agent skills for fixing AI agent readiness issues identified by [IsAgentReady.com](https://isagentready.com).

## Repository Structure

```
.claude-plugin/
  marketplace.json          # Marketplace metadata (version must sync with plugin.json)
  plugin.json               # Plugin metadata (keywords, author, license)
ai-content-discovery/       # Category 1: AI Content Discovery (30%)
  SKILL.md                  # 6 checkpoints: robots.txt, AI crawlers, sitemap, llms.txt, meta robots, bot access
  references/
    robots-txt-guide.md     # robots.txt syntax, AI user-agents, testing
    llms-txt-guide.md       # llms.txt spec, content structure, site-type examples
    gotchas.md              # 12 pitfalls with correct vs incorrect examples
structured-data/            # Category 2: Structured Data (20%)
  SKILL.md                  # 6 checkpoints: JSON-LD, Organization/WebSite, high-value types, @id, breadcrumbs, validation
  references/
    schema-types.md         # JSON-LD templates for 19 Schema.org types
    json-ld-patterns.md     # @graph, entity linking, SearchAction, combining types
    gotchas.md              # 11 pitfalls with correct vs incorrect examples
content-semantics/          # Category 3: Content & Semantics (20%)
  SKILL.md                  # 7 checkpoints: SSR, headings, semantic HTML, ARIA, alt text, lang, link text
  references/
    semantic-html-guide.md  # Semantic elements, ARIA mapping, heading patterns
    ssr-strategies.md       # Framework-specific SSR guides (Next.js, Nuxt, Astro, Remix, SvelteKit, Angular)
    gotchas.md              # 11 pitfalls with correct vs incorrect examples
agent-protocols/            # Category 4: Agent Protocols (15%)
  SKILL.md                  # 6 checkpoints: WebMCP declarative/manifest, A2A, MCP, OpenAPI, agents.json
  references/
    webmcp-guide.md         # Declarative API, page manifests, imperative API, well-known manifest
    a2a-mcp-guide.md        # A2A Agent Cards, MCP discovery, OpenAPI, agents.json
    gotchas.md              # 13 pitfalls with correct vs incorrect examples
security-trust/             # Category 5: Security & Trust (15%)
  SKILL.md                  # 7 checkpoints: HTTPS, HSTS, CSP, XCTO, frame protection, CORS, Referrer-Policy
  references/
    security-headers.md     # Deep dive on all 7 headers: purpose, valid values, scoring
    server-configs.md       # Copy-paste configs for Nginx, Apache, Caddy, Vercel, Netlify, etc.
    gotchas.md              # 7 pitfalls with correct vs incorrect examples
.github/
  workflows/
    validate.yml            # CI: validates JSON, frontmatter, line counts, paths, version sync
```

## Creating a New Skill

1. Create a directory with a kebab-case name
2. Add a `SKILL.md` with YAML frontmatter:
   - `name` (required): kebab-case skill name
   - `description` (required): Third-person, includes trigger phrases, 1-2 sentences
3. Add a `references/` directory for supplementary documentation
4. Update `.claude-plugin/plugin.json` if adding to the plugin

### SKILL.md Requirements

- Under 500 lines — keep focused, put details in references
- Include "When to Use" and "When NOT to Use" sections
- Include step-by-step fix workflows for each checkpoint
- Use progressive disclosure: SKILL.md links to reference files, references don't chain
- No hardcoded file paths
- Every fix workflow must include a complete, copy-paste-ready code example
- Checkpoint IDs must match the IsAgentReady.com scanner (1.1, 1.2, ... 5.9)

### Reference Files

- Two domain-specific reference files per skill (guide/patterns)
- One `gotchas.md` per skill — common pitfalls with correct vs incorrect examples
- Each gotcha must show both WRONG and CORRECT approaches

### Naming Conventions

- Directories: kebab-case (`ai-content-discovery`)
- Skill names: kebab-case (`ai-content-discovery`)
- Reference files: kebab-case (`robots-txt-guide.md`)

## Quality Standards

- Description must include trigger phrases ("Use when asked to...")
- Every gotcha must include correct vs incorrect example
- Workflows must be numbered step-by-step with code blocks
- All JSON files are valid
- marketplace.json and plugin.json versions are in sync
- Code examples must be framework-agnostic (or clearly labeled if framework-specific)
- Reference URLs must be valid and authoritative (MDN, W3C, Google Developers, OWASP)

## PR Checklist

- [ ] SKILL.md has valid YAML frontmatter with `name` and `description`
- [ ] No hardcoded file paths
- [ ] Skill is under 500 lines
- [ ] "When to Use" and "When NOT to Use" sections present
- [ ] All JSON files are valid
- [ ] marketplace.json and plugin.json versions are in sync
- [ ] Every checkpoint has a fix workflow
- [ ] Every gotcha has correct vs incorrect examples
- [ ] Reference URLs are valid
