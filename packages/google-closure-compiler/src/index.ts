/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, wrapMinificationError } from "@node-minify/utils";
import googleClosureCompiler from "google-closure-compiler";

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

// Default per-stream cap for compiler stdout/stderr. Generous enough for large
// minified bundles while still bounding runaway output. Set `settings.buffer` to
// 0 to disable the limit entirely.
const DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;

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
    const maxBuffer = settings?.buffer;
    const timeout = settings?.timeout;
    const silence = settings?.silence ?? false;

    try {
        const result = await runCompiler(
            flags,
            contentStr,
            maxBuffer,
            timeout,
            silence
        );
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
 * @param maxBuffer - Maximum combined stdout/stderr buffer per stream in bytes
 * @param timeout - Optional timeout in milliseconds; kills the compiler process if exceeded
 * @param silence - When true, suppresses stderr warnings in error messages
 * @returns The compiled output string
 */
function runCompiler(
    flags: Flags,
    source: string,
    maxBuffer = DEFAULT_MAX_BUFFER,
    timeout?: number,
    silence?: boolean
): Promise<string> {
    return new Promise((resolve, reject) => {
        let stdoutLength = 0;
        let stderrLength = 0;
        let settled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const { compiler: Compiler } = googleClosureCompiler;

        const clearTimer = () => {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
        };
        const resolveOnce = (value: string) => {
            if (settled) return;
            settled = true;
            clearTimer();
            resolve(value);
        };
        const rejectOnce = (error: Error) => {
            if (settled) return;
            settled = true;
            clearTimer();
            reject(error);
        };
        const trackChunk = (
            chunk: Buffer | string,
            stream: "stdout" | "stderr"
        ) => {
            const size = Buffer.isBuffer(chunk)
                ? chunk.length
                : Buffer.byteLength(chunk);

            if (stream === "stdout") {
                stdoutLength += size;
                if (maxBuffer > 0 && stdoutLength > maxBuffer) {
                    childProcess.kill();
                    rejectOnce(new Error("stdout maxBuffer exceeded"));
                }
                return;
            }

            stderrLength += size;
            if (maxBuffer > 0 && stderrLength > maxBuffer) {
                childProcess.kill();
                rejectOnce(new Error("stderr maxBuffer exceeded"));
            }
        };

        const childProcess = new Compiler(flags).run(
            (exitCode: number, stdOut: string, stdErr: string) => {
                if (settled) return;

                if (exitCode !== 0) {
                    const detail = silence ? "" : `: ${stdErr}`;
                    rejectOnce(
                        new Error(
                            `Google Closure Compiler exited with code ${exitCode}${detail}`
                        )
                    );
                    return;
                }

                if (typeof stdOut !== "string") {
                    rejectOnce(
                        new Error(
                            "Google Closure Compiler failed: invalid result"
                        )
                    );
                    return;
                }

                resolveOnce(stdOut);
            }
        );

        childProcess.on("error", (error) => {
            rejectOnce(
                new Error(
                    `Google Closure Compiler process error: ${error.message}`
                )
            );
        });
        childProcess.stdout?.on("data", (chunk) => {
            trackChunk(chunk, "stdout");
        });
        childProcess.stderr?.on("data", (chunk) => {
            trackChunk(chunk, "stderr");
        });
        childProcess.stdin?.on("error", (error) => {
            rejectOnce(
                new Error(
                    `Google Closure Compiler stdin error: ${error.message}`
                )
            );
        });

        if (timeout !== undefined && timeout > 0) {
            timeoutId = setTimeout(() => {
                childProcess.kill();
                rejectOnce(
                    new Error(
                        `Google Closure Compiler timed out after ${String(timeout)}ms`
                    )
                );
            }, timeout);
        }

        if (childProcess.stdin) {
            childProcess.stdin.write(source);
            childProcess.stdin.end();
        }
    });
}

type FlagValue = string | boolean | string[];
type Flags = {
    [key: string]: FlagValue;
};

/**
 * Normalize a user-supplied option value into a Closure-compatible flag value.
 *
 * Strings and booleans pass through. Repeated flags like `define` are expressed
 * as `KEY=value` entries: an object such as `{ DEBUG: false }` becomes
 * `["DEBUG=false"]`. String values are quoted (`{ NAME: "false" }` becomes
 * `['NAME="false"']`) so the compiler keeps them as string literals instead of
 * coercing them to a boolean or number. Boolean and number values are emitted
 * unquoted; `null`, `undefined`, and nested object/array values are skipped. A
 * `string[]` is kept as-is. Anything else is dropped.
 *
 * Without this, an object value reaches the compiler as `--define=[object Object]`.
 *
 * @param value - The raw option value to normalize
 * @returns A string, boolean, or string array flag value, or undefined to skip
 */
function normalizeFlagValue(value: unknown): FlagValue | undefined {
    if (typeof value === "string" || typeof value === "boolean") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.every((entry) => typeof entry === "string")
            ? (value as string[])
            : undefined;
    }
    if (typeof value === "object" && value !== null) {
        const entries = Object.entries(
            value as Record<string, unknown>
        ).flatMap(([key, entry]) => {
            if (typeof entry === "string") {
                // Quote strings so the compiler keeps them as string literals;
                // an unquoted `false` or `5` would become a boolean or number.
                return [`${key}=${JSON.stringify(entry)}`];
            }
            if (typeof entry === "boolean" || typeof entry === "number") {
                return [`${key}=${String(entry)}`];
            }
            // Skip null, undefined, and nested object/array values.
            return [];
        });
        return entries.length > 0 ? entries : undefined;
    }
    return undefined;
}

/**
 * Merge allowed user-provided options into the given flags object.
 *
 * Filters `options` to keys listed in `allowedFlags` and normalizes each value
 * (see {@link normalizeFlagValue}) before assigning it into `flags`.
 *
 * @param flags - Target flags object to populate with allowed option entries.
 * @param options - Optional user-supplied options to apply; keys not in `allowedFlags` or values that normalize to undefined are ignored.
 * @returns The same `flags` object after applying valid entries from `options`.
 */
export function applyOptions(
    flags: Flags,
    options?: Record<string, unknown>
): Flags {
    if (!options || Object.keys(options).length === 0) {
        return flags;
    }
    for (const option of Object.keys(options)) {
        if (allowedFlags.indexOf(option) === -1) continue;
        const value = normalizeFlagValue(options[option]);
        if (value !== undefined) {
            flags[option] = value;
        }
    }
    return flags;
}
