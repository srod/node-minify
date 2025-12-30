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
export function readFile(file: string): string;
export function readFile(file: string, asBuffer: true): Buffer;
export function readFile(file: string, asBuffer: false): string;
export function readFile(file: string, asBuffer?: boolean): string | Buffer;
/**
 * Reads a file from disk and returns its contents as a string or Buffer.
 *
 * @param file - Path to the file to read
 * @param asBuffer - If `true`, return a `Buffer`; otherwise return a UTF-8 `string`
 * @returns The file contents as a `Buffer` when `asBuffer` is `true`, otherwise as a UTF-8 `string`
 * @throws FileOperationError when the file does not exist, is not a regular file, or an error occurs while reading
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