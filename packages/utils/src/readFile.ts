/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { readFileSync } from "node:fs";
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
export function readFile(file: string): string;
export function readFile(file: string, asBuffer: true): Buffer;
export function readFile(file: string, asBuffer: false): string;
export function readFile(file: string, asBuffer?: boolean): string | Buffer;
/**
 * Read a file from disk and return its contents as a UTF-8 string by default or as a raw Buffer.
 *
 * @param file - Path to the file to read.
 * @param asBuffer - If `true`, return a raw `Buffer`; if `false` or omitted, return the file decoded as a UTF-8 `string`.
 * @returns A `Buffer` when `asBuffer` is `true`, otherwise the file content as a UTF-8 `string`.
 * @throws FileOperationError when the file cannot be read; the original error is attached as the cause.
 */
export function readFile(file: string, asBuffer?: boolean): string | Buffer {
    try {
        return asBuffer ? readFileSync(file) : readFileSync(file, "utf8");
    } catch (error) {
        throw new FileOperationError(
            "read",
            file,
            error instanceof Error ? error : undefined
        );
    }
}