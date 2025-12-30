/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, lstatSync, writeFileSync } from "node:fs";
import { FileOperationError, ValidationError } from "./error.ts";

interface WriteFileParams {
    file: string | string[];
    content: string | Buffer;
    index?: number;
}

/**
 * Write content into file.
 * @param params Object containing file path, content and optional index
 * @returns Written content
 * @throws {ValidationError} If no target file is provided
 * @throws {FileOperationError} If file operations fail
 * @example
 * writeFile({ file: 'output.js', content: 'console.log("Hello")' })
 * writeFile({ file: ['file1.js', 'file2.js'], content: 'shared content', index: 0 })
 */
export function writeFile({
    file,
    content,
    index,
}: WriteFileParams): string | Buffer {
    try {
        if (!file) {
            throw new ValidationError("No target file provided");
        }

        if (!content) {
            throw new ValidationError("No content provided");
        }

        const targetFile =
            index !== undefined
                ? Array.isArray(file)
                    ? file[index]
                    : file
                : file;

        if (typeof targetFile !== "string") {
            throw new ValidationError("Invalid target file path");
        }

        const shouldWrite =
            !existsSync(targetFile) || !lstatSync(targetFile).isDirectory();

        if (!shouldWrite) {
            throw new Error("Target path exists and is a directory");
        }

        writeFileSync(
            targetFile,
            content,
            Buffer.isBuffer(content) ? undefined : "utf8"
        );
        return content;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new FileOperationError(
            "write to",
            typeof file === "string" ? file : "multiple files",
            error as Error
        );
    }
}
