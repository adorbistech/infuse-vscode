import {
  DEFAULT_MCP_ENDPOINT,
  CANONICAL_SERVER_NAME,
  CANONICAL_SERVER_VERSION,
  MCP_PROTOCOL_VERSION,
} from './constants';

export interface McpConnectionStatus {
  success: boolean;
  endpoint: string;
  serverName?: string;
  serverVersion?: string;
  protocolVersion?: string;
  discoveredTools: string[];
  latencyMs: number;
  sessionId?: string;
  error?: string;
}

export interface McpToolItem {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export class ConnectionChecker {
  /**
   * Performs an authoritative, non-destructive handshake and tool discovery
   * against the remote MCP endpoint using the Streamable HTTP transport.
   */
  public static async testConnection(
    endpoint: string = DEFAULT_MCP_ENDPOINT,
    timeoutMs: number = 8000
  ): Promise<McpConnectionStatus> {
    const startTime = Date.now();
    try {
      // 1. Send initialize request
      const initPayload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: {
            name: 'infuse-vscode',
            version: '0.1.0',
          },
        },
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const initResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify(initPayload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!initResponse.ok) {
        return {
          success: false,
          endpoint,
          discoveredTools: [],
          latencyMs: Date.now() - startTime,
          error: `HTTP ${initResponse.status}: ${initResponse.statusText}`,
        };
      }

      const sessionId = initResponse.headers.get('mcp-session-id') || undefined;
      const initText = await initResponse.text();
      const initData = this.parseMcpMessage(initText);

      const serverName = initData?.result?.serverInfo?.name;
      const serverVersion = initData?.result?.serverInfo?.version;
      const protocolVersion = initData?.result?.protocolVersion;

      // 2. Send initialized notification (if session active)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      };
      if (sessionId) {
        headers['mcp-session-id'] = sessionId;
      }

      await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
        }),
      }).catch(() => {
        // notification failures should not abort tool discovery
      });

      // 3. Send tools/list request
      const toolsResponse = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {},
        }),
      });

      let discoveredTools: string[] = [];
      if (toolsResponse.ok) {
        const toolsText = await toolsResponse.text();
        const toolsData = this.parseMcpMessage(toolsText);
        if (Array.isArray(toolsData?.result?.tools)) {
          discoveredTools = toolsData.result.tools.map((t: McpToolItem) => t.name);
        }
      }

      return {
        success: true,
        endpoint,
        serverName: serverName || CANONICAL_SERVER_NAME,
        serverVersion: serverVersion || CANONICAL_SERVER_VERSION,
        protocolVersion: protocolVersion || MCP_PROTOCOL_VERSION,
        discoveredTools,
        latencyMs: Date.now() - startTime,
        sessionId,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        endpoint,
        discoveredTools: [],
        latencyMs: Date.now() - startTime,
        error: errorMessage,
      };
    }
  }

  /**
   * Helper to parse SSE stream message or direct JSON-RPC payload
   */
  private static parseMcpMessage(text: string): any {
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        try {
          return JSON.parse(trimmed.substring(6));
        } catch {
          // continue parsing next line
        }
      }
    }
    // Try raw JSON parse if not in SSE format
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
}
