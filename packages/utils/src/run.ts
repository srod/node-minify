/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Settings } from "@node-minify/types";
import { ValidationError } from "./error.ts";

interface RunParameters {
    settings: Settings;
    content?: string;
    index?: number;
}

/**
 * Run compressor in async mode.
 * @param params Object containing settings, content, and optional index
 * @returns Promise resolving to the compressed content
 * @throws {ValidationError} If settings or compressor are not provided
 * @throws {Error} If compression fails
 * @example
 * const result = await runAsync({
 *   settings: { compressor: myCompressor },
 *   content: 'function foo() {}'
 * })
 */
export async function run({
    settings,
    content,
    index,
}: RunParameters): Promise<string> {
    if (!settings) {
        throw new ValidationError("Settings must be provided");
    }

    if (!settings.compressor) {
        throw new ValidationError("Compressor must be provided in settings");
    }

    const result = await settings.compressor({
        settings,
        content,
        index,
    });

    return result;
}
