export interface McpToolAnnotations {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
  annotations?: McpToolAnnotations;
}

export type ToolHandler = (args: unknown) => Promise<unknown>;

export interface ToolBundle {
  tools: McpToolDefinition[];
  handlers: Record<string, ToolHandler>;
}
