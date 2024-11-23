/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { runCommandLine } from "@node-minify/run";
import type { MinifierOptions } from "@node-minify/types";
import { buildArgs, writeFile } from "@node-minify/utils";
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
 * Run Google Closure Compiler.
 * @param settings GCC options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
export function gcc({ settings, content, callback, index }: MinifierOptions) {
    const options = applyOptions({}, settings?.options ?? {});
    return runCommandLine({
        args: gccCommand(options),
        data: content as string,
        settings,
        callback: (err: unknown, content?: string) => {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            if (settings && !settings.content && settings.output) {
                writeFile({ file: settings.output, content, index });
            }
            if (callback) {
                return callback(null, content);
            }
            return content;
        },
    });
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
    return ["-jar", compilerPath].concat(buildArgs(options ?? {}));
}
