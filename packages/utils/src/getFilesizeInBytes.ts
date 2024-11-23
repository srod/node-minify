/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { statSync } from "node:fs";
import { prettyBytes } from "./prettyBytes.ts";

/**
 * Get the file size in bytes.
 * @param file File name
 */
export const getFilesizeInBytes = (file: string): string => {
    const stats = statSync(file);
    const fileSizeInBytes = stats.size;
    return prettyBytes(fileSizeInBytes);
};
