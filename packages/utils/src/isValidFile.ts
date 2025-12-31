/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, lstatSync } from "node:fs";
import { lstat } from "node:fs/promises";
import { FileOperationError } from "./error.ts";

/**
 * Check if the path is a valid file.
 * @param path Path to check
 * @returns true if path exists and is a file, false otherwise
 * @throws {FileOperationError} If filesystem operations fail
 * @example
 * if (isValidFile('path/to/file.js')) {
 *   // do something
 * }
 */
export function isValidFile(path: string): boolean {
    try {
        return existsSync(path) && !lstatSync(path).isDirectory();
    } catch (error) {
        throw new FileOperationError("validate", path, error as Error);
    }
}

/**
 * Determine whether a filesystem path refers to an existing file (not a directory).
 *
 * @param path - Path to check
 * @returns `true` if the path exists and is a file, `false` otherwise.
 * @throws {FileOperationError} If a filesystem error other than `ENOENT` occurs while validating the path.
 */
export async function isValidFileAsync(path: string): Promise<boolean> {
    try {
        const stats = await lstat(path);
        return !stats.isDirectory();
    } catch (error: unknown) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return false;
        }
        throw new FileOperationError(
            "validate",
            path,
            error instanceof Error ? error : new Error(String(error))
        );
    }
}
