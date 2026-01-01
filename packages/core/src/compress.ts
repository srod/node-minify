/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { stat } from "node:fs/promises";
/**
 * Module dependencies.
 */
import { dirname } from "node:path";
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
 * Run the compressor using the provided settings.
 *
 * Validates settings when `output` is an array (requires `input` to be an array with the same length) and ensures target output directories exist before processing. Dispatches either multi-file or single-file compression based on `settings.output`.
 *
 * @param settings - Compression settings including `input`, `output`, and compressor-specific options
 * @returns The resulting compressed output string for a single output, or the last result produced when processing multiple outputs (or an empty string if no results were produced)
 * @throws Error - If `output` is an array but `input` is not, or if `input` and `output` arrays have differing lengths
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
        await createDirectory(settings.output);
    }

    // Handle array outputs (from user input or created internally by checkOutput when processing $1 pattern)
    if (Array.isArray(settings.output)) {
        return compressArrayOfFiles(settings);
    }

    return compressSingleFile(settings as Settings);
}

/**
 * Compress multiple input files specified in the settings.
 *
 * @param settings - Configuration object where `settings.input` and `settings.output` are arrays of equal length; each `settings.input[i]` is a file path to compress and corresponds to `settings.output[i]`.
 * @returns The result of the last compression task, or an empty string if no tasks ran.
 * @throws Error if any entry in `settings.input` is not a non-empty string.
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
async function createDirectory(filePath: string | string[]) {
    // Early return if no file path provided
    if (!filePath) {
        return;
    }

    // Handle array (created internally by checkOutput when processing $1 pattern)
    const paths = Array.isArray(filePath) ? filePath : [filePath];

    await Promise.all(
        paths.map(async (path) => {
            if (typeof path !== "string") {
                return;
            }

            const dirPath = dirname(path);

            // Early return if no directory path
            if (!dirPath) {
                return;
            }

            // Create directory if it doesn't exist
            if (!(await directoryExists(dirPath))) {
                await mkdirp(dirPath);
            }
        })
    );
}

// Helper function to check if directory exists
async function directoryExists(path: string): Promise<boolean> {
    try {
        return (await stat(path)).isDirectory();
    } catch {
        return false;
    }
}
