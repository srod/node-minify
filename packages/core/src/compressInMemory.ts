/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { Settings } from "@node-minify/types";
import { utils } from "@node-minify/utils";

/**
 * Run compressor.
 * @param settings Settings
 */
const compressInMemory = (settings: Settings): Promise<string> | string => {
    if (typeof settings.compressor !== "function") {
        throw new Error(
            "compressor should be a function, maybe you forgot to install the compressor"
        );
    }

    return utils.compressSingleFile(settings);
};

/**
 * Expose `compress()`.
 */
export { compressInMemory };
