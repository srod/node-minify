/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, readFileSync, type Stats } from "node:fs";
import { lstat, readFile } from "node:fs/promises";
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
 * Read the UTF-8 content of a single file.
 *
 * @param path - Filesystem path to the file
 * @returns The file content as a string
 * @throws FileOperationError if the file does not exist, the path is a directory, or reading the file fails
 */
async function readFileContentAsync(path: string): Promise<string> {
    try {
        let stats: Stats;
        try {
            stats = await lstat(path);
        } catch (e: unknown) {
            if (
                e &&
                typeof e === "object" &&
                "code" in e &&
                e.code === "ENOENT"
            ) {
                throw new Error("File does not exist");
            }
            throw e;
        }

        if (stats.isDirectory()) {
            throw new Error("Path is not a valid file");
        }

        return await readFile(path, "utf8");
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

/**
 * Concatenate contents of one or more files asynchronously.
 *
 * @param input - A file path or an array of file paths to read
 * @returns The files' contents joined with newline characters
 * @throws {FileOperationError} If an underlying file operation fails for any path
 * @throws {Error} If `input` is missing or processing of the provided input fails
 */
export async function getContentFromFilesAsync(
    input: string | string[]
): Promise<string> {
    try {
        if (!input) {
            throw new Error("Input must be a string or array of strings");
        }

        if (!Array.isArray(input)) {
            return await readFileContentAsync(input);
        }

        if (input.length === 0) {
            return "";
        }

        // Read files in parallel
        const contents = await Promise.all(input.map(readFileContentAsync));
        return contents.join("\n");
    } catch (error: unknown) {
        if (error instanceof FileOperationError) {
            throw error;
        }
        throw new Error(
            `Failed to process input files: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
