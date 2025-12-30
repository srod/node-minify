/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import fs from "node:fs";
import type {
    CompressorOptions,
    MinifierOptions,
    Settings,
} from "@node-minify/types";
import {
    compressSingleFile,
    getContentFromFilesAsync,
    run,
} from "@node-minify/utils";
import { mkdirp } from "mkdirp";

/**
 * Run compressor.
 * @param settings Settings
 */
export async function compress<T extends CompressorOptions = CompressorOptions>(
    settings: Settings<T>
): Promise<string> {
    if (Array.isArray(settings.output)) {
        if (!Array.isArray(settings.input)) {
            throw new Error(
                "When output is an array, input must also be an array"
            );
        }
        if (settings.input.length !== settings.output.length) {
            throw new Error(
                `Input and output arrays must have the same length (input: ${settings.input.length}, output: ${settings.output.length})`
            );
        }
    }

    if (settings.output) {
        createDirectory(settings.output);
    }

    // Handle array outputs (from user input or created internally by checkOutput when processing $1 pattern)
    if (Array.isArray(settings.output)) {
        return compressArrayOfFiles(settings);
    }

    return compressSingleFile(settings as Settings);
}

/**
 * Compress an array of files.
 * Files are processed in parallel since each input/output pair is independent.
 * @param settings Settings
 */
async function compressArrayOfFiles<
    T extends CompressorOptions = CompressorOptions,
>(settings: Settings<T>): Promise<string> {
    const inputs = settings.input as string[];

    inputs.forEach((input, index) => {
        if (!input || typeof input !== "string") {
            throw new Error(
                `Invalid input at index ${index}: expected non-empty string, got ${
                    typeof input === "string" ? "empty string" : typeof input
                }`
            );
        }
    });

    const compressionTasks = inputs.map(async (input, index) => {
        const content = await getContentFromFilesAsync(input);
        return run({ settings, content, index } as MinifierOptions<T>);
    });

    const results = await Promise.all(compressionTasks);
    return results[results.length - 1] ?? "";
}

/**
 * Create folder of the target file.
 * @param filePath Full path of the file (can be string or array when $1 pattern is used)
 */
function createDirectory(filePath: string | string[]) {
    // Early return if no file path provided
    if (!filePath) {
        return;
    }

    // Handle array (created internally by checkOutput when processing $1 pattern)
    const paths = Array.isArray(filePath) ? filePath : [filePath];

    for (const path of paths) {
        if (typeof path !== "string") {
            continue;
        }

        // Extract directory path
        const dirPath = path.substring(0, path.lastIndexOf("/"));

        // Early return if no directory path
        if (!dirPath) {
            continue;
        }

        // Create directory if it doesn't exist
        if (!directoryExists(dirPath)) {
            mkdirp.sync(dirPath);
        }
    }
}

// Helper function to check if directory exists
function directoryExists(path: string): boolean {
    try {
        return fs.statSync(path).isDirectory();
    } catch {
        return false;
    }
}
