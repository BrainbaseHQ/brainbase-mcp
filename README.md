# Brainbase MCP

The official Brainbase MCP plugin for Codex and Claude Code.

It connects your coding agent to the Brainbase managed-agent control plane and
loads a companion skill for building, testing, deploying, and operating agents
safely.

## What it provides

- A credential-free remote MCP connection to
  `https://api.brainbaselabs.com/mcp`
- Native Brainbase OAuth through Codex or Claude Code
- A maintained skill covering agents, instructions, playbooks, registry
  skills, MCP servers, evals, tasks, orchestrations, and schedules
- Revision-safe targeted writes, idempotent creates, destructive confirmation,
  and explicit billable-run guidance
- A Brainbase package manifest for optional publication to the Brainbase
  template registry

Workflows are intentionally excluded.

## Permissions and safety

Brainbase OAuth requests the `mcp:all` scope. This grants the client
user-wide access to Brainbase resources that the signed-in user can already
access under normal Brainbase permissions. It is not limited to one agent.

That means the MCP can:

- inspect and update agents, including an agent it is attached to;
- manage supported agent components, evals, orchestrations, and schedules;
- start tasks and eval runs that may consume paid Brainbase usage; and
- archive or delete supported resources after revision and name confirmation.

The package contains no tokens, secrets, credential headers, or environment
values. OAuth credentials remain in the installing client and Brainbase.

Inspect changes before approving them, especially operations marked billable or
destructive.

## Requirements

- A Brainbase account
- A current version of Codex or Claude Code with plugin and remote MCP support
- Permission to open `app.brainbaselabs.com` to complete OAuth

## Install in Codex

```sh
codex plugin marketplace add BrainbaseHQ/brainbase-mcp --ref main
codex plugin add brainbase-mcp@brainbase
```

Complete OAuth when Codex prompts during installation or first use, then start
a new thread.

Try:

> Use $brainbase-mcp to list my Brainbase agents and explain which one is safe
> to modify.

Remove it with:

```sh
codex plugin remove brainbase-mcp@brainbase
codex plugin marketplace remove brainbase
```

## Install in Claude Code

```sh
claude plugin marketplace add --scope user BrainbaseHQ/brainbase-mcp
claude plugin install --scope user brainbase-mcp@brainbase
```

Complete OAuth when Claude Code prompts, restart Claude Code, and invoke a
Brainbase tool.

Remove it with:

```sh
claude plugin uninstall --scope user brainbase-mcp@brainbase
claude plugin marketplace remove --scope user brainbase
```

Removing the plugin removes its local configuration. If an OAuth credential may
have been exposed, report it through the private process in
[SECURITY.md](SECURITY.md).

## First-use workflow

1. List organizations and teams rather than guessing IDs.
2. Inspect an agent and obtain its current opaque revision.
3. Make one targeted change.
4. Read the resource back and verify the result.
5. Test behavior with a task or eval before deploying a schedule.

The companion skill applies this workflow automatically when relevant.

## Capability boundaries

Directly supported operations include:

- Agent inspection, creation, updates, archive, and deletion
- Instructions, playbooks, registry skills, and MCP server configuration
- Eval lifecycle and result retrieval
- Orchestration members, edges, schedules, and trigger testing
- Task creation, follow-ups, interruption, and normalized events
- Registry template and skill discovery

Interactive or guided operations include secret entry, third-party OAuth,
browser credentials, memory administration, Slack, meetings, phone, and
external app triggers.

Arbitrary file CRUD, functions, modes, and legacy workflows are not exposed by
this MCP.

## Repository layout

- `.mcp.json` — shared credential-free remote MCP descriptor
- `.codex-plugin/` — Codex plugin metadata
- `.claude-plugin/` — Claude Code plugin and marketplace metadata
- `.agents/plugins/marketplace.json` — Codex marketplace metadata
- `skills/brainbase-mcp/` — maintained skill and reference material
- `components/mcps/brainbase/` — Brainbase package MCP component
- `brainbase.json` — optional Brainbase registry package manifest
- `scripts/validate.mjs` — dependency-free package validation

## Development

Run the repository validation:

```sh
node scripts/validate.mjs
```

Validate with Claude Code:

```sh
claude plugin validate --strict .
```

Test locally in Codex:

```sh
codex plugin marketplace add .
codex plugin add brainbase-mcp@brainbase
```

See [CONTRIBUTING.md](CONTRIBUTING.md) before changing manifests or releasing a
new version.

## Versioning and releases

The package follows semantic versioning. A release updates the version in
`package.json`, both client plugin manifests, and `brainbase.json`.

When the skill or MCP component changes, regenerate the corresponding
`brainbase.json` checksum before release. Pull requests and `main` are validated
by GitHub Actions.

This repository is the canonical source for the Brainbase MCP distribution.
The npm package is intentionally disabled; Codex and Claude Code install from
this Git repository.

## Support

- Product documentation: <https://docs.brainbaselabs.com>
- Product website: <https://brainbaselabs.com>
- Bugs and feature requests:
  <https://github.com/BrainbaseHQ/brainbase-mcp/issues>
- Security reports: [SECURITY.md](SECURITY.md)

## License

[MIT](LICENSE)
