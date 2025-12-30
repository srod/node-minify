/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
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
 * Optimize SVG content using SVGO with multipass enforced.
 *
 * @param settings - Optional wrapper for SVGO configuration; the `options` object it contains is merged with defaults and passed to SVGO
 * @param content - SVG input to optimize
 * @returns An object whose `code` property contains the optimized SVG string
 * @throws Error if SVGO optimization fails
 */
export async function svgo({
    settings,
    content,
}: MinifierOptions<SvgOptions>): Promise<CompressorResult> {
    try {
        const svgContent = ensureStringContent(content, "svgo");

        const options = settings?.options ?? {};

        const result = optimize(svgContent, {
            multipass: true,
            ...options,
        });

        return {
            code: result.data,
        };
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`SVGO optimization failed: ${err.message}`);
        }
        throw err;
    }
}