/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { resolve } from "node:path";
import { benchmark } from "@node-minify/benchmark";
import type { ActionInputs, BenchmarkResult } from "./types.ts";

/**
 * Run benchmark comparison across multiple compressors.
 *
 * Uses the @node-minify/benchmark package to run each compressor and
 * converts the results to the action's BenchmarkResult format.
 *
 * @param inputs - Action inputs containing input file, benchmark compressors, and options
 * @returns BenchmarkResult with per-compressor metrics and recommendations
 */
export async function runBenchmark(
    inputs: ActionInputs
): Promise<BenchmarkResult> {
    const inputPath = resolve(inputs.workingDirectory, inputs.input);

    const result = await benchmark({
        input: inputPath,
        compressors: inputs.benchmarkCompressors,
        includeGzip: inputs.includeGzip,
        type: inputs.type,
        iterations: 1,
    });

    // Convert benchmark package result to action's BenchmarkResult type
    // The benchmark package returns results per-file, we take the first file
    const fileResult = result.files[0];
    if (!fileResult) {
        return {
            file: inputs.input,
            originalSize: 0,
            compressors: [],
            recommended: undefined,
            bestCompression: undefined,
            bestSpeed: undefined,
        };
    }

    return {
        file: inputs.input,
        originalSize: fileResult.originalSizeBytes,
        compressors: fileResult.results.map((r) => ({
            compressor: r.compressor,
            success: r.success,
            size: r.sizeBytes,
            reduction: r.reductionPercent,
            gzipSize: typeof r.gzipSize === "string" ? undefined : r.gzipSize,
            timeMs: r.timeMs,
            error: r.error,
        })),
        recommended:
            result.summary.recommended !== "N/A"
                ? result.summary.recommended
                : undefined,
        bestCompression:
            result.summary.bestCompression !== "N/A"
                ? result.summary.bestCompression
                : undefined,
        bestSpeed:
            result.summary.bestPerformance !== "N/A"
                ? result.summary.bestPerformance
                : undefined,
    };
}
