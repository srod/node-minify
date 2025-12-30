/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCommandLine } from "@node-minify/run";
import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import {
    buildArgs,
    toBuildArgsOptions,
    warnDeprecation,
} from "@node-minify/utils";

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
    if (Array.isArray(content)) {
        throw new Error("yui compressor does not support array content");
    }

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

    const contentStr =
        content instanceof Buffer
            ? content.toString()
            : ((content ?? "") as string);

    const result = await runCommandLine({
        args: yuiCommand(settings.type, settings?.options ?? {}),
        data: contentStr,
    });

    if (typeof result !== "string") {
        throw new Error("YUI Compressor failed: empty result");
    }

    return { code: result };
}

/**
 * Build YUI Compressor command line arguments.
 * @param type - File type (js or css)
 * @param options - Compressor options
 * @returns Command line arguments array
 */
function yuiCommand(type: "js" | "css", options: Record<string, unknown>) {
    return ["-jar", "-Xss2048k", binYui, "--type", type].concat(
        buildArgs(toBuildArgsOptions(options))
    );
}
