# Security Policy

## Security Architecture & Boundaries

The **INFUSE Visual Studio Code Extension** is a thin client adapter that connects VS Code language models and agent tools to the canonical remote INFUSE Model Context Protocol (MCP) service.

- **Zero Credential Storage**: The extension does not store, intercept, persist, or transmit LLM provider API keys, user secrets, or private tokens.
- **No Embedded Secrets**: No API keys, credentials, or production tokens are embedded in the source code, packaging, or committed repository artifacts.
- **Authoritative Backend Boundary**: All policy evaluations, runtime state validations, Governor interventions, and Execution Control Boundary (ECB) safety limits are enforced remotely on the authoritative INFUSE Core service.
- **Encrypted Transport**: All communication with the remote MCP service is conducted strictly over encrypted HTTPS (`TLS 1.2` or higher).

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within the INFUSE VS Code adapter or associated INFUSE services, please do **NOT** open a public issue.

Instead, please send a detailed vulnerability report via email to:

**info@adorbistech.com**

Please include:
1. Description of the vulnerability.
2. Steps to reproduce or proof-of-concept.
3. Affected components or versions.
4. Any potential mitigations or suggested fixes.

Our security team will acknowledge receipt of your report within 48 hours and work with you through responsible disclosure.
