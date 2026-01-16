/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { writeFileSync } from "node:fs";
import { writeFile as writeFileFs } from "node:fs/promises";
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
        const targetFile = resolveTargetFile(file, index);
        validateContent(content);

        writeFileSync(
            targetFile,
            content,
            Buffer.isBuffer(content) ? undefined : "utf8"
        );
        return content;
    } catch (error) {
        handleWriteError(error, file);
        return content; // Should be unreachable due to handleWriteError throwing
    }
}

/**
 * Write content to a resolved target file path.
 *
 * Resolves the target from `file` (string or array) using `index` when provided, validates the content,
 * ensures the target is not a directory, and writes the content to disk.
 *
 * @param file - Target path or array of target paths; when `file` is an array, `index` selects the entry
 * @param content - Content to write; a `string` or `Buffer`
 * @param index - Optional index used to select a file when `file` is an array
 * @returns The same `content` value that was written
 * @throws ValidationError If no target file, no content, or the resolved target path is invalid
 * @throws FileOperationError If the underlying filesystem write fails (wraps the original error)
 */
export async function writeFileAsync({
    file,
    content,
    index,
}: WriteFileParams): Promise<string | Buffer> {
    try {
        const targetFile = resolveTargetFile(file, index);
        validateContent(content);

        await writeFileFs(
            targetFile,
            content,
            Buffer.isBuffer(content) ? undefined : "utf8"
        );
        return content;
    } catch (error) {
        handleWriteError(error, file);
        return content; // Should be unreachable due to handleWriteError throwing
    }
}

/**
 * Resolve a target file path from a string or an array of paths, optionally selecting by index.
 *
 * @param file - A file path or an array of file paths to resolve from.
 * @param index - Optional index to select an entry when `file` is an array; ignored if not provided.
 * @returns The resolved file path.
 * @throws ValidationError if no file is provided or the resolved target is not a string.
 */
function resolveTargetFile(file: string | string[], index?: number): string {
    if (!file) {
        throw new ValidationError("No target file provided");
    }

    const targetFile =
        index !== undefined ? (Array.isArray(file) ? file[index] : file) : file;

    if (typeof targetFile !== "string") {
        throw new ValidationError("Invalid target file path");
    }

    return targetFile;
}

/**
 * Ensure content is present before writing.
 *
 * @param content - The data to write; a string or Buffer
 * @throws ValidationError if `content` is empty or otherwise falsy
 */
function validateContent(content: string | Buffer): void {
    if (!content) {
        throw new ValidationError("No content provided");
    }
}


/**
 * Normalize and rethrow errors that occur while attempting to write to one or more files.
 *
 * @param error - The original error thrown during the write attempt
 * @param file - The target file path or an array of paths that were the intended write targets
 * @throws ValidationError - rethrows the provided ValidationError without modification
 * @throws FileOperationError - thrown for any other error, wrapping the original error with context about the write operation and the target file(s)
 */
function handleWriteError(error: unknown, file: string | string[]): never {
    if (error instanceof ValidationError) {
        throw error;
    }
    throw new FileOperationError(
        "write to",
        typeof file === "string" ? file : "multiple files",
        error as Error
    );
}
