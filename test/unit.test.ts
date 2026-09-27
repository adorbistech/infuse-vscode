import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import {
  DEFAULT_MCP_ENDPOINT,
  CANONICAL_SERVER_NAME,
  CANONICAL_SERVER_VERSION,
  MCP_PROTOCOL_VERSION,
  PROVIDER_ID,
  CANONICAL_TOOLS,
} from '../src/constants';

describe('INFUSE Adapter Unit Tests', () => {
  it('should define canonical MCP constants correctly', () => {
    assert.strictEqual(DEFAULT_MCP_ENDPOINT, 'https://infuse-api.adorbistech.com/mcp');
    assert.strictEqual(CANONICAL_SERVER_NAME, 'infuse');
    assert.strictEqual(CANONICAL_SERVER_VERSION, '1.30.0');
    assert.strictEqual(MCP_PROTOCOL_VERSION, '2024-11-05');
    assert.strictEqual(PROVIDER_ID, 'infuse.mcp-servers');
  });

  it('should include all 12 canonical INFUSE tools', () => {
    assert.strictEqual(CANONICAL_TOOLS.length, 12);

    const expectedTools = [
      'infuse_execute',
      'infuse_get_execution',
      'infuse_get_execution_state',
      'infuse_get_execution_result',
      'infuse_list_executions',
      'infuse_list_events',
      'infuse_publish_event',
      'infuse_get_policy',
      'infuse_list_policies',
      'infuse_update_policy',
      'infuse_get_governor_decision',
      'infuse_control',
    ];

    const definedNames = CANONICAL_TOOLS.map((t) => t.name);
    assert.deepStrictEqual(definedNames, expectedTools);
  });

  it('should validate package.json manifest integrity', () => {
    const pkgPath = path.resolve(__dirname, '../../package.json');
    assert.ok(fs.existsSync(pkgPath), 'package.json must exist');

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.strictEqual(pkg.name, 'infuse');
    assert.strictEqual(pkg.displayName, 'INFUSE');
    assert.strictEqual(pkg.version, '0.1.0');
    assert.strictEqual(pkg.license, 'Apache-2.0');
    assert.strictEqual(pkg.publisher, 'adorbistech');
    assert.ok(pkg.engines && pkg.engines.vscode, 'engines.vscode must be specified');
    assert.ok(pkg.icon, 'icon must be specified');

    const iconPath = path.resolve(__dirname, '../../', pkg.icon);
    assert.ok(fs.existsSync(iconPath), 'icon file must exist at specified path');

    const contributes = pkg.contributes;
    assert.ok(contributes, 'contributes section must exist');
    assert.ok(
      Array.isArray(contributes.mcpServerDefinitionProviders),
      'mcpServerDefinitionProviders must be an array'
    );
    assert.strictEqual(
      contributes.mcpServerDefinitionProviders[0].id,
      'infuse.mcp-servers'
    );
  });

  it('should verify zero secrets or credentials in codebase', () => {
    const repoRoot = path.resolve(__dirname, '../../');
    const sensitivePatterns = [
      /sk-[a-zA-Z0-9]{20,}/i,
      /ghp_[a-zA-Z0-9]{20,}/i,
      /bearer\s+[a-zA-Z0-9\-._~+/]+=*/i,
      /password\s*=\s*["'][^"']+["']/i,
      /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
    ];

    function scanDir(dir: string): void {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === 'out' ||
          entry.name === 'images' ||
          entry.name.endsWith('.vsix')
        ) {
          continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const pattern of sensitivePatterns) {
            assert.strictEqual(
              pattern.test(content),
              false,
              `Found potential secret matching ${pattern} in ${fullPath}`
            );
          }
        }
      }
    }

    scanDir(repoRoot);
  });
});
