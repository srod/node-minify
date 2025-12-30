/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { minify } from "@node-minify/core";
import type { CompressorOptions, Result, Settings } from "@node-minify/types";
import {
    getFilesizeGzippedInBytes,
    getFilesizeInBytes,
} from "@node-minify/utils";

/**
 * Compresses files using the provided settings and returns size metrics for the produced output.
 *
 * @param options - Compression settings including compressor, input, and output configuration. If `options.output` is undefined, an array, or contains the `$1` pattern, size metrics cannot be computed and the result will contain `"0"` for `size` and `sizeGzip`.
 * @returns The compression result containing `compressorLabel`, `size`, and `sizeGzip`. `size` and `sizeGzip` are byte counts represented as strings; when size cannot be determined both will be `"0"`.
 * @throws Error - If compression or file-size calculation fails; the thrown error message is prefixed with "Compression failed: ".
 */
async function compress<T extends CompressorOptions = CompressorOptions>(
    options: Settings<T>
): Promise<Result> {
    try {
        await minify(options);

        const defaultResult: Result = {
            compressorLabel: options.compressorLabel ?? "",
            size: "0",
            sizeGzip: "0",
        };

        // Return default result if output contains pattern, is an array, or is undefined
        // Arrays and $1 patterns produce multiple files, so we can't calculate a single size
        if (
            !options.output ||
            Array.isArray(options.output) ||
            options.output.includes("$1")
        ) {
            return defaultResult;
        }

        // Get file sizes
        const sizeGzip = await getFilesizeGzippedInBytes(options.output);
        const size = getFilesizeInBytes(options.output);

        return {
            ...defaultResult,
            size,
            sizeGzip,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Compression failed: ${errorMessage}`);
    }
}

export { compress };