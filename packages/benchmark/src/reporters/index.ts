/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { formatConsoleOutput } from "./console.ts";
import { formatJsonOutput } from "./json.ts";
import { formatMarkdownOutput } from "./markdown.ts";

export function getReporter(format: string = "console") {
    switch (format) {
        case "json":
            return formatJsonOutput;
        case "markdown":
        case "md":
            return formatMarkdownOutput;
        default:
            return formatConsoleOutput;
    }
}
