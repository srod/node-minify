/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { CompressorOptions, Settings } from "@node-minify/types";
import { compressSingleFile } from "@node-minify/utils";
import { compress } from "./compress.ts";
import { setup } from "./setup.ts";

/**
 * Minifies files or provided content according to the given settings.
 *
 * @param settings - User-supplied configuration that controls input (files or content), compressor options, and output behavior
 * @returns The resulting minified output or an output file path as a string
 */
export async function minify<T extends CompressorOptions = CompressorOptions>(
    settings: Settings<T>
): Promise<string> {
    const compressorSettings = setup(settings);
    const method = settings.content ? compressSingleFile : compress;
    return await method(compressorSettings);
}