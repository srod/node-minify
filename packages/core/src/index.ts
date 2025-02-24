/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { CompressorReturnType, Settings } from "@node-minify/types";
import {
    compressSingleFileAsync,
    compressSingleFileSync,
} from "@node-minify/utils";
import { compressAsync, compressSync } from "./compress.ts";
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
    const method = settings.content ? compressSingleFileAsync : compressAsync;

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

export function minifySync(settings: Settings): string {
    const compressorSettings = setup(settings);
    const method = settings.content ? compressSingleFileSync : compressSync;

    try {
        const minified = method(compressorSettings) as string;
        if (settings.callback) {
            settings.callback(null, minified);
        }
        return minified;
    } catch (err) {
        handleError(err, settings.callback);
        throw err;
    }
}
