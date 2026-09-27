/**
 * INFUSE VS Code Adapter Constants
 *
 * Canonical endpoint and protocol contracts for connecting to the remote
 * INFUSE Model Context Protocol (MCP) service.
 */

export const DEFAULT_MCP_ENDPOINT = 'https://infuse-api.adorbistech.com/mcp';
export const CANONICAL_SERVER_NAME = 'infuse';
export const CANONICAL_SERVER_VERSION = '1.30.0';
export const MCP_PROTOCOL_VERSION = '2024-11-05';
export const PROVIDER_ID = 'infuse.mcp-servers';
export const PROVIDER_LABEL = 'INFUSE';
export const DOCUMENTATION_URL = 'https://infuse.adorbistech.com/';
export const REPOSITORY_URL = 'https://github.com/adorbistech/infuse-vscode';
export const SUPPORT_EMAIL = 'info@adorbistech.com';

export interface CanonicalToolDefinition {
  name: string;
  category: 'Execution' | 'Observation & Events' | 'Governance & Policy' | 'Operational Control';
  description: string;
}

export const CANONICAL_TOOLS: readonly CanonicalToolDefinition[] = [
  {
    name: 'infuse_execute',
    category: 'Execution',
    description: 'Submit a governed AI execution task through INFUSE and return canonical execution results including cost, token metrics, Governor decisions, and execution state.',
  },
  {
    name: 'infuse_get_execution',
    category: 'Observation & Events',
    description: 'Retrieve summary telemetry, status, and metadata for a specific execution by ID.',
  },
  {
    name: 'infuse_get_execution_state',
    category: 'Observation & Events',
    description: 'Inspect the evaluated execution state, current phase, and associated reason codes.',
  },
  {
    name: 'infuse_get_execution_result',
    category: 'Observation & Events',
    description: 'Retrieve the final execution result or detailed telemetry summary.',
  },
  {
    name: 'infuse_list_executions',
    category: 'Observation & Events',
    description: 'List and filter historical execution runs across projects and sessions.',
  },
  {
    name: 'infuse_list_events',
    category: 'Observation & Events',
    description: 'List structured telemetry and lifecycle events recorded during an execution run.',
  },
  {
    name: 'infuse_publish_event',
    category: 'Observation & Events',
    description: 'Publish custom execution telemetry events using the canonical INFUSE event envelope.',
  },
  {
    name: 'infuse_get_policy',
    category: 'Governance & Policy',
    description: 'Retrieve an existing governance policy configuration or view the active default policy.',
  },
  {
    name: 'infuse_list_policies',
    category: 'Governance & Policy',
    description: 'List all available governance policies and identify the currently active policy.',
  },
  {
    name: 'infuse_update_policy',
    category: 'Governance & Policy',
    description: 'Create or update governance policy rules, thresholds, and operational constraints.',
  },
  {
    name: 'infuse_get_governor_decision',
    category: 'Governance & Policy',
    description: 'Inspect real-time Governor regulation actions, intervention rationales, and reason codes.',
  },
  {
    name: 'infuse_control',
    category: 'Operational Control',
    description: 'Dispatch runtime operational control signals (CONTINUE, THROTTLE, SWITCH, STOP) through the Execution Control Boundary.',
  },
] as const;
