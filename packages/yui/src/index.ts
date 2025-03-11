/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCommandLine } from "@node-minify/run";
import type { MinifierOptions } from "@node-minify/types";
import { buildArgs, writeFile } from "@node-minify/utils";
import type { BuildArgsOptions } from "@node-minify/utils";

/**
 * Module variables.
 */

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the path to the YUI Compressor binary
const binYui = `${__dirname}/binaries/yuicompressor-2.4.7.jar`;

/**
 * Run YUI Compressor.
 * @param settings YUI Compressor options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
export function yui({ settings, content, callback, index }: MinifierOptions) {
    if (
        !settings?.type ||
        (settings.type !== "js" && settings.type !== "css")
    ) {
        throw new Error("You must specify a type: js or css");
    }
    return runCommandLine({
        args: yuiCommand(settings.type, settings?.options ?? {}),
        data: content as string,
        settings,
        callback: (err: unknown, content?: string) => {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            if (typeof content !== "string") {
                throw new Error("YUI Compressor failed: empty result");
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
 * YUI Compressor CSS command line.
 */
function yuiCommand(type: "js" | "css", options: Record<string, unknown>) {
    const buildArgsOptions: BuildArgsOptions = {};
    Object.entries(options).forEach(([key, value]) => {
        if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            value === undefined
        ) {
            buildArgsOptions[key] = value;
        }
    });
    return ["-jar", "-Xss2048k", binYui, "--type", type].concat(
        buildArgs(buildArgsOptions)
    );
}
