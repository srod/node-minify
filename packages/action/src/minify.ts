/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { stat } from "node:fs/promises";
import { relative, resolve } from "node:path";
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
 * Convert an absolute filesystem path to a repository-relative path.
 *
 * @param filePath - Absolute path to normalize
 * @returns Repository-relative path using POSIX separators
 */
function toRepositoryPath(filePath: string): string {
    return relative(process.cwd(), filePath).replace(/\\/g, "/");
}

/**
 * Minifies one file with the named compressor and measures the result.
 *
 * The compressor is resolved before the input is read, so a removed or unknown
 * compressor fails before any file is touched.
 *
 * @param args.compressor - Compressor name to resolve
 * @param args.inputPath - Path of the file to minify, absolute or relative to the cwd
 * @param args.outputPath - Path to write the minified file to, absolute or relative to the cwd
 * @param args.file - Name reported in the `FileResult`
 * @param args.type - File type hint passed to `minify`, when set
 * @param args.options - Compressor options passed to `minify`, when non-empty
 * @param args.includeGzip - Whether to measure the gzipped size of the output
 * @returns The `FileResult` and the human-readable compressor label
 */
export async function minifyAndMeasure({
    compressor: compressorName,
    inputPath,
    outputPath,
    file,
    type,
    options,
    includeGzip,
}: {
    compressor: string;
    inputPath: string;
    outputPath: string;
    file: string;
    type?: "js" | "css";
    options?: Record<string, unknown>;
    includeGzip: boolean;
}): Promise<{ fileResult: FileResult; label: string }> {
    const { compressor, label } = await resolveCompressor(compressorName);
    const originalSize = await getFileSize(inputPath);

    const startTime = performance.now();

    await minify({
        compressor,
        input: inputPath,
        output: outputPath,
        ...(type && { type }),
        ...(options && Object.keys(options).length > 0 && { options }),
    });

    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);

    const minifiedSize = await getFileSize(outputPath);
    const reduction =
        originalSize > 0
            ? ((originalSize - minifiedSize) / originalSize) * 100
            : 0;

    let gzipSize: number | undefined;
    if (includeGzip) {
        gzipSize = await getFilesizeGzippedRaw(outputPath);
    }

    return {
        fileResult: {
            file,
            outputFile: toRepositoryPath(outputPath),
            originalSize,
            minifiedSize,
            reduction,
            gzipSize,
            timeMs,
        },
        label,
    };
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

    const { fileResult, label } = await minifyAndMeasure({
        compressor: inputs.compressor,
        inputPath,
        outputPath,
        file: input,
        type: inputs.type,
        options: inputs.options,
        includeGzip: inputs.includeGzip,
    });

    return {
        files: [fileResult],
        compressor: label,
        totalOriginalSize: fileResult.originalSize,
        totalMinifiedSize: fileResult.minifiedSize,
        totalReduction: fileResult.reduction,
        totalTimeMs: fileResult.timeMs,
    };
}
