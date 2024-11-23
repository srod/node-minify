/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import fs from "node:fs";
import type { CompressorReturnType, Settings } from "@node-minify/types";
import { utils } from "@node-minify/utils";
import { mkdirp } from "mkdirp";

/**
 * Run compressor.
 * @param settings Settings
 */
function compress(settings: Settings): CompressorReturnType {
    if (typeof settings.compressor !== "function") {
        throw new Error(
            "compressor should be a function, maybe you forgot to install the compressor"
        );
    }

    if (settings.output) {
        createDirectory(settings.output);
    }

    if (Array.isArray(settings.output)) {
        return settings.sync
            ? compressArrayOfFilesSync(settings)
            : compressArrayOfFilesAsync(settings);
    }
    return utils.compressSingleFile(settings);
}

/**
 * Compress an array of files in sync.
 * @param settings Settings
 */
function compressArrayOfFilesSync(settings: Settings): any {
    return (
        Array.isArray(settings.input) &&
        settings.input.forEach((input, index) => {
            const content = utils.getContentFromFiles(input);
            return utils.runSync({ settings, content, index });
        })
    );
}

/**
 * Compress an array of files in async.
 * @param settings Settings
 */
function compressArrayOfFilesAsync(settings: Settings): Promise<string | void> {
    let sequence: Promise<string | void> = Promise.resolve();
    Array.isArray(settings.input) &&
        settings.input.forEach((input, index) => {
            const content = utils.getContentFromFiles(input);
            sequence = sequence.then(() =>
                utils.runAsync({ settings, content, index })
            );
        });
    return sequence;
}

/**
 * Create folder of the target file.
 * @param filePath Full path of the file
 */
function createDirectory(filePath: string | string[]) {
    // Early return if no file path provided
    if (!filePath) {
        return;
    }

    // Get single path if array
    const path = Array.isArray(filePath) ? filePath[0] : filePath;

    // Extract directory path
    const dirPath = path?.substring(0, path.lastIndexOf("/"));

    // Early return if no directory path
    if (!dirPath) {
        return;
    }

    // Create directory if it doesn't exist
    if (!directoryExists(dirPath)) {
        mkdirp.sync(dirPath);
    }
}

// Helper function to check if directory exists
function directoryExists(path: string): boolean {
    try {
        return fs.statSync(path).isDirectory();
    } catch (error) {
        return false;
    }
}

/**
 * Expose `compress()`.
 */
export { compress };
