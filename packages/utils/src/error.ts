/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Error class for file operation failures.
 * @extends Error
 */
export class FileOperationError extends Error {
    override cause?: Error;

    constructor(operation: string, path: string, originalError?: Error) {
        super(
            `Failed to ${operation} file ${path}: ${originalError?.message || ""}`,
            originalError ? { cause: originalError } : undefined
        );
        this.name = "FileOperationError";
        // For older runtimes that don't support the cause option
        if (originalError && !this.cause) {
            this.cause = originalError;
        }
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
