import { expect, test } from "bun:test";
import { formatPendingBatchList } from "./queue-list.ts";
import type { CapturedBatch } from "./types.js";

function batch(
  turnIndex: number,
  toolCalls: Array<{ name: string; result: string; isError?: boolean }>,
): CapturedBatch {
  return {
    turnIndex,
    timestamp: 0,
    assistantText: "",
    toolCalls: toolCalls.map((toolCall, index) => ({
      toolCallId: `${turnIndex}-${index}`,
      toolName: toolCall.name,
      args: {},
      resultText: toolCall.result,
      isError: toolCall.isError ?? false,
    })),
  };
}

test("reports an empty prune queue", () => {
  expect(formatPendingBatchList([])).toBe("pruner queue: empty");
});

test("lists queued batches using the original queue-inspection format", () => {
  expect(
    formatPendingBatchList([
      batch(4, [
        { name: "read", result: "r".repeat(1500) },
        { name: "bash", result: "oops", isError: true },
      ]),
      batch(9, [{ name: "edit", result: "x".repeat(200) }]),
    ]),
  ).toBe(
    [
      "pruner queue: 3 tool calls in 2 batches",
      "total: 1,704 chars",
      "  batch 1: 1,504 chars (2 tool calls)",
      "  batch 2: 200 chars (1 tool call)",
    ].join("\n"),
  );
});

test("uses singular labels for a one-call, one-batch queue", () => {
  expect(formatPendingBatchList([batch(3, [{ name: "read", result: "x" }])])).toBe(
    [
      "pruner queue: 1 tool call in 1 batch",
      "total: 1 chars",
      "  batch 1: 1 chars (1 tool call)",
    ].join("\n"),
  );
});
