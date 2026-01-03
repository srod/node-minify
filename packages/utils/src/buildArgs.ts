/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { ValidationError } from "./error.ts";
import type { BuildArgsOptions } from "./types.ts";

/**
 * Converts a generic options object to BuildArgsOptions by filtering out non-primitive values.
 * Only keeps string, number, boolean, and undefined values.
 * @param options - Generic options object
 * @returns Filtered options compatible with buildArgs
 */
export function toBuildArgsOptions(
    options: Record<string, unknown>
): BuildArgsOptions {
    const result: BuildArgsOptions = {};
    for (const [key, value] of Object.entries(options)) {
        if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            value === undefined
        ) {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Builds arguments array based on an object.
 * @param options Object containing command line arguments
 * @returns Array of command line arguments
 * @throws {ValidationError} If options is null or undefined
 * @example
 * buildArgs({ compress: true, output: 'file.min.js' })
 * // returns ['--compress', '--output', 'file.min.js']
 */
export function buildArgs(options: BuildArgsOptions): string[] {
    if (!options || typeof options !== "object") {
        throw new ValidationError("Options must be a valid object");
    }

    const args: string[] = [];
    Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== false) {
            args.push(`--${key}`);
            if (value !== true) {
                args.push(String(value));
            }
        }
    });

    return args;
}
