/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { getReporter } from "./reporters/index.ts";
import { runBenchmark } from "./runner.ts";
import type { BenchmarkOptions, BenchmarkResult } from "./types.ts";

/**
 * Benchmarks minification performance across multiple compressors.
 *
 * When `options.output` is provided, formats the results using `options.format`
 * (default `"console"`), creates any missing parent directories, and writes the
 * report to `options.output` without terminal color codes.
 *
 * @param options - Benchmark options
 * @returns Benchmark results
 */
export async function benchmark(
    options: BenchmarkOptions
): Promise<BenchmarkResult> {
    const results = await runBenchmark(options);

    if (options.output) {
        // Unknown formats fall back to the colored console reporter, so strip for every format.
        const content = stripVTControlCharacters(
            getReporter(options.format)(results)
        );
        await mkdir(path.dirname(options.output), { recursive: true });
        await writeFile(options.output, content, "utf-8");
    }

    return results;
}

export { getReporter } from "./reporters/index.ts";
export * from "./types.ts";
