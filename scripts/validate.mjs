import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPOSITORY = "https://github.com/BrainbaseHQ/brainbase-mcp";
const MCP_URL = "https://api.brainbaselabs.com/mcp";

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
