import { describe, expect, it } from "vitest";
import {
  buildToolRegistry,
  parseReadOnlyFlag,
} from "../../src/server-bootstrap.js";
import { createMockClient } from "./tool-test-helpers.js";

const READ_ONLY_SAMPLE = [
  "list_test_cases",
  "search_test_cases",
  "get_test_case",
  "list_launches",
  "get_launch",
  "list_test_results",
  "get_test_result",
  "list_test_plans",
  "get_test_plan",
];

const MUTATING_SAMPLE = [
  "create_test_case",
  "update_test_case",
  "delete_test_case",
  "set_test_case_tags",
  "restore_test_case",
  "rename_custom_field_value",
  "merge_custom_field_values",
  "create_launch",
  "delete_launch",
  "close_launch",
  "reopen_launch",
  "create_test_result",
  "assign_test_result",
  "resolve_test_result",
  "create_test_plan",
  "delete_test_plan",
  "run_test_plan",
];

describe("buildToolRegistry", () => {
  it("exposes both read and mutating tools by default", () => {
    const client = createMockClient(1);
    const { tools, handlers } = buildToolRegistry(client as never);

    const names = new Set(tools.map((tool) => tool.name));
    for (const name of [...READ_ONLY_SAMPLE, ...MUTATING_SAMPLE]) {
      expect(names.has(name)).toBe(true);
      expect(handlers.has(name)).toBe(true);
    }
    // tools and handlers stay in parity.
    expect(handlers.size).toBe(tools.length);
  });

  it("exposes only read-only tools when readOnly is enabled", () => {
    const client = createMockClient(1);
    const { tools, handlers } = buildToolRegistry(client as never, { readOnly: true });

    const names = new Set(tools.map((tool) => tool.name));

    for (const name of READ_ONLY_SAMPLE) {
      expect(names.has(name)).toBe(true);
      expect(handlers.has(name)).toBe(true);
    }

    for (const name of MUTATING_SAMPLE) {
      expect(names.has(name)).toBe(false);
      expect(handlers.has(name)).toBe(false);
    }
  });

  it("read-only registry contains only tools explicitly hinted read-only", () => {
    const client = createMockClient(1);
    const { tools, handlers } = buildToolRegistry(client as never, { readOnly: true });

    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) {
      expect(tool.annotations?.readOnlyHint).toBe(true);
    }
    // No mutating handler leaks through even though it was filtered from the list.
    expect(handlers.size).toBe(tools.length);
  });

  it("read-only registry is strictly smaller than the full registry", () => {
    const client = createMockClient(1);
    const full = buildToolRegistry(client as never);
    const readOnly = buildToolRegistry(client as never, { readOnly: true });

    expect(readOnly.tools.length).toBeLessThan(full.tools.length);
  });
});

describe("parseReadOnlyFlag", () => {
  it("treats true/1/yes (case-insensitive) as enabled", () => {
    expect(parseReadOnlyFlag("true")).toBe(true);
    expect(parseReadOnlyFlag("1")).toBe(true);
    expect(parseReadOnlyFlag("YES")).toBe(true);
    expect(parseReadOnlyFlag(" True ")).toBe(true);
  });

  it("treats undefined/empty/other values as disabled", () => {
    expect(parseReadOnlyFlag(undefined)).toBe(false);
    expect(parseReadOnlyFlag("")).toBe(false);
    expect(parseReadOnlyFlag("false")).toBe(false);
    expect(parseReadOnlyFlag("0")).toBe(false);
    expect(parseReadOnlyFlag("no")).toBe(false);
  });
});
