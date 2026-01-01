/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { ValidationError } from "./error.ts";

/**
 * Set the file name as minified.
 * @param file Original file path
 * @param output Output pattern (use $1 as placeholder for filename)
 * @param publicFolder Optional public folder prefix
 * @param replaceInPlace Whether to keep original path
 * @returns Minified file path
 * @throws {ValidationError} If input parameters are invalid
 * @example
 * setFileNameMin('src/file.js', '$1.min.js') // 'src/file.min.js'
 * setFileNameMin('file.js', '$1.min.js', 'public/') // 'public/file.min.js'
 */
export function setFileNameMin(
    file: string,
    output: string,
    publicFolder?: string,
    replaceInPlace?: boolean
): string {
    if (!file || typeof file !== "string") {
        throw new ValidationError("File path must be a non-empty string");
    }

    if (!output || typeof output !== "string" || !output.includes("$1")) {
        throw new ValidationError(
            'Output pattern must be a string containing "$1"'
        );
    }

    try {
        const fileWithoutPath = path.basename(file);
        const filePath = path.dirname(file);
        const lastDotIndex = fileWithoutPath.lastIndexOf(".");

        if (lastDotIndex === -1) {
            throw new ValidationError("File must have an extension");
        }

        let fileWithoutExtension = fileWithoutPath.substring(0, lastDotIndex);

        if (publicFolder) {
            if (typeof publicFolder !== "string") {
                throw new ValidationError("Public folder must be a string");
            }
            fileWithoutExtension = path.join(
                publicFolder,
                fileWithoutExtension
            );
        }

        if (replaceInPlace) {
            fileWithoutExtension = path.join(filePath, fileWithoutExtension);
        }

        return output.replace("$1", fileWithoutExtension);
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError(
            `Failed to process file name: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
