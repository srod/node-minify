/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, wrapMinificationError } from "@node-minify/utils";
import jsonminify from "jsonminify";

/**
 * Minifies JSON input using jsonminify.
 *
 * @param content - Input JSON to minify (string or Buffer)
 * @returns An object with `code` containing the minified JSON string
 */
export async function jsonMinify({
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "jsonminify");

    try {
        const code = jsonminify(contentStr);
        return { code };
    } catch (error) {
        throw wrapMinificationError("jsonminify", error);
    }
}
