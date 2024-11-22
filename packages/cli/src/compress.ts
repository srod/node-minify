/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { minify } from "@node-minify/core";
import type { Result, Settings } from "@node-minify/types";
import { utils } from "@node-minify/utils";

/**
 * Run compression.
 * @param options Settings
 */
async function compress(options: Settings): Promise<Result> {
    try {
        await minify(options);

        // Default result object when no output or using pattern
        const defaultResult: Result = {
            compressorLabel: options.compressorLabel ?? "",
            compressor: options.compressor,
            size: "0",
            sizeGzip: "0",
        };

        // Return default result if output contains pattern or is undefined
        if (!options.output || options.output.includes("$1")) {
            return defaultResult;
        }

        // Get file sizes
        const sizeGzip = await utils.getFilesizeGzippedInBytes(options.output);
        const size = utils.getFilesizeInBytes(options.output);

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

/**
 * Expose `compress()`.
 */
export { compress };
