/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { createReadStream, existsSync } from "node:fs";
import { FileOperationError } from "./error.ts";
import { isValidFile } from "./isValidFile.ts";
import { prettyBytes } from "./prettyBytes.ts";

/**
 * Get the gzipped file size as a human-readable string.
 * @param file - Path to the file
 * @returns Formatted gzipped file size string (e.g., "1.5 kB")
 * @throws {FileOperationError} If file doesn't exist or operation fails
 * @example
 * const size = await getFilesizeGzippedInBytes('file.js')
 * console.log(size) // '1.5 kB'
 */
export async function getFilesizeGzippedInBytes(file: string): Promise<string> {
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

        const { gzipSizeStream } = await import("gzip-size");
        const source = createReadStream(file);

        const size = await new Promise<number>((resolve, reject) => {
            source
                .pipe(gzipSizeStream())
                .on("gzip-size", resolve)
                .on("error", reject);
        });

        return prettyBytes(size);
    } catch (error) {
        throw new FileOperationError(
            "get gzipped size of",
            file,
            error as Error
        );
    }
}
