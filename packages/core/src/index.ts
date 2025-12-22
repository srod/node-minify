/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { Settings } from "@node-minify/types";
import { compressSingleFile } from "@node-minify/utils";
import { compress } from "./compress.ts";
import { setup } from "./setup.ts";

/**
 * Run node-minify.
 * @param settings Settings from user input
 */
export async function minify(settings: Settings): Promise<string> {
    const compressorSettings = setup(settings);
    const method = settings.content ? compressSingleFile : compress;
    return await method(compressorSettings);
}
