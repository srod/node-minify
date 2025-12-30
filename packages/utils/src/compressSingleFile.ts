/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { readFileSync } from "node:fs";
import type {
    CompressorOptions,
    MinifierOptions,
    Settings,
} from "@node-minify/types";
import { getContentFromFiles } from "./getContentFromFiles.ts";
import { run } from "./run.ts";

const IMAGE_EXTENSIONS = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".avif",
    ".tiff",
    ".tif",
    ".heif",
    ".heic",
]);

/**
 * Determines whether a file path refers to a supported image file by its extension.
 *
 * @param filePath - File path or filename to check
 * @returns `true` if the path ends with a supported image extension, `false` otherwise.
 */
function isImageFile(filePath: string): boolean {
    const lastDot = filePath.lastIndexOf(".");
    if (lastDot === -1) return false;
    const ext = filePath.slice(lastDot).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
}

/**
 * Compresses the provided input according to the given settings.
 *
 * @param settings - Configuration that specifies input/content and compressor options to use for compression
 * @returns The compressed output string
 */
export async function compressSingleFile<
    T extends CompressorOptions = CompressorOptions,
>(settings: Settings<T>): Promise<string> {
    const content = determineContent(settings);
    return run({ settings, content } as MinifierOptions<T>);
}

/**
 * Determines the content to be minified from the provided settings.
 *
 * @param settings - Settings that may include `content` or `input` (file path or array of file paths) plus compressor options
 * @returns `string` for text content, `Buffer` for a single image file, or `Buffer[]` for multiple image files
 * @throws Error when an `input` array mixes image and non-image file paths
 */
function determineContent<T extends CompressorOptions = CompressorOptions>(
    settings: Settings<T>
): string | Buffer | Buffer[] {
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
            return settings.input.map((file) => readFileSync(file));
        }
    }

    if (settings.input && typeof settings.input === "string") {
        if (isImageFile(settings.input)) {
            return readFileSync(settings.input);
        }
    }

    if (settings.input) {
        return getContentFromFiles(settings.input);
    }

    return "";
}