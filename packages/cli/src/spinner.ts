/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { styleText } from "node:util";
import type { Result, Settings } from "@node-minify/types";
import ora from "ora";

const spinner = ora();

/**
 * Formats a compression message with the compressor label
 */
function formatCompressionMessage(
    status: string,
    compressorLabel = ""
): string {
    return `${status} with ${styleText("green", compressorLabel)}`;
}

/**
 * Start spinner for compression process
 */
function start({ compressorLabel }: Settings): void {
    spinner.text = `Compressing file(s) ${formatCompressionMessage(
        "...",
        compressorLabel
    )}`;
    spinner.start();
}

/**
 * Stop spinner with success message
 */
function stop({ compressorLabel, size, sizeGzip }: Result): void {
    spinner.text = [
        "File(s) compressed successfully",
        formatCompressionMessage("", compressorLabel),
        `(${styleText("green", size)} minified,`,
        `${styleText("green", sizeGzip)} gzipped)`,
    ].join(" ");
    spinner.succeed();
}

/**
 * Stop spinner with error message
 */
function error({ compressorLabel }: Settings): void {
    spinner.text = `Error - file(s) not compressed ${formatCompressionMessage(
        "",
        compressorLabel
    )}`;
    spinner.fail();
}

export { start as spinnerStart, stop as spinnerStop, error as spinnerError };
