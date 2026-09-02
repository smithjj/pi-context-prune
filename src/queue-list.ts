import type { CapturedBatch } from "./types.js";

function rawCharCount(batch: CapturedBatch): number {
  return batch.toolCalls.reduce((total, toolCall) => total + toolCall.resultText.length, 0);
}

/**
 * Builds the model-free queue view used by `/pruner list`.
 * This matches the original queue-inspection output while keeping formatting
 * separate from command wiring for direct, reproducible verification.
 */
export function formatPendingBatchList(batches: CapturedBatch[]): string {
  const queued = batches.reduce((total, batch) => total + batch.toolCalls.length, 0);
  if (queued === 0) return "pruner queue: empty";

  const totalChars = batches.reduce((total, batch) => total + rawCharCount(batch), 0);
  const details = batches.map((batch, index) => {
    const chars = rawCharCount(batch);
    return `  batch ${index + 1}: ${chars.toLocaleString()} chars (${batch.toolCalls.length} tool call${batch.toolCalls.length === 1 ? "" : "s"})`;
  });

  return (
    `pruner queue: ${queued} tool call${queued === 1 ? "" : "s"} in ${batches.length} batch${batches.length === 1 ? "" : "es"}\n` +
    `total: ${totalChars.toLocaleString()} chars\n` +
    details.join("\n")
  );
}
