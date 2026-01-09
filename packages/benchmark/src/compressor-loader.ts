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
 * Attempts to resolve and return a Compressor matching the given name; returns `null` if resolution fails or no compressor is available.
 *
 * @param name - The compressor package name or identifier to resolve
 * @returns A `Compressor` instance for the given name, or `null` if none could be resolved
 */
export async function loadCompressor(name: string): Promise<Compressor | null> {
    try {
        const resolution = await resolveCompressor(name);
        return resolution.compressor;
    } catch {
        return null;
    }
}
