# Security policy

## Reporting a vulnerability

Do not open a public issue for suspected vulnerabilities, leaked credentials,
OAuth problems, authorization bypasses, or destructive-operation failures.

Use GitHub's private vulnerability reporting for this repository:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include affected versions, reproduction steps, expected behavior, and any
   relevant request IDs.

Brainbase will acknowledge the report and coordinate remediation privately.

## Credential handling

This repository must remain credential-free. It must not contain:

- Brainbase access or refresh tokens
- `Authorization` headers
- MCP OAuth client secrets
- task credentials
- environment values
- customer or production data

The remote MCP descriptor contains only the public Brainbase endpoint. OAuth is
completed by the installing client.

If you believe a credential was exposed, revoke or remove the affected client
connection and submit a private report immediately.
