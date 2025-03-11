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
import {
    compressSingleFile,
    getContentFromFiles,
    run,
} from "@node-minify/utils";
import { mkdirp } from "mkdirp";

/**
 * Run compressor.
 * @param settings Settings
 */
export async function compress(
    settings: Settings
): Promise<CompressorReturnType> {
    if (settings.output) {
        createDirectory(settings.output);
    }

    if (Array.isArray(settings.output)) {
        return compressArrayOfFiles(settings);
    }

    return compressSingleFile(settings);
}

/**
 * Compress an array of files.
 * @param settings Settings
 */
function compressArrayOfFiles(settings: Settings): Promise<string> {
    let sequence: Promise<string> = Promise.resolve("");
    Array.isArray(settings.input) &&
        settings.input.forEach((input, index) => {
            const content = getContentFromFiles(input);
            sequence = sequence.then(() => run({ settings, content, index }));
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
