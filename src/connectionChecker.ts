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
      if (!endpoint || typeof endpoint !== 'string' || !/^https?:\/\//i.test(endpoint.trim())) {
        return {
          success: false,
          endpoint: endpoint || '',
          discoveredTools: [],
          latencyMs: 0,
          error: 'Invalid endpoint URL: must begin with http:// or https://',
        };
      }

      const trimmedEndpoint = endpoint.trim();

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

      let initResponse: Response;
      try {
        initResponse = await fetch(trimmedEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
          },
          body: JSON.stringify(initPayload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!initResponse.ok) {
        return {
          success: false,
          endpoint: trimmedEndpoint,
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

      const notifyController = new AbortController();
      const notifyTimeout = setTimeout(() => notifyController.abort(), Math.min(timeoutMs, 3000));
      try {
        await fetch(trimmedEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'notifications/initialized',
          }),
          signal: notifyController.signal,
        }).catch(() => {
          // notification failures should not abort tool discovery
        });
      } finally {
        clearTimeout(notifyTimeout);
      }

      // 3. Send tools/list request
      const toolsController = new AbortController();
      const toolsTimeout = setTimeout(() => toolsController.abort(), timeoutMs);
      let toolsResponse: Response;
      try {
        toolsResponse = await fetch(trimmedEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {},
          }),
          signal: toolsController.signal,
        });
      } finally {
        clearTimeout(toolsTimeout);
      }

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
        endpoint: trimmedEndpoint,
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
        endpoint: endpoint || '',
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
          const parsed = JSON.parse(trimmed.substring(6));
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
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
