import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPOSITORY = "https://github.com/BrainbaseHQ/brainbase-mcp";
const MCP_URL = "https://api.brainbaselabs.com/mcp";
const WEBSITE_URL = "https://brainbaselabs.com";
const SUPPORT_URL = "https://github.com/BrainbaseHQ/brainbase-mcp/issues";
const PRIVACY_URL = "https://brainbaselabs.com/privacy";
const TERMS_URL = "https://brainbaselabs.com/terms";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), "utf8"),
  );
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function pngDimensions(relativePath) {
  const content = fs.readFileSync(path.join(ROOT, relativePath));
  const signature = content.subarray(0, 8).toString("hex");
  assert(signature === "89504e470d0a1a0a", `${relativePath} is not a PNG`);
  assert(content.length >= 24, `${relativePath} is an invalid PNG`);
  return {
    width: content.readUInt32BE(16),
    height: content.readUInt32BE(20),
  };
}

function dirChecksum(dirPath) {
  const hash = crypto.createHash("sha256");

  function walk(current, relative) {
    const entries = fs
      .readdirSync(current, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relativePath = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) {
        hash.update(`D ${relativePath}\n`);
        walk(fullPath, relativePath);
      } else if (entry.isFile()) {
        hash.update(
          `F ${relativePath} ${sha256(fs.readFileSync(fullPath))}\n`,
        );
      }
    }
  }

  walk(dirPath, "");
  return hash.digest("hex");
}

function walkFiles(dirPath) {
  const files = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath));
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

const requiredFiles = [
  ".agents/plugins/marketplace.json",
  ".claude-plugin/marketplace.json",
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".mcp.json",
  "brainbase.json",
  "components/mcps/brainbase/mcp.json",
  "skills/brainbase-mcp/SKILL.md",
  "skills/brainbase-mcp/reference.md",
  "skills/brainbase-mcp/agents/openai.yaml",
  "chatgpt-app-submission.json",
  "submission/README.md",
  "submission/directory-icon.png",
  "submission/composer-icon.png",
  "README.md",
  "SECURITY.md",
  "LICENSE",
];
for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(ROOT, file)), `Missing required file: ${file}`);
}

const packageJson = readJson("package.json");
const codexPlugin = readJson(".codex-plugin/plugin.json");
const claudePlugin = readJson(".claude-plugin/plugin.json");
const codexMarketplace = readJson(".agents/plugins/marketplace.json");
const claudeMarketplace = readJson(".claude-plugin/marketplace.json");
const brainbaseManifest = readJson("brainbase.json");
const sharedMcp = readJson(".mcp.json");
const componentMcp = readJson("components/mcps/brainbase/mcp.json");
const openAiSubmission = readJson("chatgpt-app-submission.json");
const version = packageJson.version;

assert(packageJson.private === true, "npm publication must remain disabled");
assert(/^\d+\.\d+\.\d+$/.test(version), "Package version must be semver");
assert(
  packageJson.repository.url ===
    "git+https://github.com/BrainbaseHQ/brainbase-mcp.git",
  "package repository URL is stale",
);

for (const manifest of [codexPlugin, claudePlugin]) {
  assert(manifest.name === "brainbase-mcp", "Plugin name mismatch");
  assert(manifest.version === version, "Plugin version mismatch");
  assert(manifest.repository === REPOSITORY, "Plugin repository URL is stale");
}
assert(codexPlugin.skills === "./skills/", "Codex skill path mismatch");
assert(codexPlugin.mcpServers === "./.mcp.json", "Codex MCP path mismatch");
assert(
  codexPlugin.interface?.displayName === "Brainbase MCP" &&
    codexPlugin.interface.displayName.length <= 30,
  "Codex display name is invalid",
);
assert(
  codexPlugin.interface?.shortDescription === "Build and operate AI agents" &&
    codexPlugin.interface.shortDescription.length <= 30,
  "Codex short description is invalid",
);
assert(
  typeof codexPlugin.interface?.longDescription === "string" &&
    codexPlugin.interface.longDescription.length > 0 &&
    codexPlugin.interface.longDescription.length <= 4000,
  "Codex long description is invalid",
);
assert(
  codexPlugin.interface?.developerName === "Brainbase Labs" &&
    codexPlugin.interface.developerName.length <= 80,
  "Codex developer name is invalid",
);
for (const [field, expected] of [
  ["websiteURL", WEBSITE_URL],
  ["supportURL", SUPPORT_URL],
  ["privacyPolicyURL", PRIVACY_URL],
  ["termsOfServiceURL", TERMS_URL],
]) {
  assert(
    codexPlugin.interface?.[field] === expected,
    `Codex ${field} is missing or stale`,
  );
}
assert(
  codexPlugin.interface?.logo === "./submission/directory-icon.png",
  "Codex directory icon path mismatch",
);
assert(
  codexPlugin.interface?.composerIcon === "./submission/composer-icon.png",
  "Codex composer icon path mismatch",
);
assert(
  Array.isArray(codexPlugin.interface?.defaultPrompt) &&
    codexPlugin.interface.defaultPrompt.length <= 3 &&
    codexPlugin.interface.defaultPrompt.every(
      (prompt) =>
        typeof prompt === "string" &&
        prompt.trim().length > 0 &&
        prompt.length <= 128,
    ),
  "Codex starter prompts are invalid",
);

assert(
  codexMarketplace.plugins[0].source.path === ".",
  "Codex marketplace must resolve the repository root",
);
assert(
  claudeMarketplace.plugins[0].source === ".",
  "Claude marketplace must resolve the repository root",
);

assert(
  new Set([
    packageJson.version,
    codexPlugin.version,
    claudePlugin.version,
    brainbaseManifest.version,
  ]).size === 1,
  "Manifest versions must match",
);
assert(brainbaseManifest.version === version, "Unexpected package version");
assert(brainbaseManifest.repository === REPOSITORY, "Brainbase URL is stale");

for (const component of brainbaseManifest.components) {
  const componentPath = path.join(ROOT, component.path);
  assert(fs.existsSync(componentPath), `Missing component: ${component.path}`);
  assert(
    dirChecksum(componentPath) === component.checksum,
    `Checksum mismatch: ${component.path}`,
  );
}

const templateMcp = brainbaseManifest.components.find(
  (component) => component.type === "mcp",
)?.meta?.mcp;
for (const payload of [
  sharedMcp.mcpServers?.brainbase,
  componentMcp,
  templateMcp,
]) {
  assert(payload?.url === MCP_URL, "MCP URL mismatch");
  for (const forbidden of ["headers", "env", "command"]) {
    assert(!(forbidden in payload), `MCP payload contains ${forbidden}`);
  }
}

assert(
  openAiSubmission.$schema ===
    "https://developers.openai.com/apps-sdk/schemas/chatgpt-app-submission.v1.json",
  "OpenAI submission schema URL mismatch",
);
assert(
  openAiSubmission.schema_version === 1,
  "OpenAI submission schema version mismatch",
);
assert(
  openAiSubmission.app_info?.display_name === "Brainbase MCP",
  "OpenAI submission display name mismatch",
);
assert(
  openAiSubmission.app_info?.display_name ===
    codexPlugin.interface.displayName &&
    openAiSubmission.app_info?.subtitle ===
      codexPlugin.interface.shortDescription &&
    openAiSubmission.app_info?.description ===
      codexPlugin.interface.longDescription,
  "OpenAI submission listing copy does not match the Codex manifest",
);
assert(
  openAiSubmission.app_info?.category === "DEVELOPER_TOOLS",
  "OpenAI submission category mismatch",
);
const submissionTools = openAiSubmission.tools ?? {};
assert(
  Object.keys(submissionTools).length === 46,
  "OpenAI submission must cover all 46 MCP tools",
);
const expectedReadOnlyTools = new Set([
  "orgs_list",
  "teams_list",
  "agents_list",
  "agents_get",
  "agents_get_revision",
  "templates_search",
  "templates_get",
  "skills_search",
  "skills_get",
  "mcp_servers_list",
  "playbooks_list",
  "evals_list",
  "evals_get",
  "evals_results",
  "orchestrations_list",
  "orchestrations_get",
  "tasks_list",
  "tasks_get",
  "tasks_events",
]);
const expectedOpenWorldTools = new Set([
  "templates_search",
  "templates_get",
  "skills_search",
  "skills_get",
  "evals_run",
  "schedules_test",
  "tasks_create",
  "tasks_followup",
]);
const expectedDestructiveTools = new Set([
  "agents_update",
  "instructions_update",
  "agents_delete",
  "skills_attach",
  "skills_detach",
  "mcp_servers_upsert",
  "mcp_servers_remove",
  "playbooks_upsert",
  "playbooks_archive",
  "evals_update",
  "evals_delete",
  "evals_run",
  "orchestrations_update",
  "orchestrations_delete",
  "orchestration_members_remove",
  "orchestration_edges_upsert",
  "orchestration_edges_remove",
  "schedules_upsert",
  "schedules_remove",
  "schedules_test",
  "tasks_create",
  "tasks_followup",
  "tasks_interrupt",
]);
for (const [name, tool] of Object.entries(submissionTools)) {
  for (const [hint, expectedTools] of [
    ["readOnlyHint", expectedReadOnlyTools],
    ["openWorldHint", expectedOpenWorldTools],
    ["destructiveHint", expectedDestructiveTools],
  ]) {
    assert(
      tool.annotations?.[hint] === expectedTools.has(name),
      `OpenAI submission ${name} has a stale ${hint}`,
    );
  }
  for (const hint of [
    "readOnlyHint",
    "openWorldHint",
    "destructiveHint",
  ]) {
    assert(
      typeof tool.annotations?.[hint] === "boolean",
      `OpenAI submission ${name} is missing ${hint}`,
    );
  }
  for (const justification of [
    "read_only_justification",
    "open_world_justification",
    "destructive_justification",
  ]) {
    assert(
      typeof tool.justifications?.[justification] === "string" &&
        tool.justifications[justification].length > 0,
      `OpenAI submission ${name} is missing ${justification}`,
    );
  }
}
assert(
  openAiSubmission.test_cases?.length === 5,
  "OpenAI submission must contain exactly five positive tests",
);
assert(
  openAiSubmission.negative_test_cases?.length === 3,
  "OpenAI submission must contain exactly three negative tests",
);
const reviewerFixture = fs.readFileSync(
  path.join(ROOT, "submission/README.md"),
  "utf8",
);
for (const fixtureName of [
  "Support Triage",
  "Instruction Update Test Agent",
  "Evaluation Test Agent",
  "Schedule Test Agent",
]) {
  assert(
    reviewerFixture.includes(`\`${fixtureName}\``),
    `Reviewer fixture is missing ${fixtureName}`,
  );
}
assert(
  openAiSubmission.test_cases[1].user_prompt.includes(
    "Directory Creation Test Agent",
  ) &&
    openAiSubmission.test_cases[1].user_prompt.includes("idempotency key") &&
    openAiSubmission.test_cases[2].user_prompt.includes(
      "Instruction Update Test Agent",
    ) &&
    openAiSubmission.test_cases[3].user_prompt.includes(
      "Evaluation Test Agent",
    ) &&
    openAiSubmission.test_cases[4].user_prompt.includes("Schedule Test Agent"),
  "OpenAI positive tests must use their independent reviewer fixtures",
);
for (const testCase of openAiSubmission.test_cases) {
  const tools = testCase.tools_triggered
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  assert(tools.length > 0, "OpenAI positive test must trigger a tool");
  for (const name of tools) {
    assert(
      Object.hasOwn(submissionTools, name),
      `OpenAI positive test references unknown tool: ${name}`,
    );
  }
}
for (const testCase of openAiSubmission.negative_test_cases) {
  assert(
    testCase.tools_triggered === null,
    "OpenAI negative tests must not trigger MCP tools",
  );
}
for (const [relativePath, minimum] of [
  ["submission/directory-icon.png", 256],
  ["submission/composer-icon.png", 48],
]) {
  const { width, height } = pngDimensions(relativePath);
  assert(width === height, `${relativePath} must be square`);
  assert(
    width >= minimum,
    `${relativePath} must be at least ${minimum} x ${minimum}`,
  );
}

const skill = fs.readFileSync(
  path.join(ROOT, "skills/brainbase-mcp/SKILL.md"),
  "utf8",
);
const reference = fs.readFileSync(
  path.join(ROOT, "skills/brainbase-mcp/reference.md"),
  "utf8",
);
const skillContent = `${skill}\n${reference}`;
for (const required of [
  "expected_revision",
  "idempotency_key",
  "kafka_cloud",
  "mcp:all",
  "Workflows are excluded",
  "Never use or emulate a whole-manifest",
]) {
  assert(skillContent.includes(required), `Skill is missing: ${required}`);
}

const forbiddenText = [
  `https://new.${"usekafka.com"}`,
  `https://github.com/BrainbaseHQ/${"cli"}`,
];
const credentialPatterns = [
  /bb_live_[A-Za-z0-9_-]{8,}/,
  /Bearer eyJ[A-Za-z0-9_-]+/,
];
for (const file of walkFiles(ROOT)) {
  const content = fs.readFileSync(file);
  if (content.includes(0)) continue;
  const text = content.toString("utf8");
  const relativePath = path.relative(ROOT, file);
  for (const forbidden of forbiddenText) {
    assert(!text.includes(forbidden), `${relativePath} contains ${forbidden}`);
  }
  for (const pattern of credentialPatterns) {
    assert(!pattern.test(text), `${relativePath} may contain a credential`);
  }
}

console.log("Brainbase MCP package validation passed.");
