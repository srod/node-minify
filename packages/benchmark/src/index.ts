/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { runBenchmark } from "./runner.ts";
import type { BenchmarkOptions, BenchmarkResult } from "./types.ts";

/**
 * Benchmarks minification performance across multiple compressors.
 *
 * @param options - Benchmark options
 * @returns Benchmark results
 */
export async function benchmark(
    options: BenchmarkOptions
): Promise<BenchmarkResult> {
    return runBenchmark(options);
}

export { getReporter } from "./reporters/index.ts";
export * from "./types.ts";
