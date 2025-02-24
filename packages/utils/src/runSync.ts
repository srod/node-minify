/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorReturnType, Settings } from "@node-minify/types";
import { ValidationError } from "./types.ts";

interface RunSyncParameters {
    settings: Settings;
    content?: string;
    index?: number;
}

/**
 * Run compressor in synchronous mode.
 * @param params Object containing settings, content, and optional index
 * @returns Compressed content
 * @throws {ValidationError} If settings or compressor are not provided
 * @throws {Error} If compression fails
 * @example
 * const result = runSync({
 *   settings: { compressor: myCompressor },
 *   content: 'function foo() {}'
 * })
 */
export function runSync({
    settings,
    content,
    index,
}: RunSyncParameters): CompressorReturnType {
    if (!settings) {
        throw new ValidationError("Settings must be provided");
    }

    if (!settings.compressor) {
        throw new ValidationError("Compressor must be provided in settings");
    }

    try {
        const result = settings.compressor({
            settings,
            content,
            callback: undefined,
            index,
        });

        if (typeof result !== "string") {
            throw new Error("Compressor returned invalid result");
        }

        return result;
    } catch (error: unknown) {
        console.log("====runSync error", error);

        throw new Error(
            `Compression failed: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
