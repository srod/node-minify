/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { BenchmarkResult } from "../types.ts";

export function formatJsonOutput(result: BenchmarkResult): string {
    return JSON.stringify(result, null, 2);
}
