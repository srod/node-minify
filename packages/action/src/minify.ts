/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { minify } from "@node-minify/core";
import { getFilesizeGzippedRaw, resolveCompressor } from "@node-minify/utils";
import type { ActionInputs, FileResult, MinifyResult } from "./types.ts";

/**
 * Get the size of a file in bytes.
 *
 * @param filePath - Path to the file
 * @returns The file size in bytes
 */
async function getFileSize(filePath: string): Promise<number> {
    const stats = await stat(filePath);
    return stats.size;
}

/**
 * Minifies a single input file according to the provided action inputs and returns summary metrics.
 *
 * Uses `inputs` to resolve input/output paths, run the selected compressor with optional type and options,
 * and optionally computes gzipped size. The result includes per-file metrics and aggregated totals.
 *
 * @param inputs - Configuration for the minification run (input/output paths relative to `workingDirectory`, `compressor` selection, optional `type` and `options`, and `includeGzip` flag)
 * @returns A `MinifyResult` containing:
 *  - `files`: an array with one `FileResult` (`file`, `originalSize`, `minifiedSize`, `reduction`, optional `gzipSize`, `timeMs`)
 *  - `compressor`: the human-readable compressor label
 *  - `totalOriginalSize`: original file size in bytes
 *  - `totalMinifiedSize`: minified file size in bytes
 *  - `totalReduction`: percentage reduction (0–100)
 *  - `totalTimeMs`: elapsed minification time in milliseconds
 */
export async function runMinification(
    inputs: ActionInputs
): Promise<MinifyResult> {
    const { input, output } = inputs;
    if (!input || !output) {
        throw new Error(
            "Input and output files are required for explicit mode"
        );
    }
    const inputPath = resolve(inputs.workingDirectory, input);
    const outputPath = resolve(inputs.workingDirectory, output);

    const originalSize = await getFileSize(inputPath);
    const { compressor, label } = await resolveCompressor(inputs.compressor);

    const startTime = performance.now();

    await minify({
        compressor,
        input: inputPath,
        output: outputPath,
        ...(inputs.type && { type: inputs.type }),
        ...(Object.keys(inputs.options).length > 0 && {
            options: inputs.options,
        }),
    });

    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);

    const minifiedSize = await getFileSize(outputPath);
    const reduction =
        originalSize > 0
            ? ((originalSize - minifiedSize) / originalSize) * 100
            : 0;

    let gzipSize: number | undefined;
    if (inputs.includeGzip) {
        gzipSize = await getFilesizeGzippedRaw(outputPath);
    }

    const fileResult: FileResult = {
        file: input,
        originalSize,
        minifiedSize,
        reduction,
        gzipSize,
        timeMs,
    };

    return {
        files: [fileResult],
        compressor: label,
        totalOriginalSize: originalSize,
        totalMinifiedSize: minifiedSize,
        totalReduction: reduction,
        totalTimeMs: timeMs,
    };
}
