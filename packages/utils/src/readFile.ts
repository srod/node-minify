/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { readFileSync } from "node:fs";

/**
 * Read content from file.
 * @param file - Path to file
 * @returns File content as string
 */
export function readFile(file: string): string {
    return readFileSync(file, "utf8");
}
