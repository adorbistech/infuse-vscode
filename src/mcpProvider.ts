import * as vscode from 'vscode';
import {
  DEFAULT_MCP_ENDPOINT,
  CANONICAL_SERVER_VERSION,
  PROVIDER_LABEL,
} from './constants';
import { Logger } from './logger';

export class InfuseMcpServerDefinitionProvider
  implements vscode.McpServerDefinitionProvider
{
  private _onDidChangeMcpServerDefinitions = new vscode.EventEmitter<void>();
  public readonly onDidChangeMcpServerDefinitions: vscode.Event<void> =
    this._onDidChangeMcpServerDefinitions.event;

  private logger = Logger.getInstance();

  public refresh(): void {
    this.logger.debug('Refreshing INFUSE MCP Server Definition Provider.');
    this._onDidChangeMcpServerDefinitions.fire();
  }

  public provideMcpServerDefinitions(
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.McpServerDefinition[]> {
    const config = vscode.workspace.getConfiguration('infuse');
    const enabled = config.get<boolean>('enabled', true);

    if (!enabled) {
      this.logger.log('INFUSE MCP provider is disabled via configuration.');
      return [];
    }

    const endpoint = config.get<string>('endpoint', DEFAULT_MCP_ENDPOINT);
    if (!endpoint || typeof endpoint !== 'string' || !/^https?:\/\//i.test(endpoint.trim())) {
      this.logger.error(`Invalid MCP endpoint configured: "${endpoint}". Must be a valid HTTP/HTTPS URL.`);
      return [];
    }

    this.logger.debug(`Providing INFUSE MCP server definition: ${endpoint.trim()}`);

    try {
      const uri = vscode.Uri.parse(endpoint.trim());
      const serverDefinition = new vscode.McpHttpServerDefinition(
        PROVIDER_LABEL,
        uri,
        {},
        CANONICAL_SERVER_VERSION
      );

      return [serverDefinition];
    } catch (err) {
      this.logger.error(`Failed to create MCP HTTP server definition for ${endpoint}`, err);
      return [];
    }
  }

  public resolveMcpServerDefinition(
    server: vscode.McpServerDefinition,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.McpServerDefinition> {
    this.logger.debug(`Resolving MCP Server Definition: ${server.label}`);
    return server;
  }

  public dispose(): void {
    this._onDidChangeMcpServerDefinitions.dispose();
  }
}
