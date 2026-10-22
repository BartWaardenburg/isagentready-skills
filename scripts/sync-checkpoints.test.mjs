import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  TABLE_END,
  TABLE_START,
  checkReference,
  checkSkill,
  isReadOnlyCommand,
  normalizePayload,
  renderReference,
  renderTable,
  run,
  validateDefinitions,
} from "./sync-checkpoints.mjs";

const VERSION = "2026-10-22";

const definition = (overrides) => ({
  id: "ia.robots-txt",
  legacy_id: "1.1",
  ar_practice_ids: ["AR-FIND-01"],
  ar_mapping: "full",
  name: "robots.txt present",
  category: "discovery",
  stage: "find",
  strength: "MUST",
  evidence_type: "scanner_data",
  fix: {
    summary: "Serve a plain-text robots.txt at the site root.",
    steps: [],
    skill: { name: "ai-content-discovery", anchor: "ia.robots-txt" },
  },
  verify: {
    command: "curl -sfI https://{domain}/robots.txt | grep -i '^content-type: text/plain'",
    expect: "one line",
    rescan: "isagentready results {domain} --checkpoint ia.robots-txt",
  },
  lifecycle: { retired: null },
  methodology_version: VERSION,
  detail_url: "https://isagentready.com/en/methodology/checkpoints/ia.robots-txt",
  ...overrides,
});

const robots = definition({});
const sitemap = definition({
  id: "ia.xml-sitemap",
  legacy_id: "1.3",
  name: "XML sitemap",
  ar_practice_ids: ["AR-FIND-03"],
  strength: "SHOULD",
  fix: { summary: "Publish a sitemap.", steps: [], skill: { name: "ai-content-discovery", anchor: "ia.xml-sitemap" } },
  verify: { command: null, expect: null, rescan: "isagentready results {domain} --checkpoint ia.xml-sitemap" },
});
const trainingCheck = definition({
  id: "ia.ai-txt",
  legacy_id: "te.4",
  name: "ai.txt",
  category: "training_exposure",
  ar_practice_ids: [],
  ar_mapping: "none",
  strength: null,
  fix: { summary: "Informational.", steps: [], skill: { name: "ai-content-discovery", anchor: "ia.ai-txt" } },
});
const retiredManifest = definition({
  id: "ia.webmcp-manifest",
  legacy_id: "4.2",
  name: "WebMCP manifest",
  category: "agent_protocols",
  stage: "act",
  ar_practice_ids: [],
  ar_mapping: "none",
  strength: null,
  fix: { summary: "Retired.", steps: [], skill: null },
  verify: { command: null, expect: null, rescan: "isagentready results {domain} --checkpoint ia.webmcp-manifest" },
  lifecycle: { retired: "2026-08-27" },
});

const definitions = [robots, sitemap, trainingCheck, retiredManifest];

const validSkill = () =>
  [
    "---",
    "name: ai-content-discovery",
    "description: Test skill.",
    "---",
    "",
    "# AI Content Discovery",
    "",
    `Methodology version: \`${VERSION}\`. Methodology: https://isagentready.com/en/methodology`,
    "",
    TABLE_START,
    renderTable([robots, sitemap]),
    TABLE_END,
    "",
    '<a id="ia.robots-txt"></a>',
    "### 1.1 robots.txt present",
    "",
    '<a id="ia.xml-sitemap"></a>',
    "### 1.3 XML sitemap",
    "",
  ].join("\n");

const check = (markdown) =>
  checkSkill({ skill: "ai-content-discovery", markdown, definitions, version: VERSION });

test("normalizePayload accepts an array, a checkpoints object and a data object", () => {
  for (const payload of [definitions, { checkpoints: definitions }, { data: definitions }]) {
    const result = normalizePayload(payload);
    assert.equal(result.version, VERSION);
    assert.equal(result.definitions.length, definitions.length);
  }
});

test("normalizePayload prefers the top-level methodology version", () => {
  const result = normalizePayload({ methodology_version: "2027-01-01", checkpoints: definitions });
  assert.equal(result.version, "2027-01-01");
});

test("normalizePayload rejects a payload without definitions", () => {
  assert.throws(() => normalizePayload({ items: [] }), /no checkpoint definitions/);
});

test("isReadOnlyCommand allows GET and HEAD requests with text filters", () => {
  assert.equal(isReadOnlyCommand("curl -sfI https://{domain}/robots.txt | grep -i '^content-type'"), true);
  assert.equal(isReadOnlyCommand("curl -sf https://{domain}/ | sed -e 's/<[^>]*>//g' | wc -c"), true);
  assert.equal(isReadOnlyCommand("curl -sf -X GET https://{domain}/api | jq -e '.ok'"), true);
  assert.equal(isReadOnlyCommand("curl -s -o /dev/null -w '%{http_code}' https://{domain}/"), true);
});

test("isReadOnlyCommand rejects write methods, request bodies and other tools", () => {
  for (const command of [
    "curl -X POST https://{domain}/mcp",
    "curl -XPOST https://{domain}/mcp",
    "curl --request PUT https://{domain}/x",
    "curl -d '{}' https://{domain}/mcp",
    "curl --data-raw '{}' https://{domain}/mcp",
    "curl --json '{}' https://{domain}/mcp",
    "curl -F file=@a https://{domain}/upload",
    "curl -T file https://{domain}/upload",
    "curl -sf https://{domain}/ > page.html",
    "curl -sf https://{domain}/ | sed -i 's/a/b/' file",
    "rm -rf /tmp/x",
  ]) {
    assert.equal(isReadOnlyCommand(command), false, command);
  }
});

test("validateDefinitions reports bad enums and write commands", () => {
  const errors = validateDefinitions([
    definition({ strength: "REQUIRED" }),
    definition({ id: "ia.mcp", legacy_id: "4.20", verify: { command: "curl -X POST https://{domain}/mcp", rescan: "x" } }),
  ]);
  assert.ok(errors.some((error) => error.includes("strength")));
  assert.ok(errors.some((error) => error.includes("read-only")));
});

test("validateDefinitions accepts the committed snapshot", () => {
  const snapshot = JSON.parse(readFileSync(new URL("./checkpoints.snapshot.json", import.meta.url), "utf8"));
  assert.deepEqual(validateDefinitions(normalizePayload(snapshot).definitions), []);
});

test("validateDefinitions accepts a definition without verify.rescan", () => {
  assert.deepEqual(validateDefinitions([definition({ verify: { command: null, expect: null } })]), []);
});

test("checkSkill passes a skill that lists every active checkpoint", () => {
  assert.deepEqual(check(validSkill()), []);
});

test("checkSkill fails when a SKILL.md lists a retired checkpoint", () => {
  const withRow = validSkill().replace(TABLE_END, `| 4.2 | \`ia.webmcp-manifest\` | WebMCP manifest | none | MAY |\n${TABLE_END}`);
  assert.ok(check(withRow).some((error) => error.includes("4.2")));

  const withHeading = `${validSkill()}\n### 4.2 WebMCP manifest\n`;
  assert.ok(check(withHeading).some((error) => error.includes("4.2")));

  const withStableId = `${validSkill()}\nSee ia.webmcp-manifest.\n`;
  assert.ok(check(withStableId).some((error) => error.includes("ia.webmcp-manifest")));
});

test("checkSkill does not confuse 4.20 with the retired 4.2", () => {
  assert.deepEqual(check(`${validSkill()}\n### 4.20 Live MCP verification\n`), []);
});

test("checkSkill fails when an active checkpoint is missing", () => {
  const markdown = validSkill().replace(renderTable([robots, sitemap]), renderTable([robots]));
  const errors = check(markdown);
  assert.ok(errors.some((error) => error.includes("1.3")));
});

test("checkSkill fails when an anchor is missing", () => {
  const errors = check(validSkill().replace('<a id="ia.xml-sitemap"></a>', ""));
  assert.ok(errors.some((error) => error.includes('<a id="ia.xml-sitemap">')));
});

test("checkSkill fails when the methodology version is missing or old", () => {
  const errors = check(validSkill().replace(VERSION, "2026-09-02"));
  assert.ok(errors.some((error) => error.includes("Methodology version")));
});

test("checkSkill fails when a verify step in SKILL.md sends data", () => {
  const markdown = `${validSkill()}\n\`\`\`bash\ncurl -X POST https://example.com/mcp\n\`\`\`\n`;
  assert.ok(check(markdown).some((error) => error.includes("read-only")));
});

test("checkSkill fails when a multi-line curl in SKILL.md sends data", () => {
  const markdown = `${validSkill()}\n\`\`\`bash\ncurl https://example.com/mcp \\\n  -X POST -d x\n\`\`\`\n`;
  assert.ok(check(markdown).some((error) => error.includes("read-only")));
});

test("checkSkill allows a multi-line read-only curl", () => {
  const markdown = `${validSkill()}\n\`\`\`bash\ncurl -sf \\\n  https://example.com/robots.txt\n\`\`\`\n`;
  assert.deepEqual(check(markdown), []);
});

test("checkReference fails when a reference file mentions a retired checkpoint", () => {
  const errors = checkReference({ skill: "agent-protocols", file: "gotchas.md", markdown: "Do not use ia.webmcp-manifest.\n", definitions });
  assert.ok(errors.some((error) => error.startsWith("agent-protocols/references/gotchas.md") && error.includes("ia.webmcp-manifest")));
  assert.deepEqual(checkReference({ skill: "agent-protocols", file: "gotchas.md", markdown: "Use ia.webmcp-declarative.\n", definitions }), []);
});

test("renderReference shows why, references, evidence source, applicability and aggregate data", () => {
  const rich = definition({
    why: "Agents read robots.txt first.",
    evidence_source: { title: "agentready.org AR-FIND-01", url: "https://www.agentready.org/#reachable" },
    references: [{ title: "RFC 9309", url: "https://www.rfc-editor.org/rfc/rfc9309", kind: "spec" }],
    applicability: { mode: "always", surfaces: ["website"], condition: null },
    aggregate: {
      benchmark_version: "2026-10",
      denominator: 1000,
      rates: { pass: 0.7, partial: 0.1, fail: 0.15, skip: 0.05 },
      applicable_denominator: 950,
      applicable_fail_rate: 0.1579,
      source_url: "https://isagentready.com/en/research/state-of-agent-ready-web/2026-10",
    },
  });
  const output = renderReference("ai-content-discovery", [rich], VERSION);
  assert.match(output, /Agents read robots\.txt first\./);
  assert.match(output, /\[agentready\.org AR-FIND-01\]\(https:\/\/www\.agentready\.org\/#reachable\)/);
  assert.match(output, /\[RFC 9309\]\(https:\/\/www\.rfc-editor\.org\/rfc\/rfc9309\) \(spec\)/);
  assert.match(output, /Applicability: always \(website\)/);
  assert.match(output, /fail 15\.0%/);
  assert.match(output, /Applicable fail rate: 15\.8% of 950 sites/);
  assert.match(output, /2026-10/);
});

test("renderReference derives the rescan command when verify.rescan is missing", () => {
  const output = renderReference("ai-content-discovery", [definition({ verify: { command: null, expect: null } })], VERSION);
  assert.match(output, /isagentready results \{domain\} --checkpoint ia\.robots-txt/);
});

test("renderReference marks the file as generated and lists anchors and verify commands", () => {
  const output = renderReference("ai-content-discovery", definitions, VERSION);
  assert.match(output, /generated by `scripts\/sync-checkpoints\.mjs`/i);
  assert.match(output, /<a id="ia\.robots-txt"><\/a>/);
  assert.match(output, /curl -sfI https:\/\/\{domain\}\/robots\.txt/);
  assert.match(output, /ia\.ai-txt/);
  assert.doesNotMatch(output, /ia\.webmcp-manifest/);
  assert.match(output, new RegExp(`/api/v2/methodology/${VERSION}/scoring`));
});

test("renderReference lists training exposure checks only for ai-content-discovery", () => {
  const output = renderReference("structured-data", definitions, VERSION);
  assert.doesNotMatch(output, /ia\.ai-txt/);
});

test("run writes references and then passes and fails --check as expected", async () => {
  const root = mkdtempSync(join(tmpdir(), "sync-checkpoints-"));
  const snapshotPath = join(root, "snapshot.json");
  writeFileSync(snapshotPath, JSON.stringify({ methodology_version: VERSION, checkpoints: definitions }));
  for (const skill of ["ai-content-discovery", "structured-data", "content-semantics", "agent-protocols", "security-trust"]) {
    mkdirSync(join(root, skill), { recursive: true });
    const body = skill === "ai-content-discovery" ? validSkill() : `Methodology version: \`${VERSION}\`. Methodology: https://isagentready.com/en/methodology\n\n${TABLE_START}\n${TABLE_END}\n`;
    writeFileSync(join(root, skill, "SKILL.md"), body);
  }
  const quiet = { log: () => {}, error: () => {} };

  assert.equal(await run(["--snapshot", snapshotPath, "--root", root], quiet), 0);
  assert.equal(await run(["--check", "--snapshot", snapshotPath, "--root", root], quiet), 0);

  const skillPath = join(root, "ai-content-discovery", "SKILL.md");
  writeFileSync(skillPath, `${readFileSync(skillPath, "utf8")}\n### 4.2 WebMCP manifest\n`);
  assert.equal(await run(["--check", "--snapshot", snapshotPath, "--root", root], quiet), 1);
});

test("run --check fails when a generated reference is stale", async () => {
  const root = mkdtempSync(join(tmpdir(), "sync-checkpoints-"));
  const snapshotPath = join(root, "snapshot.json");
  writeFileSync(snapshotPath, JSON.stringify({ methodology_version: VERSION, checkpoints: [robots, sitemap] }));
  mkdirSync(join(root, "ai-content-discovery", "references"), { recursive: true });
  writeFileSync(join(root, "ai-content-discovery", "SKILL.md"), validSkill());
  writeFileSync(join(root, "ai-content-discovery", "references", "checkpoints.md"), "old\n");
  const errors = [];
  const code = await run(["--check", "--snapshot", snapshotPath, "--root", root, "--skills", "ai-content-discovery"], {
    log: () => {},
    error: (line) => errors.push(line),
  });
  assert.equal(code, 1);
  assert.ok(errors.some((line) => line.includes("references/checkpoints.md")));
});

test("run reads the live endpoint and reports a missing endpoint", async () => {
  const quiet = { log: () => {}, error: () => {} };
  const notFound = async () => ({ ok: false, status: 404, json: async () => ({}) });
  assert.equal(await run(["--check", "--root", mkdtempSync(join(tmpdir(), "sync-"))], { ...quiet, fetch: notFound }), 2);
});
