import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSharedStepTools } from "../../../src/tools/shared-steps.js";
import * as api from "../../../src/api/shared-steps.js";
import {
  createMockClient,
  expectObjectSchemas,
  expectRequiredFields,
  expectToolHandlerParity,
} from "../tool-test-helpers.js";

vi.mock("../../../src/api/shared-steps.js", () => ({
  getSharedStep: vi.fn(),
  getSharedStepSteps: vi.fn(),
}));

describe("createSharedStepTools", () => {
  const defaultProjectId = 15;
  const client = createMockClient(defaultProjectId);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defines tool schemas and handlers for every shared step tool", () => {
    const bundle = createSharedStepTools(client as never);
    expectToolHandlerParity(bundle);
    expectObjectSchemas(bundle);
  });

  it("has expected required fields in tool schemas", () => {
    const bundle = createSharedStepTools(client as never);

    expectRequiredFields(bundle.tools, "get_shared_step", ["id"]);
    expectRequiredFields(bundle.tools, "get_shared_step_steps", ["id"]);
  });

  it("shared step handlers forward id", async () => {
    const bundle = createSharedStepTools(client as never);
    vi.mocked(api.getSharedStep).mockResolvedValueOnce({});
    vi.mocked(api.getSharedStepSteps).mockResolvedValueOnce({});

    await bundle.handlers.get_shared_step({ id: 7 });
    await bundle.handlers.get_shared_step_steps({ id: 7 });

    expect(api.getSharedStep).toHaveBeenCalledWith(client, 7);
    expect(api.getSharedStepSteps).toHaveBeenCalledWith(client, 7);
  });

  it("get_shared_step validates id", async () => {
    const bundle = createSharedStepTools(client as never);
    await expect(bundle.handlers.get_shared_step({})).rejects.toThrow(
      '"id" must be a number.',
    );
  });

  it("get_shared_step_steps validates id", async () => {
    const bundle = createSharedStepTools(client as never);
    await expect(bundle.handlers.get_shared_step_steps({})).rejects.toThrow(
      '"id" must be a number.',
    );
  });
});
