/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Compressor } from "@node-minify/types";
import { resolveCompressor } from "@node-minify/utils";

/**
 * Load a compressor implementation by name.
 *
 * Resolution errors (unknown, removed or invalid compressor) propagate unchanged so callers can report the resolver's message.
 *
 * @param name - The compressor package name or identifier to resolve
 * @returns The resolved `Compressor` function
 * @throws Error if the compressor cannot be resolved
 */
export async function loadCompressor(name: string): Promise<Compressor> {
    const resolution = await resolveCompressor(name);
    return resolution.compressor;
}
