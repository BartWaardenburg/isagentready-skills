# isagentready-skills

Agent skills for fixing AI agent readiness issues identified by [IsAgentReady.com](https://isagentready.com). Companion to the [isagentready-mcp](https://github.com/bartwaardenburg/isagentready-mcp) server for scanning websites directly from your agent.

## Repository Structure

```
.claude-plugin/
  marketplace.json          # Marketplace metadata (version must sync with plugin.json)
  plugin.json               # Plugin metadata (keywords, author, license)
ai-content-discovery/       # Category: AI Content Discovery (discovery), plus the training exposure checks
  SKILL.md                  # Methodology version, checkpoint table, fix workflows
  references/
    checkpoints.md          # GENERATED: checkpoint data for this skill
    robots-txt-guide.md     # robots.txt syntax, AI user agents, tests
    llms-txt-guide.md       # llms.txt structure and examples
    gotchas.md              # Common errors with correct and incorrect examples
structured-data/            # Category: AI Search Signals (structured_data)
  SKILL.md
  references/
    checkpoints.md          # GENERATED
    schema-types.md         # JSON-LD templates for Schema.org types
    json-ld-patterns.md     # @graph, entity linking, SearchAction, combined types
    gotchas.md
content-semantics/          # Category: Content & Semantics (semantics)
  SKILL.md
  references/
    checkpoints.md          # GENERATED
    semantic-html-guide.md  # Semantic elements, ARIA mapping, heading patterns
    ssr-strategies.md       # SSR for each framework
    gotchas.md
agent-protocols/            # Category: Agent Protocols (agent_protocols)
  SKILL.md
  references/
    checkpoints.md          # GENERATED
    webmcp-guide.md         # Declarative and imperative WebMCP
    a2a-mcp-guide.md        # A2A, MCP server cards, OpenAPI, agents.json
    gotchas.md
security-trust/             # Category: Security & Trust (security)
  SKILL.md
  references/
    checkpoints.md          # GENERATED
    security-headers.md     # Each header, its values and its effect
    server-configs.md       # Configurations for Nginx, Apache, Caddy, Vercel, Netlify and others
    gotchas.md
scripts/
  sync-checkpoints.mjs      # Writes checkpoint tables and references/checkpoints.md; --check fails on drift
  sync-checkpoints.test.mjs # Tests for the sync script (node --test)
  checkpoints.snapshot.json # Catalog snapshot of GET /api/v2/checkpoints?include_retired=true
.github/
  workflows/
    validate.yml            # CI: JSON, frontmatter, line counts, paths, version sync, sync tests, drift check
```

For the current checkpoints of a skill, see its `references/checkpoints.md`. Do not write checkpoint counts in docs. Counts change with each methodology version.

## Checkpoint Catalog

The IsAgentReady checkpoint catalog is the source of truth. `scripts/sync-checkpoints.mjs` reads it from `https://isagentready.com/api/v2/checkpoints?include_retired=true` or from `--snapshot scripts/checkpoints.snapshot.json`.

- Run `node scripts/sync-checkpoints.mjs` after a methodology change. It writes the table between the `checkpoints:start` and `checkpoints:end` markers in each SKILL.md, and each `references/checkpoints.md`.
- Do not edit the generated table or `references/checkpoints.md` by hand.
- `node scripts/sync-checkpoints.mjs --check --snapshot scripts/checkpoints.snapshot.json` fails when a generated file is out of date, when a SKILL.md or a reference file lists a retired checkpoint, when a curl command in SKILL.md is not read-only, or when a SKILL.md misses an active checkpoint of its category.
- When the live endpoint is deployed, replace the snapshot with its response and run the sync.
- The catalog files have no `verify.rescan` field. The script then uses `isagentready results {domain} --checkpoint <stable id>`.
- The generated `references/checkpoints.md` shows `why`, the references, the evidence source, the applicability and the scanner data (`aggregate`) when the catalog gives them.
- Category to skill: `discovery` = ai-content-discovery, `structured_data` = structured-data, `semantics` = content-semantics, `agent_protocols` = agent-protocols, `security` = security-trust. Training exposure checks (`te.*`) are informational. They appear only in `ai-content-discovery/references/checkpoints.md`.
- Never copy points or weights into a skill. Link to `https://isagentready.com/api/v2/methodology/<version>/scoring`.

## Creating a New Skill

1. Create a directory with a kebab-case name
2. Add a `SKILL.md` with YAML frontmatter:
   - `name` (required): kebab-case skill name
   - `description` (required): Third-person, includes trigger phrases, 1-2 sentences
3. Add a `references/` directory for supplementary documentation
4. Update `.claude-plugin/plugin.json` if adding to the plugin

### SKILL.md Requirements

- Under 500 lines. Keep it focused and put details in references.
- Include "When to Use" and "When NOT to Use" sections
- Include step-by-step fix workflows for each checkpoint
- Use progressive disclosure: SKILL.md links to reference files, references don't chain
- No hardcoded file paths
- Every fix workflow must include a complete, copy-paste-ready code example
- State the methodology version as ``Methodology version: `<version>` `` and link to `https://isagentready.com/en/methodology`
- Keep the generated checkpoint table between the markers
- Give each fix workflow an anchor equal to the stable id: `<a id="ia.<slug>"></a>`, then `### <legacy id> <name>`
- Each verify command is read-only: `curl` without POST, PUT, DELETE, `-d`, `--data`, `--json`, `-F` or `-T`

### Reference Files

- `checkpoints.md` per skill is generated. Do not edit it.
- Two domain-specific reference files per skill (guide/patterns)
- One `gotchas.md` per skill with common errors and correct and incorrect examples
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
- [ ] Every checkpoint has a fix workflow with a stable id anchor
- [ ] `node scripts/sync-checkpoints.mjs --check --snapshot scripts/checkpoints.snapshot.json` passes
- [ ] `node --test scripts/sync-checkpoints.test.mjs` passes
- [ ] Every gotcha has correct vs incorrect examples
- [ ] Reference URLs are valid
