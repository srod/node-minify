/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { info, setFailed, warning } from "@actions/core";
import { context } from "@actions/github";
import { minify } from "@node-minify/core";
import { getFilesizeGzippedRaw, resolveCompressor } from "@node-minify/utils";
import { addAnnotations } from "./annotations.ts";
import type { FileType } from "./autoDetect.ts";
import {
    detectFileType,
    groupFilesByType,
    selectCompressor,
} from "./autoDetect.ts";
import { runBenchmark } from "./benchmark.ts";
import { checkThresholds } from "./checks.ts";
import { postPRComment } from "./comment.ts";
import { compareWithBase } from "./compare.ts";
import { discoverFiles, generateOutputPath } from "./discover.ts";
import { parseInputs, validateCompressor } from "./inputs.ts";
import { runMinification } from "./minify.ts";
import { setBenchmarkOutputs, setMinifyOutputs } from "./outputs.ts";
import {
    generateBenchmarkSummary,
    generateSummary,
} from "./reporters/summary.ts";
import type { ActionInputs, FileResult, MinifyResult } from "./types.ts";

/**
 * Splits an array into chunks of the specified size.
 *
 * @param array - The array to split
 * @param size - Maximum size of each chunk
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
    if (!Number.isInteger(size) || size <= 0) {
        throw new TypeError(
            `chunkArray size must be a positive integer, got: ${size}`
        );
    }
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Get the size of a file in bytes.
 */
async function getFileSize(filePath: string): Promise<number> {
    const stats = await stat(filePath);
    return stats.size;
}

/**
 * Runs the explicit mode minification workflow (original behavior).
 *
 * @param inputs - Validated action inputs with input/output paths
 * @returns A promise that resolves when the operation completes.
 */
export async function runExplicitMode(inputs: ActionInputs): Promise<void> {
    validateCompressor(inputs.compressor);

    info(`Minifying ${inputs.input} with ${inputs.compressor}...`);

    const result = await runMinification(inputs);

    setMinifyOutputs(result);

    if (inputs.reportSummary) {
        await generateSummary(result);
    }

    if (inputs.reportPRComment && context.payload.pull_request) {
        const comparisons = await compareWithBase(result, inputs.githubToken);
        await postPRComment(result, inputs.githubToken, comparisons);
    }

    if (inputs.reportAnnotations) {
        addAnnotations(result);
    }

    if (inputs.benchmark) {
        info(
            `Running benchmark with compressors: ${inputs.benchmarkCompressors.join(", ")}...`
        );
        const benchmarkResult = await runBenchmark(inputs);
        setBenchmarkOutputs(benchmarkResult);

        if (inputs.reportSummary) {
            await generateBenchmarkSummary(benchmarkResult);
        }

        if (benchmarkResult.recommended) {
            info(`🏆 Benchmark winner: ${benchmarkResult.recommended}`);
        }
    }

    const thresholdError = checkThresholds(result.totalReduction, inputs);
    if (thresholdError) {
        setFailed(thresholdError);
        return;
    }

    info(
        `✅ Minification complete! ${result.totalReduction.toFixed(1)}% reduction in ${result.totalTimeMs}ms`
    );
}

/**
 * Runs the auto mode minification workflow with file discovery and type-based processing.
 *
 * @param inputs - Validated action inputs with auto mode enabled
 * @returns A promise that resolves when the operation completes.
 */
export async function runAutoMode(inputs: ActionInputs): Promise<void> {
    // Normalize outputDir and build ignore glob to prevent re-processing
    let normalizedOutputDir = inputs.outputDir
        .replace(/^\.\//, "")
        .replace(/\\/g, "/");
    // Preserve "." for current directory to avoid invalid glob "**//**"
    if (normalizedOutputDir === "") {
        normalizedOutputDir = ".";
    }
    const outputDirIgnore = `**/${normalizedOutputDir}/**`;

    const files = discoverFiles({
        patterns: inputs.patterns,
        ignore: [...(inputs.additionalIgnore ?? []), outputDirIgnore],
        workingDirectory: inputs.workingDirectory,
        dryRun: inputs.dryRun,
    });

    const emptyResult: MinifyResult = {
        files: [],
        compressor: "auto",
        totalOriginalSize: 0,
        totalMinifiedSize: 0,
        totalReduction: 0,
        totalTimeMs: 0,
    };

    if (files.length === 0) {
        warning("No files found matching patterns");
        setMinifyOutputs(emptyResult);
        return;
    }

    if (inputs.dryRun) {
        info(`[dry-run] Would process ${files.length} files`);
        setMinifyOutputs(emptyResult);
        return;
    }

    const grouped = groupFilesByType(files);

    // Check compressor availability first
    for (const [type, typeFiles] of Object.entries(grouped)) {
        if (typeFiles.length === 0) continue;
        const { compressor, package: pkg } = selectCompressor(type as FileType);
        try {
            await resolveCompressor(compressor);
        } catch {
            throw new Error(
                `Compressor for ${type} files not found. Run: npm install ${pkg}`
            );
        }
    }

    // Create output directory
    await mkdir(path.join(inputs.workingDirectory, inputs.outputDir), {
        recursive: true,
    });

    // Process files with concurrency limit
    const allResults: FileResult[] = [];
    const failures: { file: string; error: string }[] = [];
    const chunks = chunkArray(files, 4);

    for (const chunk of chunks) {
        const results = await Promise.allSettled(
            chunk.map(async (file) => {
                const outputPath = generateOutputPath(file, inputs.outputDir);
                const inputPath = path.join(inputs.workingDirectory, file);
                const fullOutputPath = path.join(
                    inputs.workingDirectory,
                    outputPath
                );

                // Ensure output directory exists
                await mkdir(path.dirname(fullOutputPath), { recursive: true });

                const fileType = detectFileType(file);

                const { compressor, type } = selectCompressor(
                    fileType as FileType
                );
                const { compressor: compressorFn, label } =
                    await resolveCompressor(compressor);

                const originalSize = await getFileSize(inputPath);
                const startTime = performance.now();

                await minify({
                    compressor: compressorFn,
                    input: inputPath,
                    output: fullOutputPath,
                    ...(type && { type }),
                });

                const endTime = performance.now();
                const timeMs = Math.round(endTime - startTime);
                const minifiedSize = await getFileSize(fullOutputPath);
                const reduction =
                    originalSize > 0
                        ? ((originalSize - minifiedSize) / originalSize) * 100
                        : 0;

                let gzipSize: number | undefined;
                if (inputs.includeGzip) {
                    gzipSize = await getFilesizeGzippedRaw(fullOutputPath);
                }

                return {
                    file,
                    originalSize,
                    minifiedSize,
                    reduction,
                    gzipSize,
                    timeMs,
                    compressor: label,
                } as FileResult & { compressor: string };
            })
        );

        for (const [i, result] of results.entries()) {
            const file = chunk[i];
            if (result.status === "fulfilled") {
                allResults.push(result.value);
            } else if (file !== undefined) {
                failures.push({
                    file,
                    error:
                        result.reason instanceof Error
                            ? result.reason.message
                            : String(result.reason),
                });
            }
        }
    }

    // Report results
    if (failures.length > 0) {
        warning(`${failures.length} files failed to minify:`);
        for (const { file, error } of failures) {
            warning(`  - ${file}: ${error}`);
        }
    }

    if (allResults.length === 0) {
        setFailed("All files failed to minify");
        return;
    }

    // Generate summary using existing function (stub for now - Task 6 will implement generateAutoModeSummary)
    const totalOriginalSize = allResults.reduce(
        (sum, r) => sum + r.originalSize,
        0
    );
    const totalMinifiedSize = allResults.reduce(
        (sum, r) => sum + r.minifiedSize,
        0
    );
    const totalReduction =
        totalOriginalSize > 0
            ? ((totalOriginalSize - totalMinifiedSize) / totalOriginalSize) *
              100
            : 0;
    const totalTimeMs = allResults.reduce((sum, r) => sum + r.timeMs, 0);

    const minifyResult: MinifyResult = {
        files: allResults,
        compressor: "auto",
        totalOriginalSize,
        totalMinifiedSize,
        totalReduction,
        totalTimeMs,
    };

    setMinifyOutputs(minifyResult);

    if (inputs.reportSummary) {
        await generateSummary(minifyResult);
    }

    const thresholdError = checkThresholds(minifyResult.totalReduction, inputs);
    if (thresholdError) {
        setFailed(thresholdError);
        return;
    }

    info(
        `✅ Auto mode complete! Processed ${allResults.length} files with ${totalReduction.toFixed(1)}% total reduction in ${totalTimeMs}ms`
    );
}

export const _internal = {
    runAutoMode,
    runExplicitMode,
};

/**
 * Orchestrates the minification workflow for the GitHub Action.
 *
 * Parses and validates inputs, runs the minification, and persists outputs.
 * Optionally generates a summary, posts a pull-request comment when running in a PR, and adds annotations based on inputs.
 * If configured thresholds are violated or an error is thrown, signals action failure with an explanatory message.
 *
 * @returns A promise that resolves when the operation completes.
 */
export async function run(): Promise<void> {
    try {
        const inputs = parseInputs();

        if (inputs.auto) {
            await _internal.runAutoMode(inputs);
        } else {
            await _internal.runExplicitMode(inputs);
        }
    } catch (error) {
        if (error instanceof Error) {
            setFailed(error.message);
        } else {
            setFailed("An unknown error occurred");
        }
    }
}

run();
