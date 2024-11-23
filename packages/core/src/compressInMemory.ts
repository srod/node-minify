/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { CompressorReturnType, Settings } from "@node-minify/types";
import { compressSingleFile } from "@node-minify/utils";

/**
 * Run compressor.
 * @param settings Settings
 */
function compressInMemory(settings: Settings): CompressorReturnType {
    if (typeof settings.compressor !== "function") {
        throw new Error(
            "compressor should be a function, maybe you forgot to install the compressor"
        );
    }

    return compressSingleFile(settings);
}

/**
 * Expose `compress()`.
 */
export { compressInMemory };
