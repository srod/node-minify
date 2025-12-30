/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { optimize, type PluginConfig } from "svgo";

/**
 * SVGO plugin options.
 */
export type SvgOptions = {
    /**
     * Run optimizations multiple times.
     * @default true
     */
    multipass?: boolean;

    /**
     * Path to the SVG file (for better error messages).
     */
    path?: string;

    /**
     * SVG optimization plugins.
     * @default [['preset-default']]
     */
    plugins?: PluginConfig[];

    /**
     * Number of decimal places for numbers.
     */
    floatPrecision?: number;

    /**
     * Convert to data URI.
     */
    datauri?: "base64" | "enc" | "unenc";

    /**
     * Output formatting options.
     */
    js2svg?: {
        /**
         * Indentation spaces.
         * @default 0
         */
        indent?: number;

        /**
         * Pretty print output.
         * @default false
         */
        pretty?: boolean;

        /**
         * End of line character.
         * @default 'lf'
         */
        eol?: "lf" | "crlf";
    };
};

/**
 * Run SVGO.
 * @param settings - SVGO options
 * @param content - SVG content to minify
 * @returns Minified SVG content
 */
export async function svgo({
    settings,
    content,
}: MinifierOptions<SvgOptions>): Promise<CompressorResult> {
    if (Array.isArray(content)) {
        throw new Error("svgo compressor does not support array content");
    }

    const options = settings?.options ?? {};

    // SVGO only accepts strings, convert Buffer if needed
    const svgContent = Buffer.isBuffer(content)
        ? content.toString("utf8")
        : (content ?? "");

    const result = optimize(svgContent, {
        multipass: true,
        ...options,
    });

    return {
        code: result.data,
    };
}
