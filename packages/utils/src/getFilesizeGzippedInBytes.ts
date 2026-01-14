/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync } from "node:fs";
import { FileOperationError } from "./error.ts";
import { isValidFile } from "./isValidFile.ts";
import { prettyBytes } from "./prettyBytes.ts";

/**
 * Compute the gzipped size of a file in bytes.
 *
 * @param file - Path to the file to measure
 * @returns The gzipped size in bytes
 * @throws FileOperationError if the file does not exist or the path is not a valid file
 * @internal
 */
async function getGzipSize(file: string): Promise<number> {
    if (!existsSync(file)) {
        throw new FileOperationError(
            "access",
            file,
            new Error("File does not exist")
        );
    }

    if (!isValidFile(file)) {
        throw new FileOperationError(
            "access",
            file,
            new Error("Path is not a valid file")
        );
    }

    const { gzipSize } = await import("gzip-size");
    const { readFile } = await import("node:fs/promises");
    const content = await readFile(file);
    return gzipSize(content);
}

/**
 * Get the gzipped size of a file as a human-readable string.
 *
 * @param file - Path to the file
 * @returns The gzipped size formatted for display (for example, "1.5 kB")
 */
export async function getFilesizeGzippedInBytes(file: string): Promise<string> {
    try {
        const size = await getGzipSize(file);
        return prettyBytes(size);
    } catch (error) {
        if (error instanceof FileOperationError) {
            throw error;
        }
        throw new FileOperationError(
            "get gzipped size of",
            file,
            error as Error
        );
    }
}

/**
 * Get the gzipped file size in bytes.
 * @param file - Path to the file
 * @returns Gzipped file size in bytes
 * @example
 * const bytes = await getFilesizeGzippedRaw('bundle.js')
 * console.log(bytes) // 12583
 */
export async function getFilesizeGzippedRaw(file: string): Promise<number> {
    try {
        return await getGzipSize(file);
    } catch (error) {
        if (error instanceof FileOperationError) {
            throw error;
        }
        throw new FileOperationError(
            "get gzipped size of",
            file,
            error as Error
        );
    }
}
