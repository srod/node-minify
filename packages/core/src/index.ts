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
import { compress } from "./compress.ts";
import { setup } from "./setup.ts";

/**
 * Handle errors for callback and throw.
 * @param err Error
 * @param callback Callback function
 */
function handleError(err: unknown, callback?: (err: Error) => void) {
    if (callback) {
        callback(err as Error);
    }
    throw err;
}

/**
 * Run node-minify.
 * @param settings Settings from user input
 */
export async function minify(
    settings: Settings
): Promise<CompressorReturnType> {
    const compressorSettings = setup(settings);
    const method = settings.content ? compressSingleFile : compress;

    try {
        const minified = await method(compressorSettings);
        if (settings.callback) {
            settings.callback(null, minified);
        }
        return minified;
    } catch (err) {
        handleError(err, settings.callback);
    }
}
