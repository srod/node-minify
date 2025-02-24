/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

export interface BuildArgsOptions {
    [key: string]: string | boolean | number | undefined;
}

export class FileOperationError extends Error {
    constructor(operation: string, path: string, originalError?: Error) {
        super(
            `Failed to ${operation} file ${path}: ${originalError?.message || ""}`
        );
        this.name = "FileOperationError";
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}
