# Contributing

Thanks for helping improve Brainbase MCP.

## Development setup

The repository has no runtime package dependencies. Use Node.js 20 or newer:

```sh
node scripts/validate.mjs
```

If Claude Code is installed, also run:

```sh
claude plugin validate --strict .
```

For a local Codex installation test:

```sh
codex plugin marketplace add .
codex plugin add brainbase-mcp@brainbase
```

Use a temporary `CODEX_HOME` or remove the local marketplace afterward if you
do not want to change your normal Codex configuration.

## Pull requests

- Keep the MCP descriptor credential-free.
- Do not add tokens, authorization headers, environment values, or private
  service URLs.
- Keep Codex, Claude Code, package, and Brainbase manifest versions aligned.
- Update component checksums whenever files under that component change.
- Preserve inspect-before-edit, revision checks, idempotency, and destructive
  confirmation in the skill.
- Keep legacy workflows excluded.
- Run the full validation before opening a pull request.

## Releasing

1. Update the semantic version in `package.json`,
   `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and
   `brainbase.json`.
2. Regenerate changed component checksums.
3. Run `node scripts/validate.mjs`.
4. Test installation in clean Codex and Claude Code homes.
5. Merge through a pull request.
6. Create a matching `vMAJOR.MINOR.PATCH` GitHub release.

The npm package remains private by design. GitHub is the distribution channel.
