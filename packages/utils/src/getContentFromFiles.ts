/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, readFileSync } from "node:fs";
import { FileOperationError } from "./error.ts";
import { isValidFile } from "./isValidFile.ts";

/**
 * Read content from a single file with error handling.
 * @param path Path to the file
 * @returns Content of the file
 * @throws {FileOperationError} If file doesn't exist or reading fails
 */
function readFileContent(path: string): string {
    try {
        if (!existsSync(path)) {
            throw new Error("File does not exist");
        }
        if (!isValidFile(path)) {
            throw new Error("Path is not a valid file");
        }
        return readFileSync(path, "utf8");
    } catch (error) {
        throw new FileOperationError("read", path, error as Error);
    }
}

/**
 * Concatenate all input files and get the data.
 * @param input Single file path or array of file paths
 * @returns Concatenated content of all files
 * @throws {FileOperationError} If any file operation fails
 * @example
 * getContentFromFiles('file.js')
 * getContentFromFiles(['file1.js', 'file2.js'])
 */
export function getContentFromFiles(input: string | string[]): string {
    try {
        if (!input) {
            throw new Error("Input must be a string or array of strings");
        }

        if (!Array.isArray(input)) {
            return readFileContent(input);
        }

        if (input.length === 0) {
            return "";
        }

        return input.map(readFileContent).join("\n");
    } catch (error: unknown) {
        if (error instanceof FileOperationError) {
            throw error;
        }
        throw new Error(
            `Failed to process input files: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
