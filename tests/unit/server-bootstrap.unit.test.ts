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

// Exhaustive expected set of read-only tools. Pinning the full set (not just a
// sample) catches mis-annotation in both directions: a mutating tool wrongly
// marked readOnlyHint: true, or a read tool that lost its annotation.
const EXPECTED_READ_ONLY = [
  // test cases
  "list_test_cases",
  "search_test_cases",
  "get_test_case",
  "get_test_case_overview",
  "get_test_case_history",
  "get_test_case_scenario",
  "get_test_case_steps",
  "get_test_case_tags",
  "get_test_case_issues",
  "list_project_custom_fields",
  "list_custom_field_values",
  "get_test_case_custom_fields",
  "search_test_cases_by_missing_field",
  // launches
  "list_launches",
  "search_launches",
  "get_launch",
  "get_launch_statistic",
  "get_launch_progress",
  // test results
  "list_test_results",
  "search_test_results",
  "get_test_result",
  "get_test_result_history",
  // test plans
  "list_test_plans",
  "get_test_plan",
  // shared steps
  "get_shared_step",
  "get_shared_step_steps",
];

const EXPECTED_TOTAL_TOOLS = 56;

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

  it("read-only registry exposes exactly the expected set of tools", () => {
    const client = createMockClient(1);
    const full = buildToolRegistry(client as never);
    const readOnly = buildToolRegistry(client as never, { readOnly: true });

    // Full registry size is pinned so adding/removing tools is a conscious change.
    expect(full.tools).toHaveLength(EXPECTED_TOTAL_TOOLS);

    // The read-only set must match exactly — not merely be a subset. This fails
    // if a mutating tool is accidentally marked readOnlyHint: true.
    const readOnlyNames = readOnly.tools.map((tool) => tool.name).sort();
    expect(readOnlyNames).toEqual([...EXPECTED_READ_ONLY].sort());
    expect(readOnly.handlers.size).toBe(EXPECTED_READ_ONLY.length);
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
