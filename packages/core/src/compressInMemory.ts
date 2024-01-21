/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { Settings } from "@node-minify/types";
/**
 * Module dependencies.
 */
import { utils } from "@node-minify/utils";

/**
 * Run compressor.
 *
 * @param {Object} settings
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
