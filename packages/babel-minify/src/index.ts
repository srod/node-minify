/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { readFile } from "@node-minify/utils";
import { transform } from "babel-core";
import minify from "babel-preset-minify";

let deprecationWarned = false;

type BabelOptions = {
    presets: (string | typeof minify)[];
};

/**
 * Run babel-minify.
 * @deprecated babel-minify uses Babel 6 which is no longer maintained. Use @node-minify/terser instead.
 * @param settings - Babel-minify options
 * @param content - Content to minify
 * @returns Minified content
 */
export async function babelMinify({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    if (!deprecationWarned) {
        console.warn(
            "[@node-minify/babel-minify] DEPRECATED: babel-minify uses Babel 6 which is no longer maintained. " +
                "Please migrate to @node-minify/terser for continued support and modern JavaScript features."
        );
        deprecationWarned = true;
    }

    let babelOptions: BabelOptions = { presets: [] };
    const babelrc = settings?.options?.babelrc as string | undefined;
    const presets = settings?.options?.presets as string[] | undefined;

    if (babelrc) {
        babelOptions = JSON.parse(readFile(babelrc));
    }

    if (presets && Array.isArray(presets)) {
        const babelrcPresets = babelOptions.presets || [];
        babelOptions.presets = presets.concat(babelrcPresets);
    }

    if (!babelOptions.presets.includes("minify")) {
        babelOptions.presets = babelOptions.presets.concat([minify]);
    }

    const result = transform(content ?? "", babelOptions);

    if (typeof result.code !== "string") {
        throw new Error("Babel minification failed: empty result");
    }

    return { code: result.code };
}
