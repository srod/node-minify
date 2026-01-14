/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { statSync, unlinkSync } from "node:fs";
import { minify } from "@node-minify/core";
import type { Compressor } from "@node-minify/types";
import {
    getFilesizeBrotliInBytes,
    getFilesizeBrotliRaw,
    getFilesizeGzippedInBytes,
    getFilesizeGzippedRaw,
    prettyBytes,
    wildcards,
} from "@node-minify/utils";
import { loadCompressor } from "./compressor-loader.ts";
import { calculateRecommendedScore, calculateReduction } from "./metrics.ts";
import type {
    BenchmarkOptions,
    BenchmarkResult,
    CompressorMetrics,
    FileResult,
} from "./types.ts";

/**
 * Run warmup iterations for a compressor to stabilize JIT and caches.
 *
 * @param file - Input file path
 * @param compressor - The compressor function
 * @param warmupFile - Path for warmup output file
 * @param warmupCount - Number of warmup iterations
 * @param options - Benchmark options containing type and compressor options
 */
export async function runWarmup(
    file: string,
    compressor: Compressor,
    warmupFile: string,
    warmupCount: number,
    options: Pick<BenchmarkOptions, "type" | "compressorOptions">
): Promise<void> {
    for (let i = 0; i < warmupCount; i++) {
        await minify({
            compressor,
            input: file,
            output: warmupFile,
            ...(options.type && { type: options.type as "js" | "css" }),
            options: options.compressorOptions,
        });
    }
}

/**
 * Result of running timed iterations.
 */
export type IterationsResult = {
    times: number[];
    outputFile: string;
};

/**
 * Run timed iterations of a compressor and return timing data.
 *
 * @param file - Input file path
 * @param compressor - The compressor function
 * @param outputFileBase - Base path for output files (will be used as final output)
 * @param iterationCount - Number of iterations to run
 * @param options - Benchmark options containing type and compressor options
 * @returns The array of iteration times and the final output file path
 */
export async function runIterations(
    file: string,
    compressor: Compressor,
    outputFileBase: string,
    iterationCount: number,
    options: Pick<BenchmarkOptions, "type" | "compressorOptions">
): Promise<IterationsResult> {
    if (iterationCount < 1) {
        throw new Error(
            `iterationCount must be at least 1, got ${iterationCount}`
        );
    }

    const times: number[] = [];

    for (let i = 0; i < iterationCount; i++) {
        const start = performance.now();
        await minify({
            compressor,
            input: file,
            output: outputFileBase,
            ...(options.type && { type: options.type as "js" | "css" }),
            options: options.compressorOptions,
        });
        times.push(performance.now() - start);
    }

    return { times, outputFile: outputFileBase };
}

/**
 * Calculate final metrics from iteration results.
 *
 * @param name - Compressor name
 * @param times - Array of iteration times in ms
 * @param outputFile - Path to the output file (for size measurement)
 * @param originalSizeBytes - Original file size in bytes
 * @param options - Benchmark options for optional gzip/brotli/verbose
 * @returns Populated CompressorMetrics object
 */
export async function calculateCompressorMetrics(
    name: string,
    times: number[],
    outputFile: string,
    originalSizeBytes: number,
    options: Pick<BenchmarkOptions, "includeGzip" | "includeBrotli" | "verbose">
): Promise<CompressorMetrics> {
    if (times.length === 0) {
        throw new Error(
            `Cannot calculate metrics for '${name}': no timing data provided`
        );
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const outStats = statSync(outputFile);
    const sizeBytes = outStats.size;

    const metrics: CompressorMetrics = {
        compressor: name,
        sizeBytes,
        size: prettyBytes(sizeBytes),
        timeMs: avgTime,
        timeMinMs: Math.min(...times),
        timeMaxMs: Math.max(...times),
        iterationTimes: options.verbose ? times : undefined,
        reductionPercent: calculateReduction(originalSizeBytes, sizeBytes),
        success: true,
    };

    if (options.includeGzip) {
        metrics.gzipSize = await getFilesizeGzippedInBytes(outputFile);
        metrics.gzipBytes = await getFilesizeGzippedRaw(outputFile);
    }

    if (options.includeBrotli) {
        metrics.brotliSize = await getFilesizeBrotliInBytes(outputFile);
        metrics.brotliBytes = await getFilesizeBrotliRaw(outputFile);
    }

    return metrics;
}

/**
 * Create an error metrics object for failed compressor runs.
 *
 * @param name - Compressor name
 * @param error - The error message or Error object
 * @returns CompressorMetrics indicating failure
 */
export function createErrorMetrics(
    name: string,
    error: string | Error
): CompressorMetrics {
    return {
        compressor: name,
        sizeBytes: 0,
        size: "0 B",
        timeMs: 0,
        reductionPercent: 0,
        success: false,
        error: error instanceof Error ? error.message : error,
    };
}

/**
 * Clean up temporary files created during benchmarking.
 *
 * @param files - Array of file paths to delete
 */
export function cleanupTempFiles(files: string[]): void {
    for (const file of files) {
        try {
            unlinkSync(file);
        } catch {
            // Ignore cleanup errors
        }
    }
}

/**
 * Run a complete benchmark across all input files and compressors.
 *
 * @param options - Benchmark configuration
 * @returns Complete benchmark results with file results and summary
 */
export async function runBenchmark(
    options: BenchmarkOptions
): Promise<BenchmarkResult> {
    const inputFiles = Array.isArray(options.input)
        ? options.input
        : [options.input];
    const files: string[] = [];

    for (const pattern of inputFiles) {
        const matched = (await wildcards(pattern)) as { input?: string[] };
        if (matched?.input) {
            files.push(...matched.input);
        } else if (typeof pattern === "string") {
            files.push(pattern);
        }
    }

    const uniqueFiles = [...new Set(files)];
    const fileResults: FileResult[] = [];

    for (const file of uniqueFiles) {
        fileResults.push(await benchmarkFile(file, options));
    }

    return {
        timestamp: new Date().toISOString(),
        options,
        files: fileResults,
        summary: calculateSummary(fileResults),
    };
}

/**
 * Benchmarks a single input file using the configured compressors.
 *
 * @param file - Path to the input file to benchmark
 * @param options - Benchmark configuration
 * @returns FileResult with original size and per-compressor metrics
 */
async function benchmarkFile(
    file: string,
    options: BenchmarkOptions
): Promise<FileResult> {
    const stats = statSync(file);
    const originalSizeBytes = stats.size;
    const originalSize = prettyBytes(originalSizeBytes);
    const results: CompressorMetrics[] = [];

    const compressors = options.compressors || [
        "terser",
        "esbuild",
        "swc",
        "oxc",
    ];

    for (const name of compressors) {
        if (options.onProgress) {
            options.onProgress(name, file);
        }
        results.push(
            await benchmarkCompressor(file, name, options, originalSizeBytes)
        );
    }

    return {
        file,
        originalSizeBytes,
        originalSize,
        results,
    };
}

/**
 * Benchmark a single compressor against a single file.
 *
 * @param file - Input file path
 * @param name - Compressor name
 * @param options - Benchmark options
 * @param originalSizeBytes - Original file size for reduction calculation
 * @returns CompressorMetrics with timing and size data
 */
async function benchmarkCompressor(
    file: string,
    name: string,
    options: BenchmarkOptions,
    originalSizeBytes: number
): Promise<CompressorMetrics> {
    const compressor = await loadCompressor(name);

    if (!compressor) {
        return createErrorMetrics(
            name,
            "Compressor not found or not installed"
        );
    }

    const iterations = options.iterations || 1;
    const warmup = options.warmup ?? (iterations > 1 ? 1 : 0);
    const tempFiles: string[] = [];
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
        const warmupFile = `${file}.warmup.${uniqueId}.tmp`;
        if (warmup > 0) {
            await runWarmup(file, compressor, warmupFile, warmup, options);
            tempFiles.push(warmupFile);
        }

        const outputFile = `${file}.${name}.${uniqueId}.tmp`;
        const { times } = await runIterations(
            file,
            compressor,
            outputFile,
            iterations,
            options
        );
        tempFiles.push(outputFile);

        const metrics = await calculateCompressorMetrics(
            name,
            times,
            outputFile,
            originalSizeBytes,
            options
        );

        cleanupTempFiles(tempFiles);
        return metrics;
    } catch (err) {
        cleanupTempFiles(tempFiles);
        return createErrorMetrics(
            name,
            err instanceof Error ? err.message : String(err)
        );
    }
}

/**
 * Calculate summary statistics from all file results.
 *
 * @param files - Array of FileResult objects
 * @returns Summary with best compression, performance, and recommended compressor
 */
function calculateSummary(files: FileResult[]): BenchmarkResult["summary"] {
    const allResults = files.flatMap((f) => f.results).filter((r) => r.success);

    if (allResults.length === 0) {
        return {
            bestCompression: "N/A",
            bestPerformance: "N/A",
            recommended: "N/A",
        };
    }

    const bestCompression = allResults.reduce((prev, curr) =>
        curr.reductionPercent > prev.reductionPercent ? curr : prev
    ).compressor;

    const bestPerformance = allResults.reduce((prev, curr) =>
        curr.timeMs < prev.timeMs ? curr : prev
    ).compressor;

    const recommended = allResults.reduce((prev, curr) => {
        const prevScore = calculateRecommendedScore(
            prev.timeMs,
            prev.reductionPercent
        );
        const currScore = calculateRecommendedScore(
            curr.timeMs,
            curr.reductionPercent
        );
        return currScore > prevScore ? curr : prev;
    }).compressor;

    return {
        bestCompression,
        bestPerformance,
        recommended,
    };
}
