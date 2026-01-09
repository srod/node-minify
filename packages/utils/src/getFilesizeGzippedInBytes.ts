/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { createReadStream, existsSync } from "node:fs";
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

    const { gzipSizeStream } = await import("gzip-size");
    const source = createReadStream(file);

    return new Promise<number>((resolve, reject) => {
        source
            .pipe(gzipSizeStream())
            .on("gzip-size", resolve)
            .on("error", reject);
    });
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
        throw new FileOperationError(
            "get gzipped size of",
            file,
            error as Error
        );
    }
}