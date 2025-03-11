/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { MinifierOptions } from "@node-minify/types";
import { readFile, writeFile } from "@node-minify/utils";
import { transform } from "babel-core";
import minify from "babel-preset-minify";

type BabelOptions = {
    presets: string[];
};

/**
 * Run babel-minify.
 * @param settings Babel-minify options
 * @param content Content to minify
 * @param index Index of current file in array
 * @returns Minified content
 */
export async function babelMinify({
    settings,
    content,
    index,
}: MinifierOptions & {
    settings?: {
        options?: { babelrc?: string };
    };
}) {
    let babelOptions: BabelOptions = {
        presets: [],
    };

    if (settings?.options?.babelrc) {
        babelOptions = JSON.parse(readFile(settings.options.babelrc));
    }

    if (settings?.options?.presets) {
        const babelrcPresets = babelOptions.presets || [];
        babelOptions.presets = (
            Array.isArray(settings.options.presets)
                ? settings.options.presets
                : []
        ).concat(babelrcPresets);
    }

    if (babelOptions.presets.indexOf("minify") === -1) {
        babelOptions.presets = babelOptions.presets.concat([minify]);
    }

    const contentMinified = transform(content ?? "", babelOptions);
    const code = contentMinified.code;

    if (typeof code !== "string") {
        throw new Error("Babel minification failed: empty result");
    }

    if (settings && !settings.content && settings.output) {
        settings.output &&
            writeFile({
                file: settings.output,
                content: code,
                index,
            });
    }
    return code;
}
