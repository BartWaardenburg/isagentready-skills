# isagentready-skills

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/bartwaardenburg/isagentready-skills/actions/workflows/validate.yml/badge.svg)](https://github.com/bartwaardenburg/isagentready-skills/actions/workflows/validate.yml)

Agent skills for fixing AI agent readiness issues identified by [IsAgentReady.com](https://isagentready.com). Works with any agent that supports the [Agent Skills](https://agentskills.io) specification — Claude Code, Cursor, OpenAI Codex, Windsurf, GitHub Copilot, Gemini CLI, Amp, and more.

## Features

- **32 checkpoints** across 5 categories with step-by-step fix workflows
- **Framework-agnostic** — generic instructions that work with any web stack
- **Copy-paste templates** for robots.txt, JSON-LD, semantic HTML, agent protocols, and security headers
- **Server configurations** for Nginx, Apache, Caddy, Vercel, Netlify, Cloudflare, and more
- **Companion skills** to the [IsAgentReady.com](https://isagentready.com) scanner

## How It Works

1. Scan your website at [isagentready.com](https://isagentready.com)
2. Install these skills in your AI coding agent
3. Ask your agent to fix the failing checkpoints
4. Re-scan to verify improvements

## Prerequisites

Scan your website at [isagentready.com](https://isagentready.com) first to identify which checkpoints are failing. The scan results tell you exactly which skills to use.

## Installation

Install the skills in your AI coding agent of choice:

### Quick Install (Any Agent)

```bash
npx skills add bartwaardenburg/isagentready-skills
```

### Claude Code

```bash
/plugin marketplace add bartwaardenburg/isagentready-skills
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

| Skill | Category | Weight | Description |
|-------|----------|--------|-------------|
| [ai-content-discovery](ai-content-discovery/) | Discovery | 30% | robots.txt, AI crawlers, sitemaps, llms.txt, meta robots |
| [structured-data](structured-data/) | Search Signals | 20% | JSON-LD, Schema.org types, entity linking, breadcrumbs |
| [content-semantics](content-semantics/) | Semantics | 20% | SSR, headings, semantic HTML, ARIA, alt text, language |
| [agent-protocols](agent-protocols/) | Protocols | 15% | WebMCP, A2A, MCP discovery, OpenAPI, agents.json |
| [security-trust](security-trust/) | Security | 15% | HTTPS, HSTS, CSP, XCTO, frame protection, CORS, referrer |

### What's Included

Each skill contains:

- **SKILL.md** — Fix workflows for every checkpoint in that category, with scoring details and copy-paste code examples
- **references/** — Deep-dive guides, framework-specific templates, and a gotchas file with correct vs incorrect examples

## Scoring

IsAgentReady.com scores websites 0-100 across 5 weighted categories:

| Grade | Score | Meaning |
|-------|-------|---------|
| A+ | 95-100 | Best-in-class AI agent readiness |
| A | 80-94 | Excellent — comprehensive readiness |
| B | 70-79 | Good — solid foundation |
| C | 40-69 | Fair — fundamentals present but gaps remain |
| D | 20-39 | Minimal — basic signals missing |
| F | 0-19 | No agent readiness signals detected |

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

- [IsAgentReady.com](https://isagentready.com) — The scanner that identifies these issues
- [spaceship-skills](https://github.com/bartwaardenburg/spaceship-skills) — Domain management skills using the same pattern

## License

MIT — see [LICENSE](LICENSE) for details.
