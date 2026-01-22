/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { brotliCompress, constants } from "node:zlib";
import { FileOperationError } from "./error.ts";
import { isValidFile } from "./isValidFile.ts";
import { prettyBytes } from "./prettyBytes.ts";

const brotliCompressAsync = promisify(brotliCompress);

/**
 * Compute the brotli-compressed size of a file in bytes.
 *
 * @param file - Path to the file to measure
 * @returns The brotli-compressed size in bytes
 * @throws FileOperationError if the file does not exist or the path is not a valid file
 * @internal
 */
async function getBrotliSize(file: string): Promise<number> {
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

    const content = await readFile(file);
    const compressed = await brotliCompressAsync(content, {
        params: {
            [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
        },
    });

    return compressed.length;
}

/**
 * Get the brotli-compressed size of a file as a human-readable string.
 *
 * @param file - Path to the file
 * @returns The brotli-compressed size formatted for display (for example, "1.5 kB")
 */
export async function getFilesizeBrotliInBytes(file: string): Promise<string> {
    try {
        const size = await getBrotliSize(file);
        return prettyBytes(size);
    } catch (error) {
        if (error instanceof FileOperationError) {
            throw error;
        }
        throw new FileOperationError(
            "get brotli size of",
            file,
            error as Error
        );
    }
}

/**
 * Get the brotli-compressed file size in bytes.
 *
 * @param file - Path to the file
 * @returns Brotli-compressed file size in bytes
 * @example
 * const bytes = await getFilesizeBrotliRaw('bundle.js')
 * console.log(bytes) // 12583
 */
export async function getFilesizeBrotliRaw(file: string): Promise<number> {
    try {
        return await getBrotliSize(file);
    } catch (error) {
        if (error instanceof FileOperationError) {
            throw error;
        }
        throw new FileOperationError(
            "get brotli size of",
            file,
            error as Error
        );
    }
}
