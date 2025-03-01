/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, unlinkSync } from "node:fs";
import { FileOperationError } from "./types.ts";

/**
 * Delete file from the filesystem.
 * @param file Path to the file to delete
 * @throws {FileOperationError} If file doesn't exist or deletion fails
 * @example
 * deleteFile('path/to/file.js')
 */
export function deleteFile(file: string): void {
    try {
        if (!existsSync(file)) {
            throw new Error("File does not exist");
        }
        unlinkSync(file);
    } catch (error) {
        throw new FileOperationError("delete", file, error as Error);
    }
}
