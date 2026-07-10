import type { AllureApiClient } from "../client.js";
import * as api from "../api/shared-steps.js";
import type { ToolBundle } from "./types.js";
import { asObject, getRequiredId } from "./utils.js";

export function createSharedStepTools(client: AllureApiClient): ToolBundle {
  const tools = [
    {
      name: "get_shared_step",
      description: "Get a shared step by ID (name and metadata).",
      inputSchema: {
        type: "object" as const,
        properties: { id: { type: "number" } },
        required: ["id"],
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: "get_shared_step_steps",
      description:
        "Get the steps that make up a shared step. Use to expand sharedStepId references returned by get_test_case_steps.",
      inputSchema: {
        type: "object" as const,
        properties: { id: { type: "number" } },
        required: ["id"],
      },
      annotations: { readOnlyHint: true },
    },
  ];

  const handlers = {
    get_shared_step: async (rawArgs: unknown) => {
      const args = asObject(rawArgs);
      return api.getSharedStep(client, getRequiredId(args));
    },
    get_shared_step_steps: async (rawArgs: unknown) => {
      const args = asObject(rawArgs);
      return api.getSharedStepSteps(client, getRequiredId(args));
    },
  };

  return { tools, handlers };
}
