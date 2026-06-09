import { AllureApiClient } from "./client.js";
import { createLaunchTools } from "./tools/launches.js";
import { createTestCaseTools } from "./tools/test-cases.js";
import { createTestPlanTools } from "./tools/test-plans.js";
import { createTestResultTools } from "./tools/test-results.js";
import { McpToolDefinition, ToolHandler } from "./tools/types.js";

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function parseReadOnlyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return ["true", "1", "yes"].includes(value.trim().toLowerCase());
}

export interface BuildToolRegistryOptions {
  readOnly?: boolean;
}

export function buildToolRegistry(
  client: AllureApiClient,
  options: BuildToolRegistryOptions = {},
): { tools: McpToolDefinition[]; handlers: Map<string, ToolHandler> } {
  const bundles = [
    createTestCaseTools(client),
    createLaunchTools(client),
    createTestResultTools(client),
    createTestPlanTools(client),
  ];

  const tools: McpToolDefinition[] = [];
  const handlers = new Map<string, ToolHandler>();
  for (const bundle of bundles) {
    for (const tool of bundle.tools) {
      // Fail-closed: in read-only mode expose only tools explicitly marked read-only.
      if (options.readOnly && tool.annotations?.readOnlyHint !== true) {
        continue;
      }
      const handler = bundle.handlers[tool.name];
      if (!handler) {
        continue;
      }
      tools.push(tool);
      handlers.set(tool.name, handler);
    }
  }

  return { tools, handlers };
}
