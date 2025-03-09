/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Error class for file operation failures.
 * @extends Error
 */
export class FileOperationError extends Error {
    constructor(operation: string, path: string, originalError?: Error) {
        super(
            `Failed to ${operation} file ${path}: ${originalError?.message || ""}`
        );
        this.name = "FileOperationError";
    }
}

/**
 * Error class for validation failures.
 * @extends Error
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}
