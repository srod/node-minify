/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { ValidationError } from "./error.ts";

/**
 * Compute a minified file path by applying the `output` pattern to the original file name.
 *
 * The `output` string must contain the placeholder `$1`, which will be replaced with the original
 * filename without its extension, optionally prefixed by `publicFolder` and/or placed inside the
 * original file's directory when `replaceInPlace` is true.
 *
 * @param file - Original file path; must be a non-empty string and include a file extension
 * @param output - Output pattern that must include the `$1` placeholder
 * @param publicFolder - Optional directory prefix to prepend to the filename portion in the result
 * @param replaceInPlace - If true, place the transformed filename inside the original file's directory
 * @returns The final path produced by replacing `$1` in `output` with the computed filename
 * @throws {ValidationError} When `file` or `output` is invalid, when `file` lacks an extension, when `publicFolder` is not a string, or when processing fails
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
