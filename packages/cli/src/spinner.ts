/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { Result, Settings } from "@node-minify/types";
import chalk from "chalk";
import ora from "ora";

const spinner = ora();

/**
 * Formats a compression message with the compressor label
 */
function formatCompressionMessage(
    status: string,
    compressorLabel?: string
): string {
    return `${status} with ${chalk.green(compressorLabel)}`;
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
        `(${chalk.green(size)} minified,`,
        `${chalk.green(sizeGzip)} gzipped)`,
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

/**
 * Expose `start(), stop() and error()`.
 */
export { start as spinnerStart, stop as spinnerStop, error as spinnerError };
