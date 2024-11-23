/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { unlinkSync } from "node:fs";

/**
 * Delete file.
 * @param file File name
 */
export function deleteFile(file: string) {
    return unlinkSync(file);
}
