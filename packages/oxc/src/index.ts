/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import {
    ensureStringContent,
    getSourceMapBoolean,
    validateMinifyResult,
    wrapMinificationError,
} from "@node-minify/utils";
import { minify as oxcMinify } from "oxc-minify";

/**
 * Minifies JavaScript content with oxc-minify using provided settings.
 *
 * @param settings - Minifier settings; `settings.options` are forwarded to oxc-minify (sourcemap enabled when `options.sourceMap` is truthy).
 * @param content - Input to minify; converted to a string before minification.
 * @returns The minified output: `code` contains the minified JavaScript, `map` contains the source map when available.
 */
export async function oxc({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "oxc");
    const options = settings?.options ?? {};
    const enableSourceMap = getSourceMapBoolean(options);

    try {
        const result = await oxcMinify("input.js", contentStr, {
            sourcemap: enableSourceMap,
            ...options,
        });

        validateMinifyResult(result, "oxc");

        return {
            code: result.code,
            map: result.map ? JSON.stringify(result.map) : undefined,
        };
    } catch (error) {
        throw wrapMinificationError("oxc", error);
    }
}
