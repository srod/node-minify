/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import jsonminify from "jsonminify";

/**
 * Minifies JSON-like content by removing comments and unnecessary whitespace.
 *
 * @param content - The input to minify (e.g., a JSON string or value convertible to a string)
 * @returns An object with a `code` property containing the minified content
 */
export async function jsonMinify({
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "jsonminify");

    const code = jsonminify(contentStr);

    return { code };
}