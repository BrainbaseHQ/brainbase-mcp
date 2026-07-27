# OpenAI plugin submission

This directory contains the public, credential-free assets used to submit
Brainbase MCP to the OpenAI Plugins Directory.

## Plugin info

- Name: `Brainbase MCP`
- Subtitle: `Build and operate AI agents`
- Category: `Developer Tools`
- Developer identity: `Brainbase Labs`
- Website: <https://brainbaselabs.com>
- Customer support: <https://github.com/BrainbaseHQ/brainbase-mcp/issues>
- Privacy policy: <https://brainbaselabs.com/privacy>
- Terms of service: <https://brainbaselabs.com/terms>
- Commerce declaration: leave the purchase-link checkbox unselected because
  the plugin exposes no checkout, billing, credit-purchase, or upgrade flow

Description:

> Brainbase MCP lets users create, inspect, update, test, deploy, and monitor
> managed AI agents from ChatGPT and Codex. It supports revision-safe agent
> changes, registry skills and MCP server configuration, evaluations,
> orchestrations, schedules, and task runs, with explicit confirmation for
> destructive actions and OAuth-based access to the user's Brainbase workspace.

Upload `../chatgpt-app-submission.json` to import the app information, all 46
tool annotation justifications, five positive tests, and three negative tests.

## Starter prompts

- `List my Brainbase agents and explain which one is safest to modify.`
- `Create and test a Brainbase agent that summarizes customer feedback.`
- `Build an inactive scheduled orchestration and test it with sample input.`

## Release notes

> Initial public submission of Brainbase MCP with its maintained operating
> skill. The plugin connects to the production Brainbase MCP through OAuth and
> supports managed-agent configuration, registry components, evals, tasks,
> orchestrations, and schedules. It does not expose billing or purchase flows;
> actions that start agent or eval runs may consume an existing Brainbase
> account balance and disclose that before execution.

## Assets

- `directory-icon.png`: 512 × 512 PNG for the Plugins Directory
- `composer-icon.png`: 512 × 512 PNG for the ChatGPT composer

Both assets use the existing Brainbase product icon and satisfy the portal's
minimum square-image dimensions.

## Demo recording

Record the final demo in Developer Mode against a disposable reviewer fixture.
Do not show credentials, auth headers, environment values, internal logs, or
unrelated customer data.

1. Connect Brainbase MCP and complete Brainbase OAuth.
2. List organizations, teams, and agents; inspect one agent.
3. Update only that agent's instructions with a fresh revision and verify it.
4. Search for a registry skill and attach it, or update one credential-free MCP
   server configuration, then verify the agent.
5. Create and run an enabled eval after disclosing that the run is billable;
   inspect the resulting task and eval result.
6. Create an orchestration, add an agent, add an inactive schedule, test the
   persisted schedule after billable-run disclosure, and inspect task events.
7. Demonstrate that deletion requires the exact resource name and current
   revision; cancel before deleting the reviewer fixture.
8. Show the same plugin and main read workflow in ChatGPT web, iOS, and Android.

Upload the finished recording to a durable public or unlisted HTTPS URL and add
that URL to the portal.

## Reviewer fixture

Create a dedicated Brainbase reviewer account that can complete OAuth without
MFA, SMS, or email-confirmation dependencies during review. Seed it with a
disposable organization and team containing these exact independent fixtures:

- `Support Triage`, for the read-only discovery test
- `Instruction Update Test Agent`, for the revision-safe instruction test
- `Evaluation Test Agent`, for the eval creation and run test
- `Schedule Test Agent`, for the orchestration and schedule test
- one enabled eval, one orchestration with an inactive schedule, one playbook,
  and representative task history for the demo

The creation test owns `Directory Creation Test Agent` and must use an
idempotency key so reruns resolve the same resource. The eval and orchestration
tests must create or reuse their named resources. Do not make any test depend on
another test having run first. Store credentials only in the submission portal,
never in this repository.

## Final portal checks

- Select the verified Brainbase Labs business identity.
- Use the production MCP URL: `https://api.brainbaselabs.com/mcp`.
- Include the packaged Brainbase operating skill.
- Run **Scan Tools** and confirm all 46 tools and their annotations.
- Add the portal-generated challenge token at
  `https://api.brainbaselabs.com/.well-known/openai-apps-challenge` through a
  narrowly scoped environment variable and plain-text response.
- Run all eight imported tests against the reviewer fixture.
- Confirm the plugin has no billing, checkout, or digital-goods purchase tools.
- Paste the release notes above.
- Select only countries where Brainbase's product, support, terms, and privacy
  commitments are currently available.
- Complete the policy attestations and add the demo URL.
- Review the full draft before selecting **Submit for review**.

## Repository readiness

The production MCP hardening is complete: all 46 tools have human-readable
metadata, structured output schemas, aligned annotations, bounded and sanitized
responses, revision-safe mutations, and explicit billable/destructive
semantics. The package validator checks the final listing limits, branding
assets, tool annotations, imported tests, and credential-free source tree.

Before uploading, regenerate `../chatgpt-app-submission.json` with the official
OpenAI Developers plugin's `chatgpt-app-submission` skill and confirm the
generated file is unchanged. Then run `node scripts/validate.mjs`.

## Remaining external steps

- Merge the submission package and publish GitHub release `v0.1.1`.
- Confirm the live OAuth metadata points to the canonical MCP documentation.
- Obtain the domain challenge token from the portal, configure the production
  endpoint, and complete **Verify Domain**.
- Create the reviewer account and disposable fixture described above.
- Record and host the cross-platform demo.
- Complete the live tool scan, imported tests, availability, policy
  attestations, and final portal review.
