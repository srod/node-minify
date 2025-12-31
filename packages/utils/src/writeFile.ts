/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, lstatSync, writeFileSync } from "node:fs";
import { FileOperationError, ValidationError } from "./error.ts";

interface WriteFileParams {
    file: string | string[];
    content: string | Buffer;
    index?: number;
}

/**
 * Write provided content to a target file.
 *
 * When `file` is an array and `index` is provided, the file at that index is used; otherwise `file` is used directly.
 *
 * @param file - Target path or array of target paths
 * @param content - Content to write; may be a `string` or `Buffer`
 * @param index - Optional index to select a file when `file` is an array
 * @returns The same `content` value that was written
 * @throws ValidationError If no target file, no content, or the resolved target path is invalid
 * @throws FileOperationError If the underlying filesystem write fails (wraps the original error)
 */
export function writeFile({
    file,
    content,
    index,
}: WriteFileParams): string | Buffer {
    try {
        if (!file) {
            throw new ValidationError("No target file provided");
        }

        if (!content) {
            throw new ValidationError("No content provided");
        }

        const targetFile =
            index !== undefined
                ? Array.isArray(file)
                    ? file[index]
                    : file
                : file;

        if (typeof targetFile !== "string") {
            throw new ValidationError("Invalid target file path");
        }

        const shouldWrite =
            !existsSync(targetFile) || !lstatSync(targetFile).isDirectory();

        if (!shouldWrite) {
            throw new Error("Target path exists and is a directory");
        }

        writeFileSync(
            targetFile,
            content,
            Buffer.isBuffer(content) ? undefined : "utf8"
        );
        return content;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new FileOperationError(
            "write to",
            typeof file === "string" ? file : "multiple files",
            error as Error
        );
    }
}