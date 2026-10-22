# isagentready-skills

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple.svg)](https://modelcontextprotocol.io)
[![CI](https://github.com/bartwaardenburg/isagentready-skills/actions/workflows/validate.yml/badge.svg)](https://github.com/bartwaardenburg/isagentready-skills/actions/workflows/validate.yml)

Agent skills for fixing AI agent readiness issues identified by [IsAgentReady.com](https://isagentready.com). The skills follow the open [Agent Skills](https://agentskills.io) specification. They work with each compatible agent, for example Claude Code, Cursor, OpenAI Codex, Windsurf, GitHub Copilot, Gemini CLI and Amp.

## Features

- **Every active scanner checkpoint** has a fix workflow, an anchor equal to its stable id (for example `ia.llms-txt`) and a read-only verify command. For the current list, see `references/checkpoints.md` in each skill.
- **agentready.org alignment**: each checkpoint shows its AR practice ids, its stage (Find, Read, Act) and its strength (MUST, SHOULD, MAY).
- **Framework-agnostic**: the instructions work with each web stack.
- **Copy-paste templates** for robots.txt, JSON-LD, semantic HTML, agent protocols and security headers.
- **Server configurations** for Nginx, Apache, Caddy, Vercel, Netlify, Cloudflare and more.
- **Companion** to the [IsAgentReady.com](https://isagentready.com) scanner and the [isagentready-mcp](https://github.com/bartwaardenburg/isagentready-mcp) server.

## How It Works

1. Scan your website at [isagentready.com](https://isagentready.com) or via the [isagentready-mcp](https://github.com/bartwaardenburg/isagentready-mcp) server
2. Install these skills in your AI coding agent
3. Ask your agent to fix the failing checkpoints
4. Re-scan to verify improvements

## Prerequisites

Scan your website first to identify which checkpoints are failing. The scan results tell you exactly which skills to use.

**Option A, web scanner:** Visit [isagentready.com](https://isagentready.com)

**Option B, MCP server (recommended):** Install the [isagentready-mcp](https://github.com/bartwaardenburg/isagentready-mcp) server so your agent can scan, fix, and re-verify without leaving the editor:

```bash
claude mcp add isagentready-mcp -- npx isagentready-mcp
```

The MCP server provides `scan_website`, `get_scan_results`, and `get_rankings` tools that let your agent scan directly and act on the results using these skills.

## Installation

Install the skills in your AI coding agent of choice:

### Quick Install (Any Agent)

```bash
npx skills add bartwaardenburg/isagentready-skills
```

### Claude Code

```bash
/plugin marketplace add bartwaardenburg/isagentready-skills
/plugin install isagentready@isagentready-skills
```

### Cursor

```bash
git clone https://github.com/bartwaardenburg/isagentready-skills.git ~/.cursor/skills/isagentready-skills
```

### OpenAI Codex

```bash
git clone https://github.com/bartwaardenburg/isagentready-skills.git ~/.agents/skills/isagentready-skills
```

### Windsurf

```bash
git clone https://github.com/bartwaardenburg/isagentready-skills.git ~/.codeium/windsurf/skills/isagentready-skills
```

### GitHub Copilot / VS Code

```bash
git clone https://github.com/bartwaardenburg/isagentready-skills.git ~/.agents/skills/isagentready-skills
```

### Gemini CLI

```bash
gemini skills install https://github.com/bartwaardenburg/isagentready-skills.git
```

### Amp

```bash
git clone https://github.com/bartwaardenburg/isagentready-skills.git ~/.config/agents/skills/isagentready-skills
```

### Other Agents

Clone or copy the skill directory into your agent's skills location. These skills follow the open [Agent Skills](https://agentskills.io) specification and work with any compatible agent.

## Available Skills

| Skill | Category | Description |
|-------|----------|-------------|
| [ai-content-discovery](ai-content-discovery/) | Discovery | robots.txt, AI crawlers, sitemaps, llms.txt, Markdown negotiation, Link headers, AGENTS.md, soft 404, DNS-AID, pricing page |
| [structured-data](structured-data/) | Search Signals | JSON-LD, Schema.org types, entity linking, validation, FAQ, author, trust pages |
| [content-semantics](content-semantics/) | Semantics | SSR, headings, semantic HTML, ARIA, alt text, language, link text, forms, keyboard access, title, buttons, aria-hidden, widget state |
| [agent-protocols](agent-protocols/) | Protocols | WebMCP, A2A, MCP server cards and live MCP, MCP Apps, OpenAPI, API and AI catalogs, Agent Skills index, NLWeb, SDKs and CLI, agent commerce |
| [security-trust](security-trust/) | Security | HTTPS, HSTS, CSP, security headers, CORS, tool definition security, OAuth discovery, agent auth |

The category weights and the points of each checkpoint are in the versioned scoring document, for example `https://isagentready.com/api/v2/methodology/<version>/scoring`. The skills do not copy these values, so they cannot drift.

### What's Included

Each skill contains:

- **SKILL.md**: the methodology version, the checkpoint table and a fix workflow for each checkpoint in the category
- **references/checkpoints.md**: generated checkpoint data (stage, strength, AR mapping, evidence type, fix summary, verify and rescan commands)
- **references/**: guides, framework templates and a gotchas file with correct and incorrect examples

## Methodology

The skills match one IsAgentReady methodology version. Each SKILL.md states that version and links to the [methodology](https://isagentready.com/en/methodology). IsAgentReady.com aligns the methodology with the open [agentready.org](https://www.agentready.org/) spec.

- **Stage**: Find, Read or Act.
- **Strength**: MUST, SHOULD or MAY. Strength is a spec value and does not change the score.
- **Evidence type**: `measured_study`, `scanner_data` or `recommendation`.

## Checkpoint Sync

`scripts/sync-checkpoints.mjs` (Node, no dependencies) keeps the skills in sync with the scanner.

```bash
# Write the checkpoint tables and references/checkpoints.md from the live catalog
node scripts/sync-checkpoints.mjs

# Use the local snapshot instead of the live endpoint
node scripts/sync-checkpoints.mjs --snapshot scripts/checkpoints.snapshot.json

# Write nothing; fail on drift, retired ids or missing ids (CI runs this)
node scripts/sync-checkpoints.mjs --check --snapshot scripts/checkpoints.snapshot.json
```

The live source is `https://isagentready.com/api/v2/checkpoints?include_retired=true`.

## Example Prompts

Once installed, you can use natural language:

- "My site scored 45 on IsAgentReady. Fix the AI content discovery issues."
- "Add JSON-LD structured data for my SaaS product page"
- "Create a robots.txt that allows all AI crawlers"
- "Add WebMCP tool annotations to my search form"
- "Set up all security headers for my Nginx server"
- "Fix the heading hierarchy on this page"
- "Create an llms.txt for my documentation site"
- "Add an A2A Agent Card for my AI assistant"

## Contributing

See [CLAUDE.md](CLAUDE.md) for repository structure, skill creation guidelines, and quality standards.

## Related

- [isagentready-mcp](https://github.com/bartwaardenburg/isagentready-mcp): MCP server to scan websites from your agent
- [IsAgentReady.com](https://isagentready.com): the web scanner that finds these issues
- [agentready.org](https://www.agentready.org/): the open spec that the methodology aligns with
- [spaceship-skills](https://github.com/bartwaardenburg/spaceship-skills): domain management skills with the same pattern

## License

MIT. See [LICENSE](LICENSE) for details.
