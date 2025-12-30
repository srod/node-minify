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

function isImageFile(filePath: string): boolean {
    const lastDot = filePath.lastIndexOf(".");
    if (lastDot === -1) return false;
    const ext = filePath.slice(lastDot).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
}

/**
 * Compress a single file.
 * @param settings Settings
 */
export async function compressSingleFile<
    T extends CompressorOptions = CompressorOptions,
>(settings: Settings<T>): Promise<string> {
    const content = determineContent(settings);
    return run({ settings, content } as MinifierOptions<T>);
}

/**
 * Determine the content to minify.
 * @param settings - Minification settings
 * @returns Content to minify (string for text files, Buffer for single image, Buffer[] for multiple images)
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
