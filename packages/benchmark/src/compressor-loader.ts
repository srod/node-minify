/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Compressor } from "@node-minify/types";
import { resolveCompressor } from "@node-minify/utils";

export async function loadCompressor(name: string): Promise<Compressor | null> {
    try {
        const resolution = await resolveCompressor(name);
        return resolution.compressor;
    } catch {
        return null;
    }
}
