/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type {
    CompressorOptions,
    MinifierOptions,
    Settings,
} from "@node-minify/types";
import { getContentFromFilesAsync } from "./getContentFromFiles.ts";
import { isImageFile } from "./isImageFile.ts";
import { readFileAsync } from "./readFile.ts";
import { run } from "./run.ts";

/**
 * Compress a single file using the provided settings.
 *
 * @param settings - Configuration that specifies input content or input path(s) and compressor options
 * @returns The compressed output as a string
 */
export async function compressSingleFile<
    T extends CompressorOptions = CompressorOptions,
>(settings: Settings<T>): Promise<string> {
    const content = await determineContent(settings);
    return run({ settings, content } as MinifierOptions<T>);
}

/**
 * Resolve the content to be minified from the provided settings.
 *
 * @param settings - Settings that may contain `content` or `input` (string or string[]); `content` is used preferentially.
 * @returns The resolved content: a `string` for text input, a `Buffer` for a single image file, or a `Buffer[]` for multiple image files.
 * @throws Error - If `settings.input` is an array that mixes image and non-image file paths.
 */
async function determineContent<
    T extends CompressorOptions = CompressorOptions,
>(settings: Settings<T>): Promise<string | Buffer | Buffer[]> {
    if (settings.content) {
        return settings.content;
    }

    if (settings.input && Array.isArray(settings.input)) {
        const imageFilesCount = settings.input.filter((file) =>
            isImageFile(file)
        ).length;
        if (imageFilesCount > 0) {
            if (imageFilesCount !== settings.input.length) {
                throw new Error(
                    "Cannot mix image and text files in the same input array"
                );
            }
            const firstInput = settings.input[0];
            if (settings.input.length === 1 && firstInput) {
                return await readFileAsync(firstInput, true);
            }
            return await Promise.all(
                settings.input.map((file) => readFileAsync(file, true))
            );
        }
    }

    if (settings.input && typeof settings.input === "string") {
        if (isImageFile(settings.input)) {
            return await readFileAsync(settings.input, true);
        }
    }

    if (settings.input) {
        return await getContentFromFilesAsync(settings.input);
    }

    return "";
}
