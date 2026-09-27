# Support Information

Thank you for using the **INFUSE Visual Studio Code Extension**.

## Getting Help

- **Documentation**: Comprehensive architecture, tool contracts, and integration guides are available at [https://infuse.adorbistech.com/](https://infuse.adorbistech.com/).
- **GitHub Issues**: For bug reports, feature requests, and adapter-specific issues, please file an issue on our [GitHub Issue Tracker](https://github.com/adorbistech/infuse-vscode/issues).
- **Email Support**: For enterprise inquiries, technical support, or governance policy assistance, contact us directly at **info@adorbistech.com**.

## Troubleshooting Common Issues

### 1. MCP Server Offline or Unreachable
- Verify your workstation has internet connectivity.
- Verify HTTPS access to `https://infuse-api.adorbistech.com/mcp`.
- Execute the VS Code command `INFUSE: Test MCP Connection` (`Cmd+Shift+P` / `Ctrl+Shift+P`) to inspect latency and connection status.

### 2. Tools Not Appearing in VS Code Agent
- Ensure your VS Code version is `1.102.0` or higher.
- Verify `infuse.enabled` is set to `true` in VS Code Settings.
- Run `INFUSE: Show Status & Telemetry` to view active provider registration.
- Reload the VS Code window via `Developer: Reload Window`.
