/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import {
    ensureStringContent,
    readFile,
    warnDeprecation,
} from "@node-minify/utils";
import { transform } from "babel-core";
import env from "babel-preset-env";
import minify from "babel-preset-minify";

type BabelPreset = typeof minify | typeof env;

type BabelOptions = {
    presets: (string | BabelPreset)[];
};

/**
 * Known presets that we can resolve directly to avoid Babel 6's runtime module resolution,
 * which can fail in monorepos or when the working directory differs from the package location.
 */
const knownPresets: Record<string, BabelPreset> = {
    env,
    minify,
};

/**
 * Minifies JavaScript using Babel (ensures the `babel-preset-minify` preset is applied).
 *
 * Accepts optional Babel configuration via `settings.options.babelrc` (path to a .babelrc file)
 * and `settings.options.presets` (array of presets or preset names). Known preset names are
 * resolved to their bundled implementations before running Babel.
 *
 * @deprecated babel-minify uses Babel 6 which is no longer maintained. Migrate to @node-minify/terser for ongoing support.
 * @param settings - Minifier settings; may include `options.babelrc` (string path) and `options.presets` (string[] or preset entries)
 * @param content - Source content to be minified
 * @returns An object with the minified code: `{ code: string }`
 */
export async function babelMinify({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "babel-minify");

    warnDeprecation(
        "babel-minify",
        "babel-minify uses Babel 6 which is no longer maintained. " +
            "Please migrate to @node-minify/terser for continued support and modern JavaScript features."
    );

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

    // Resolve known preset strings to their imported modules to avoid
    // Babel 6's runtime resolution which fails in monorepos/different cwd
    babelOptions.presets = babelOptions.presets.map((preset) =>
        typeof preset === "string" && preset in knownPresets
            ? knownPresets[preset]
            : preset
    );

    // Ensure minify preset is always included
    if (!babelOptions.presets.includes(minify)) {
        babelOptions.presets = babelOptions.presets.concat([minify]);
    }

    const result = transform(contentStr, babelOptions);

    if (typeof result.code !== "string") {
        throw new Error("Babel minification failed: empty result");
    }

    return { code: result.code };
}
