/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, lstatSync } from "node:fs";
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
