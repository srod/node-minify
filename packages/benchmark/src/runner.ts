/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { statSync } from "node:fs";
import { minify } from "@node-minify/core";
import {
    getFilesizeGzippedInBytes,
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

async function benchmarkFile(
    file: string,
    options: BenchmarkOptions
): Promise<FileResult> {
    const stats = statSync(file);
    const originalSizeBytes = stats.size;
    const originalSize = prettyBytes(originalSizeBytes);
    const results: CompressorMetrics[] = [];

    const compressors = options.compressors || ["terser", "esbuild", "swc"];

    for (const name of compressors) {
        results.push(await benchmarkCompressor(file, name, options));
    }

    return {
        file,
        originalSizeBytes,
        originalSize,
        results,
    };
}

async function benchmarkCompressor(
    file: string,
    name: string,
    options: BenchmarkOptions
): Promise<CompressorMetrics> {
    const compressor = await loadCompressor(name);

    if (!compressor) {
        return {
            compressor: name,
            sizeBytes: 0,
            size: "0 B",
            timeMs: 0,
            reductionPercent: 0,
            success: false,
            error: "Compressor not found or not installed",
        };
    }

    const iterations = options.iterations || 1;
    const warmup = options.warmup ?? (iterations > 1 ? 1 : 0);
    const times: number[] = [];

    try {
        // Warmup
        for (let i = 0; i < warmup; i++) {
            await minify({
                compressor,
                input: file,
                output: `${file}.tmp`,
                type: options.type as any,
                options: options.compressorOptions,
            });
        }

        let lastOutputFile = "";
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            lastOutputFile = `${file}.${name}.tmp`;
            await minify({
                compressor,
                input: file,
                output: lastOutputFile,
                type: options.type as any,
                options: options.compressorOptions,
            });
            times.push(performance.now() - start);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const outStats = statSync(lastOutputFile);
        const sizeBytes = outStats.size;
        const originalStats = statSync(file);

        const metrics: CompressorMetrics = {
            compressor: name,
            sizeBytes,
            size: prettyBytes(sizeBytes),
            timeMs: avgTime,
            timeMinMs: Math.min(...times),
            timeMaxMs: Math.max(...times),
            reductionPercent: calculateReduction(originalStats.size, sizeBytes),
            success: true,
        };

        if (options.includeGzip) {
            metrics.gzipSize = await getFilesizeGzippedInBytes(lastOutputFile);
            // We don't have getRawFilesizeGzippedInBytes yet, so we parse if needed or just use string
        }

        return metrics;
    } catch (err) {
        return {
            compressor: name,
            sizeBytes: 0,
            size: "0 B",
            timeMs: 0,
            reductionPercent: 0,
            success: false,
            error: err instanceof Error ? err.message : String(err),
        };
    }
}

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
