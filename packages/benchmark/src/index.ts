/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { runBenchmark } from "./runner.ts";
import type { BenchmarkOptions, BenchmarkResult } from "./types.ts";

/**
 * Run a minification benchmark across multiple compressors.
 *
 * @param options - Configuration for the benchmark (input sources, compressors to run, and measurement settings)
 * @returns BenchmarkResult containing per-compressor metrics and an aggregated summary
 */
export async function benchmark(
    options: BenchmarkOptions
): Promise<BenchmarkResult> {
    return runBenchmark(options);
}

export { getReporter } from "./reporters/index.ts";
export * from "./types.ts";