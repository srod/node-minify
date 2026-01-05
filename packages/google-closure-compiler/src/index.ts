/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { runCommandLine } from "@node-minify/run";
import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import {
    buildArgs,
    ensureStringContent,
    toBuildArgsOptions,
} from "@node-minify/utils";
import compilerPath from "google-closure-compiler-java";

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

    const options = applyOptions({}, settings?.options ?? {});

    const result = await runCommandLine({
        args: gccCommand(options),
        data: contentStr,
        maxBuffer: settings?.buffer,
        timeout: settings?.timeout,
    });

    if (typeof result !== "string") {
        throw new Error("Google Closure Compiler failed: empty result");
    }

    return { code: result };
}

/**
 * Adds any valid options passed in the options parameters to the flags parameter and returns the flags object.
 * @param flags the flags object to add options to
 * @param options the options object to add to the flags object
 * @returns the flags object with the options added
 */
type Flags = {
    [key: string]: boolean | Record<string, unknown>;
};
function applyOptions(flags: Flags, options?: Record<string, unknown>): Flags {
    if (!options || Object.keys(options).length === 0) {
        return flags;
    }
    Object.keys(options)
        .filter((option) => allowedFlags.indexOf(option) > -1)
        .forEach((option) => {
            const value = options[option];
            if (
                typeof value === "boolean" ||
                (typeof value === "object" && !Array.isArray(value))
            ) {
                flags[option] = value as boolean | Record<string, unknown>;
            }
        });
    return flags;
}

/**
 * GCC command line.
 * @param options the options to pass to GCC
 * @returns the command line arguments to pass to GCC
 */

function gccCommand(options: Record<string, unknown>) {
    return ["-jar", compilerPath].concat(
        buildArgs(toBuildArgsOptions(options))
    );
}
