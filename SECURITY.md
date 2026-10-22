# Security Policy

## Security Architecture & Boundaries

The **INFUSE Visual Studio Code Extension** is a thin client adapter that connects VS Code language models and agent tools to the canonical remote INFUSE Model Context Protocol (MCP) service.

### Governed Execution Paths
* **Remote MCP Tool Invocations:** Agent tool executions routed to the 12 canonical INFUSE MCP tools (`infuse_execute`, `infuse_control`, `infuse_update_policy`, etc.) pass directly to the authoritative INFUSE Core backend.
* **Authoritative Policy & Governor Evaluation:** All task classifications, policy thresholds, Governor regulation signals (`CONTINUE`, `THROTTLE`, `SWITCH`, `STOP`), and cost/token tracking are evaluated and enforced remotely by INFUSE Core.
* **Zero Credential Storage:** The extension does not store, intercept, persist, or transmit LLM provider API keys, user secrets, or private tokens.
* **Encrypted Transport:** All communication with the remote MCP service is conducted strictly over encrypted HTTPS (`TLS 1.2` or higher).

### Platform Boundaries (Ungoverned Routes)
* **Native Host Model Inference:** Direct Copilot and VS Code Language Model token generation occurs out-of-band directly with LLM providers and does not route through MCP tool servers.
* **Native VS Code Tool & Editor Operations:** Direct VS Code terminal executions, workspace file modifications, and internal extension commands are governed solely by VS Code platform permissions and do not pass through MCP providers.
* **Third-Party MCP Servers:** Out-of-band MCP servers configured in VS Code settings operate independently and do not route through INFUSE.

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
