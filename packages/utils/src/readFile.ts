/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, lstatSync, readFileSync } from "node:fs";
import { FileOperationError } from "./error.ts";

/**
 * Read content from file.
 * @param file - Path to file
 * @param asBuffer - If true, return Buffer; if false, return string (default: false)
 * @returns File content as string or Buffer
 * @throws {FileOperationError} If file doesn't exist or reading fails
 * @example
 * // Read as string
 * const content = readFile('file.txt');
 *
 * // Read as Buffer (for binary files like images)
 * const buffer = readFile('image.png', true);
 */
export function readFile(file: string, asBuffer?: boolean): string | Buffer {
    try {
        if (!existsSync(file)) {
            throw new Error("File does not exist");
        }
        if (!lstatSync(file).isFile()) {
            throw new Error("Path is not a file");
        }
        return asBuffer ? readFileSync(file) : readFileSync(file, "utf8");
    } catch (error) {
        throw new FileOperationError("read", file, error as Error);
    }
}
