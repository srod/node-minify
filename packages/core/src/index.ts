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
 * Minifies input according to the provided settings.
 *
 * @param settings - User-provided settings that specify the compressor, input/content, output and related options
 * @returns The minified content as a string
 */
export async function minify<T extends CompressorOptions = CompressorOptions>(
    settings: Settings<T>
): Promise<string> {
    const compressorSettings = setup(settings);
    const method = settings.content ? compressSingleFile : compress;
    return await method(compressorSettings);
}