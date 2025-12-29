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
 * Run compression.
 * @param options Settings
 */
async function compress<T extends CompressorOptions = CompressorOptions>(
    options: Settings<T>
): Promise<Result> {
    try {
        await minify(options as any);

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
