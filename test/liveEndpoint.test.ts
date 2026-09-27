import * as assert from 'assert';
import { ConnectionChecker } from '../src/connectionChecker';
import {
  DEFAULT_MCP_ENDPOINT,
  CANONICAL_SERVER_NAME,
  CANONICAL_SERVER_VERSION,
  MCP_PROTOCOL_VERSION,
  CANONICAL_TOOLS,
} from '../src/constants';

describe('INFUSE Live MCP Handshake & Tool Discovery', () => {
  it('should successfully connect to live remote MCP endpoint and discover 12 tools', async () => {
    console.log(`Connecting to live MCP endpoint: ${DEFAULT_MCP_ENDPOINT}...`);
    const result = await ConnectionChecker.testConnection(DEFAULT_MCP_ENDPOINT, 10000);

    assert.strictEqual(
      result.success,
      true,
      `Failed to connect to live MCP endpoint: ${result.error}`
    );
    assert.strictEqual(result.serverName, CANONICAL_SERVER_NAME);
    assert.strictEqual(result.serverVersion, CANONICAL_SERVER_VERSION);
    assert.strictEqual(result.protocolVersion, MCP_PROTOCOL_VERSION);
    assert.ok(result.latencyMs >= 0, 'Latency must be non-negative');

    console.log(`Live Server: ${result.serverName} v${result.serverVersion}`);
    console.log(`Protocol Version: ${result.protocolVersion}`);
    console.log(`Round-trip Latency: ${result.latencyMs}ms`);
    console.log(`Session ID: ${result.sessionId || '(none)'}`);
    console.log(`Discovered ${result.discoveredTools.length} tools:`);
    result.discoveredTools.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

    assert.strictEqual(
      result.discoveredTools.length,
      12,
      `Expected 12 tools, discovered ${result.discoveredTools.length}`
    );

    const expectedNames = CANONICAL_TOOLS.map((t) => t.name);
    assert.deepStrictEqual(result.discoveredTools, expectedNames);
  });
});
