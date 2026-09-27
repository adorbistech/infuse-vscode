import * as vscode from 'vscode';
import {
  PROVIDER_ID,
  DEFAULT_MCP_ENDPOINT,
  CANONICAL_SERVER_NAME,
  CANONICAL_SERVER_VERSION,
  MCP_PROTOCOL_VERSION,
  DOCUMENTATION_URL,
  CANONICAL_TOOLS,
} from './constants';
import { InfuseMcpServerDefinitionProvider } from './mcpProvider';
import { ConnectionChecker } from './connectionChecker';
import { Logger } from './logger';

let provider: InfuseMcpServerDefinitionProvider | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const logger = Logger.getInstance();
  logger.log('INFUSE VS Code Adapter (v0.1.0) activating...');

  provider = new InfuseMcpServerDefinitionProvider();

  // Register MCP Server Definition Provider
  try {
    if (vscode.lm && typeof vscode.lm.registerMcpServerDefinitionProvider === 'function') {
      const registration = vscode.lm.registerMcpServerDefinitionProvider(
        PROVIDER_ID,
        provider
      );
      context.subscriptions.push(registration);
      logger.log(`Registered MCP Server Definition Provider with ID: ${PROVIDER_ID}`);
    } else {
      logger.warn(
        'vscode.lm.registerMcpServerDefinitionProvider is not available in this VS Code version.'
      );
    }
  } catch (err) {
    logger.error('Error during MCP Server Definition Provider registration:', err);
  }

  // Configuration change listener
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('infuse')) {
        logger.log('INFUSE configuration changed, refreshing provider definitions.');
        provider?.refresh();
      }
    })
  );

  // Command: Test MCP Connection
  context.subscriptions.push(
    vscode.commands.registerCommand('infuse.testConnection', async () => {
      logger.log('Manual MCP connection test initiated...');
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'INFUSE: Testing MCP Connection...',
          cancellable: false,
        },
        async () => {
          const config = vscode.workspace.getConfiguration('infuse');
          const endpoint = config.get<string>('endpoint', DEFAULT_MCP_ENDPOINT);

          const result = await ConnectionChecker.testConnection(endpoint);

          if (result.success) {
            const msg = `INFUSE MCP Connected: ${result.serverName} v${result.serverVersion} (${result.discoveredTools.length} tools discovered, ${result.latencyMs}ms)`;
            logger.log(msg);
            logger.log(`Discovered tools: ${result.discoveredTools.join(', ')}`);
            vscode.window.showInformationMessage(msg);
          } else {
            const msg = `INFUSE MCP Connection Failed: ${result.error} (${result.latencyMs}ms)`;
            logger.error(msg);
            vscode.window.showErrorMessage(msg);
          }
        }
      );
    })
  );

  // Command: Show Status & Telemetry
  context.subscriptions.push(
    vscode.commands.registerCommand('infuse.showStatus', async () => {
      logger.show();
      logger.log('============================================================');
      logger.log('INFUSE VS Code Adapter Status');
      logger.log('============================================================');
      logger.log(`Extension Version: 0.1.0`);
      logger.log(`Target MCP Server: ${CANONICAL_SERVER_NAME} (v${CANONICAL_SERVER_VERSION})`);
      logger.log(`MCP Protocol: ${MCP_PROTOCOL_VERSION}`);
      logger.log(`Default Remote Endpoint: ${DEFAULT_MCP_ENDPOINT}`);

      const config = vscode.workspace.getConfiguration('infuse');
      const currentEndpoint = config.get<string>('endpoint', DEFAULT_MCP_ENDPOINT);
      const isEnabled = config.get<boolean>('enabled', true);
      logger.log(`Configured Endpoint: ${currentEndpoint}`);
      logger.log(`Provider Enabled: ${isEnabled}`);
      logger.log('------------------------------------------------------------');
      logger.log('Canonical Tool Surface (12 Tools):');
      CANONICAL_TOOLS.forEach((tool, i) => {
        logger.log(`  ${i + 1}. [${tool.category}] ${tool.name}`);
      });
      logger.log('------------------------------------------------------------');
      logger.log('Verifying live connectivity...');

      const result = await ConnectionChecker.testConnection(currentEndpoint);
      if (result.success) {
        logger.log(`Status: ONLINE (Latency: ${result.latencyMs}ms)`);
        logger.log(`Remote Server: ${result.serverName} v${result.serverVersion}`);
        logger.log(`Remote Protocol: ${result.protocolVersion}`);
        logger.log(`Remote Tools Discovered: ${result.discoveredTools.length}`);
      } else {
        logger.warn(`Status: OFFLINE / UNREACHABLE (${result.error})`);
      }
      logger.log('============================================================');
    })
  );

  // Command: Open Documentation
  context.subscriptions.push(
    vscode.commands.registerCommand('infuse.openDocs', () => {
      vscode.env.openExternal(vscode.Uri.parse(DOCUMENTATION_URL));
    })
  );

  context.subscriptions.push({
    dispose: () => {
      provider?.dispose();
      logger.dispose();
    },
  });

  logger.log('INFUSE VS Code Adapter activated successfully.');
}

export function deactivate(): void {
  provider?.dispose();
}
