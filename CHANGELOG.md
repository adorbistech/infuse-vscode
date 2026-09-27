# Changelog

All notable changes to the **INFUSE Visual Studio Code Adapter** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Initial Release

### Added
- Native VS Code MCP integration using `vscode.lm.registerMcpServerDefinitionProvider`.
- Automatic registration of canonical remote INFUSE MCP server (`https://infuse-api.adorbistech.com/mcp`).
- Full support for Model Context Protocol version `2024-11-05` over Streamable HTTP transport.
- Discovered 12 canonical INFUSE MCP tools:
  - `infuse_execute`
  - `infuse_get_execution`
  - `infuse_get_execution_state`
  - `infuse_get_execution_result`
  - `infuse_list_executions`
  - `infuse_list_events`
  - `infuse_publish_event`
  - `infuse_get_policy`
  - `infuse_list_policies`
  - `infuse_update_policy`
  - `infuse_get_governor_decision`
  - `infuse_control`
- Extension commands:
  - `infuse.testConnection` — Live MCP handshake and latency verification.
  - `infuse.showStatus` — Diagnostic telemetry output and canonical tool surface display.
  - `infuse.openDocs` — Direct link to official INFUSE documentation.
- Extension configuration settings for endpoint URL, enabled state, and logging verbosity.
- Zero local secret storage architecture.
- Full test suite with automated manifest verification, security audit, and live endpoint verification.
