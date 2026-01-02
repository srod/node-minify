/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { BenchmarkResult } from "../types.ts";

/**
 * Produce a pretty-printed JSON representation of a benchmark result.
 *
 * @param result - The benchmark result to serialize
 * @returns A JSON string of `result` formatted with 2-space indentation
 */
export function formatJsonOutput(result: BenchmarkResult): string {
    return JSON.stringify(result, null, 2);
}