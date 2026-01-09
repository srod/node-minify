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

async function getFileSize(filePath: string): Promise<number> {
    const stats = await stat(filePath);
    return stats.size;
}

export async function runMinification(
    inputs: ActionInputs
): Promise<MinifyResult> {
    const inputPath = resolve(inputs.workingDirectory, inputs.input);
    const outputPath = resolve(inputs.workingDirectory, inputs.output);

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
        file: inputs.input,
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
