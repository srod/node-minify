/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
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
    isValidFileAsync,
} from "@node-minify/utils";

/**
 * Run the configured compressor and, when possible, include output file sizes in the result.
 *
 * When `options.output` is a single file path (not an array and not containing the `$1` pattern),
 * the returned result will include `size` and `sizeGzip` with the output file's byte sizes; otherwise
 * those fields will be `"0"`.
 *
 * @param options - Compression settings; if `options.output` is a single path the returned result may include computed `size` and `sizeGzip`
 * @returns The compression result containing:
 *  - `compressorLabel`: label of the compressor,
 *  - `size`: output file size in bytes as a string (or `"0"` if not computed),
 *  - `sizeGzip`: gzipped output size in bytes as a string (or `"0"` if not computed)
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

        // Check if file exists (may not exist if allowEmptyOutput skipped writing)
        const fileExists = await isValidFileAsync(options.output);
        if (!fileExists) {
            return defaultResult;
        }

        // Get file sizes - let IO/permission errors propagate
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
