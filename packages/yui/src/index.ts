/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCommandLine } from "@node-minify/run";
import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import type { BuildArgsOptions } from "@node-minify/utils";
import { buildArgs, warnDeprecation } from "@node-minify/utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binYui = `${__dirname}/binaries/yuicompressor-2.4.7.jar`;

/**
 * Run YUI Compressor.
 * @deprecated YUI Compressor was deprecated by Yahoo in 2013. Use @node-minify/terser for JS or @node-minify/cssnano for CSS.
 * @param settings - YUI Compressor options
 * @param content - Content to minify
 * @returns Minified content
 */
export async function yui({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    warnDeprecation(
        "yui",
        "YUI Compressor was deprecated by Yahoo in 2013. " +
            "Please migrate to @node-minify/terser for JS or @node-minify/cssnano for CSS."
    );

    if (
        !settings?.type ||
        (settings.type !== "js" && settings.type !== "css")
    ) {
        throw new Error("You must specify a type: js or css");
    }

    const result = await runCommandLine({
        args: yuiCommand(settings.type, settings?.options ?? {}),
        data: content as string,
    });

    if (typeof result !== "string") {
        throw new Error("YUI Compressor failed: empty result");
    }

    return { code: result };
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
