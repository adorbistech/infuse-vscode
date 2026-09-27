<div align="center">

<img src="images/icon.png" alt="INFUSE Logo" width="160" />

# INFUSE for Visual Studio Code

**Execution intelligence and runtime governance for autonomous AI agents in VS Code.**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![MCP Protocol](https://img.shields.io/badge/MCP%20Protocol-2024--11--05-green.svg)](https://modelcontextprotocol.io/)
[![MCP Transport](https://img.shields.io/badge/Transport-Streamable_HTTP-orange.svg)](https://infuse-api.adorbistech.com/mcp)
[![INFUSE MCP](https://img.shields.io/badge/INFUSE%20MCP-v1.30.0-blueviolet.svg)](https://infuse-api.adorbistech.com/mcp)
[![VS Code Engine](https://img.shields.io/badge/VS%20Code-%3E%3D1.102.0-blue.svg)](https://code.visualstudio.com/)

[Official Website](https://infuse.adorbistech.com/) • [GitHub Repository](https://github.com/adorbistech/infuse-vscode) • [Remote MCP Endpoint](https://infuse-api.adorbistech.com/mcp)

</div>

---

## What is INFUSE?

**INFUSE** is an execution intelligence and runtime governance platform engineered for autonomous AI agents, multi-agent systems, and production LLM workflows.

As autonomous AI agents plan, call tools, and execute actions across complex development environments, engineering teams need deterministic safety boundaries, real-time observability, policy evaluation, and operational intervention capabilities. INFUSE provides central runtime observation, evaluated execution states, policy enforcement, cost and token tracking, and operational control boundaries without requiring intrusive changes to agent logic or prompt workflows.

---

## What This Extension Does

The **INFUSE VS Code Extension** is the official integration adapter that connects VS Code AI agents and language model tooling directly to the canonical remote INFUSE Model Context Protocol (MCP) service.

Through native VS Code Model Context Protocol integration (`vscode.lm.registerMcpServerDefinitionProvider`), this extension:
- Automatically registers the canonical INFUSE MCP server with VS Code.
- Exposes the full 12-tool INFUSE MCP surface to VS Code AI agents, Copilot, and language models.
- Provides connection diagnostics, latency tracking, and status inspection commands directly from the editor.
- Connects securely to the canonical remote INFUSE MCP endpoint over Streamable HTTP.

## What This Extension Does NOT Do

Following the architectural foundation of INFUSE:

> **The VS Code extension is a THIN ADAPTER.**

To preserve deterministic safety and centralized governance:
- **No Local Governance Duplication**: The extension does not evaluate policies locally, run a duplicate Governor engine, or simulate execution states.
- **No Duplicate Backend / Database**: All state, executions, metrics, and policy stores remain centralized within the authoritative INFUSE Core.
- **No Local MCP Server**: The extension does not spawn or bundle a local Node/Python MCP server; it connects directly to the canonical remote INFUSE MCP service.
- **No Secret Storage**: The extension does not store, intercept, or manage LLM provider credentials or API secrets.

---

## ONE CORE, MANY ADAPTERS

INFUSE adheres strictly to the **ONE CORE, MANY ADAPTERS** paradigm:

- **Centralized Intelligence & State**: State machines, cost ledgers, historical telemetry, and safety policies live exclusively within the centralized INFUSE backend.
- **Uniform Multi-Environment Governance**: Whether agents operate in VS Code, Cursor, terminal CLIs, custom CI/CD pipelines, or REST APIs, identical governance rules and execution state models apply.
- **Lightweight Adapters**: Editor extensions serve strictly as discovery and routing bridges, delivering remote capabilities cleanly without local bloat.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                      VS Code Agent                      │
│             (GitHub Copilot / Language Models)          │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 INFUSE VS Code Adapter                  │
│       (vscode.lm.registerMcpServerDefinitionProvider)   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    INFUSE Remote MCP                    │
│        Streamable HTTP Transport (2024-11-05)           │
│        https://infuse-api.adorbistech.com/mcp           │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                       INFUSE Core                       │
├────────────────────────────┬────────────────────────────┤
│ • Execution Context        │ • Observation & Telemetry  │
│ • Classification           │ • Execution State Evaluator│
│ • Registry & Routing       │ • Governor Engine          │
│ • Lifecycle Management     │ • Policy Enforcement       │
│ • Control Boundary (ECB)   │ • Cost & Token Tracking    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Agent / Provider Runtime                │
│             (LLMs, Tools, APIs, Services)               │
└─────────────────────────────────────────────────────────┘
```

---

## Remote MCP Specification

The INFUSE VS Code adapter connects directly to the canonical remote MCP endpoint:

- **Endpoint URL**: `https://infuse-api.adorbistech.com/mcp`
- **Transport**: Streamable HTTP (`text/event-stream`)
- **Protocol Version**: `2024-11-05`
- **Server Name**: `infuse`
- **Remote Server Version**: `1.30.0`

---

## Canonical MCP Tool Surface (12 Tools)

The remote INFUSE MCP server provides 12 canonical tools categorized across execution, telemetry observation, governance, and operational control:

| Category | Tool | Description |
| :--- | :--- | :--- |
| **Execution** | `infuse_execute` | Submit a governed AI execution task through INFUSE and return canonical execution results including cost, token metrics, Governor decisions, and execution state. |
| **Observation & Events** | `infuse_get_execution` | Retrieve summary telemetry, status, and metadata for a specific execution by ID. |
| | `infuse_get_execution_state` | Inspect the evaluated execution state, current phase, and associated reason codes. |
| | `infuse_get_execution_result` | Retrieve the final execution result or detailed telemetry summary. |
| | `infuse_list_executions` | List and filter historical execution runs across projects and sessions. |
| | `infuse_list_events` | List structured telemetry and lifecycle events recorded during an execution run. |
| | `infuse_publish_event` | Publish custom execution telemetry events using the canonical INFUSE event envelope. |
| **Governance & Policy** | `infuse_get_policy` | Retrieve an existing governance policy configuration or view the active default policy. |
| | `infuse_list_policies` | List all available governance policies and identify the currently active policy. |
| | `infuse_update_policy` | Create or update governance policy rules, thresholds, and operational constraints. |
| | `infuse_get_governor_decision` | Inspect real-time Governor regulation actions, intervention rationales, and reason codes. |
| **Operational Control** | `infuse_control` | Dispatch runtime operational control signals (`CONTINUE`, `THROTTLE`, `SWITCH`, `STOP`) through the Execution Control Boundary. |

---

## Governance & Execution Control Boundary

During agent operation, the **Governor** in INFUSE Core evaluates execution metrics, policy rules, cost budgets, and error rates in real time:

- **`CONTINUE`**: Execution is within normal operating parameters; proceed normally.
- **`OPTIMIZE`**: Execution is approved with active optimization advice (e.g., token reduction, model downgrade).
- **`THROTTLE`**: Rate limits, budget pacing, or resource constraints require delayed or batched execution.
- **`SWITCH`**: Runtime failures or latency spikes require rerouting to an alternate provider or model fallback.
- **`STOP`**: Hard threshold violation, security policy breach, or anomaly detection; execution is halted immediately.

The **Execution Control Boundary (ECB)** ensures that operational control commands dispatched via `infuse_control` cannot be bypassed or overridden by local client adapters.

---

## Installation & Requirements

### Requirements

- **VS Code**: Version `1.102.0` or higher (MCP Server Definition Provider API support).
- **Network**: HTTPS access to `https://infuse-api.adorbistech.com/mcp`.

### Installation from Marketplace

1. Open VS Code.
2. Open the Extensions view (`Cmd + Shift + X` on macOS / `Ctrl + Shift + X` on Windows/Linux).
3. Search for `INFUSE` (publisher: `adorbistech`).
4. Click **Install**.

### Installation from VSIX

1. Download `infuse-0.1.0.vsix` from the [GitHub Releases](https://github.com/adorbistech/infuse-vscode/releases).
2. Install via command line:
   ```bash
   code --install-extension infuse-0.1.0.vsix
   ```
   Or in VS Code: **Extensions > ... (Views and More Actions) > Install from VSIX...**

---

## Extension Commands

| Command | Title | Description |
| :--- | :--- | :--- |
| `infuse.testConnection` | **INFUSE: Test MCP Connection** | Tests handshake and tool discovery against the remote MCP endpoint and displays latency/tool count. |
| `infuse.showStatus` | **INFUSE: Show Status & Telemetry** | Opens the INFUSE output channel with server details, active endpoints, and canonical tool list. |
| `infuse.openDocs` | **INFUSE: Open Documentation** | Opens the official INFUSE documentation website in your browser. |

---

## Configuration Settings

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `infuse.endpoint` | `string` | `https://infuse-api.adorbistech.com/mcp` | Canonical Remote MCP endpoint URL. |
| `infuse.enabled` | `boolean` | `true` | Enable or disable the INFUSE MCP server provider in VS Code. |
| `infuse.logLevel` | `string` | `"info"` | Logging verbosity level (`"info"`, `"debug"`, `"error"`). |

---

## Local Development & Testing

### Development Workflow

```bash
# Clone the repository
git clone https://github.com/adorbistech/infuse-vscode.git
cd infuse-vscode

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run automated tests (unit, manifest, security, live MCP handshake)
npm test

# Run complete end-to-end validation report
npm run validate

# Package extension into VSIX
npm run package
```

---

## Security & Privacy Boundary

- **Zero Credential Exposure**: The extension does not store, request, or transmit provider API keys or secrets.
- **Zero Local Telemetry Collection**: The adapter collects no user prompts, source code, or telemetry. All telemetry is transmitted exclusively when tools are invoked directly against the remote INFUSE MCP service.
- **Secure Transport**: All communication with the remote MCP service occurs over encrypted HTTPS (`TLS 1.3/1.2`).

For security disclosures, please review our [Security Policy](SECURITY.md).

---

## Support & Links

- **Official Website**: [https://infuse.adorbistech.com/](https://infuse.adorbistech.com/)
- **GitHub Repository**: [https://github.com/adorbistech/infuse-vscode](https://github.com/adorbistech/infuse-vscode)
- **Support Contact**: [info@adorbistech.com](mailto:info@adorbistech.com)
- **Support Documentation**: [SUPPORT.md](SUPPORT.md)

---

## License

This project is licensed under the [Apache License, Version 2.0](LICENSE).
