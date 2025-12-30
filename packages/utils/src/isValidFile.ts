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
 * Check if the path is a valid file asynchronously.
 * @param path Path to check
 * @returns true if path exists and is a file, false otherwise
 * @throws {FileOperationError} If filesystem operations fail
 * @example
 * if (await isValidFileAsync('path/to/file.js')) {
 *   // do something
 * }
 */
export async function isValidFileAsync(path: string): Promise<boolean> {
    try {
        const stats = await lstat(path);
        return !stats.isDirectory();
    } catch (error: any) {
        if (error.code === "ENOENT") {
            return false;
        }
        throw new FileOperationError("validate", path, error as Error);
    }
}
