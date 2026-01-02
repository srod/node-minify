/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { lstatSync, writeFileSync } from "node:fs";
import { lstat, writeFile as writeFileFs } from "node:fs/promises";
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

        if (isDirectory(targetFile)) {
            throw new Error("Target path exists and is a directory");
        }

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
 * Write provided content to a target file asynchronously.
 *
 * When `file` is an array and `index` is provided, the file at that index is used; otherwise `file` is used directly.
 *
 * @param file - Target path or array of target paths
 * @param content - Content to write; may be a `string` or `Buffer`
 * @param index - Optional index to select a file when `file` is an array
 * @returns Promise resolving to the same `content` value that was written
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

        if (await isDirectoryAsync(targetFile)) {
            throw new Error("Target path exists and is a directory");
        }

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

function validateContent(content: string | Buffer): void {
    if (!content) {
        throw new ValidationError("No content provided");
    }
}

function isDirectory(path: string): boolean {
    try {
        return lstatSync(path).isDirectory();
    } catch {
        return false;
    }
}

async function isDirectoryAsync(path: string): Promise<boolean> {
    try {
        const stats = await lstat(path);
        return stats.isDirectory();
    } catch {
        return false;
    }
}

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
