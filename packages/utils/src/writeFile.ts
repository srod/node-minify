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
 * Writes content to the specified file path.
 *
 * @param params - Object with `file`, `content`, and optional `index` selecting which entry to use when `file` is an array
 * @returns The original `content` that was written
 * @throws {ValidationError} If no target file is provided, content is missing, or the resolved target path is not a valid file path
 * @throws {FileOperationError} If an underlying filesystem operation fails
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