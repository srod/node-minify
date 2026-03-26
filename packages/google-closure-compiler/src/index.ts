/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, wrapMinificationError } from "@node-minify/utils";
import { compiler as Compiler } from "google-closure-compiler";

// the allowed flags, taken from https://github.com/google/closure-compiler/wiki/Flags-and-Options
const allowedFlags = [
    "angular_pass",
    "assume_function_wrapper",
    "checks_only",
    "compilation_level",
    "create_source_map",
    "define",
    "env",
    "externs",
    "export_local_property_definitions",
    "generate_exports",
    "language_in",
    "language_out",
    "output_wrapper",
    "polymer_version",
    "process_common_js_modules",
    "rename_prefix_namespace",
    "rewrite_polyfills",
    "use_types_for_optimization",
    "warning_level",
];

/**
 * Minifies JavaScript using the Google Closure Compiler.
 *
 * @param settings - Minifier options; `settings.options` keys that match supported compiler flags are applied
 * @param content - Source to minify; non-string input will be converted to a string before compilation
 * @returns An object with `code` containing the compiled/minified source string
 */
export async function gcc({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "google-closure-compiler");

    const flags = applyOptions({}, settings?.options ?? {});

    try {
        const result = await runCompiler(flags, contentStr);
        return { code: result };
    } catch (error) {
        throw wrapMinificationError("google-closure-compiler", error);
    }
}

/**
 * Runs the Google Closure Compiler with the given flags, piping source code via stdin.
 *
 * @param flags - Compiler flags object (e.g. `{ compilation_level: "SIMPLE" }`)
 * @param source - JavaScript source code to compile
 * @returns The compiled output string
 */
function runCompiler(
    flags: Record<string, string | boolean | Record<string, unknown>>,
    source: string
): Promise<string> {
    return new Promise((resolve, reject) => {
        const compiler = new Compiler(flags);
        const process = compiler.run(
            (exitCode: number, stdOut: string, stdErr: string) => {
                if (exitCode !== 0) {
                    reject(
                        new Error(
                            `Google Closure Compiler exited with code ${exitCode}: ${stdErr}`
                        )
                    );
                    return;
                }

                if (typeof stdOut !== "string" || stdOut.length === 0) {
                    reject(
                        new Error(
                            "Google Closure Compiler failed: empty result"
                        )
                    );
                    return;
                }

                resolve(stdOut);
            }
        );

        if (process.stdin) {
            process.stdin.write(source);
            process.stdin.end();
        }
    });
}

/**
 * Type guard to check if a value is a valid flag value.
 *
 * @param value - The value to check
 * @returns True if value is a string, boolean, or plain object (not array)
 */
function isFlagValue(
    value: unknown
): value is string | boolean | Record<string, unknown> {
    return (
        typeof value === "string" ||
        typeof value === "boolean" ||
        (typeof value === "object" && value !== null && !Array.isArray(value))
    );
}

/**
 * Adds any valid options passed in the options parameters to the flags parameter and returns the flags object.
 * @param flags the flags object to add options to
 * @param options the options object to add to the flags object
 * @returns the flags object with the options added
 */
type Flags = {
    [key: string]: string | boolean | Record<string, unknown>;
};
/**
 * Merge allowed user-provided options into the given flags object.
 *
 * Filters `options` to keys listed in `allowedFlags` and assigns values that are strings, booleans, or plain (non-array) objects into `flags`.
 *
 * @param flags - Target flags object to populate with allowed option entries.
 * @param options - Optional user-supplied options to apply; keys not in `allowedFlags` or values that are arrays or unsupported types are ignored.
 * @returns The same `flags` object after applying valid entries from `options`.
 */
function applyOptions(flags: Flags, options?: Record<string, unknown>): Flags {
    if (!options || Object.keys(options).length === 0) {
        return flags;
    }
    Object.keys(options)
        .filter((option) => allowedFlags.indexOf(option) > -1)
        .forEach((option) => {
            const value = options[option];
            if (isFlagValue(value)) {
                flags[option] = value;
            }
        });
    return flags;
}
