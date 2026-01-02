/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
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
 * Compute the Brotli-compressed size of a file and return it as a human-readable string.
 *
 * @param file - Path to the file whose Brotli-compressed size will be measured
 * @returns The size of the file's Brotli-compressed content formatted as a human-readable string
 * @throws FileOperationError if the file does not exist, the path is not a valid file, or an I/O/compression error occurs
 */
export async function getFilesizeBrotliInBytes(file: string): Promise<string> {
    try {
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

        return prettyBytes(compressed.length);
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