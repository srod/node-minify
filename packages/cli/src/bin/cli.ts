#!/usr/bin/env node

/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { benchmark, getReporter } from "@node-minify/benchmark";
import { Command } from "commander";
import ora from "ora";
import updateNotifier from "update-notifier";
import packageJson from "../../package.json" with { type: "json" };
import { AVAILABLE_MINIFIER } from "../config.ts";
import type { SettingsWithCompressor } from "../index.ts";
import { run } from "../index.ts";

const DEFAULT_COMPRESSOR = "uglify-js";

/**
 * Create and configure the command-line interface for the node-minify tool.
 *
 * Configures options for selecting a compressor, input and output paths, file
 * type, silence mode, and compressor-specific options; registers a help hook
 * that displays available compressors and sets the CLI version.
 *
 * @returns The configured Command instance ready to parse CLI arguments.
 */
function setupProgram(): Command {
    const program = new Command();

    program
        .storeOptionsAsProperties()
        .version(packageJson.version, "-v, --version")
        .option(
            "-c, --compressor [compressor]",
            "compressor name, npm package, or path to local file [uglify-js]",
            DEFAULT_COMPRESSOR
        )
        .option(
            "-i, --input [file]",
            "input file path",
            (val: string, memo: string[]) => {
                memo.push(val);
                return memo;
            },
            []
        )
        .option("-o, --output [file]", "output file path")
        .option(
            "-t, --type [type]",
            "file type: js or css (required for esbuild, yui)"
        )
        .option("-s, --silence", "no output will be printed")
        .option(
            "--allow-empty-output",
            "Skip writing output when result is empty"
        )
        .option(
            "-O, --option [option]",
            "option for the compressor as JSON object",
            ""
        )
        .action(async () => {
            const options: SettingsWithCompressor = program.opts();
            if (!options.compressor || !options.input || !options.output) {
                program.help();
                return;
            }
            try {
                await run(options);
                process.exit(0);
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        });

    program
        .command("benchmark <input>")
        .description("Benchmark compressors on input files")
        .option(
            "-c, --compressors [compressors]",
            "comma-separated list of compressors"
        )
        .option("-n, --iterations [iterations]", "number of iterations", "1")
        .option(
            "-f, --format [format]",
            "output format: console|json|markdown",
            "console"
        )
        .option("-o, --output [output]", "output file path")
        .option("--gzip", "include gzip size")
        .option("--brotli", "include brotli size")
        .option("-v, --verbose", "verbose output")
        .action(async (input, options) => {
            const globalOpts = program.opts();
            const spinner = ora("Benchmarking...").start();
            try {
                const results = await benchmark({
                    input,
                    compressors:
                        options.compressors?.split(",") ||
                        globalOpts.compressor?.split(","),
                    iterations: parseInt(options.iterations, 10),
                    format: options.format,
                    output: options.output,
                    includeGzip: !!options.gzip,
                    includeBrotli: !!options.brotli,
                    type: globalOpts.type,
                    verbose: !!options.verbose,
                    onProgress: (compressor: string, file: string) => {
                        spinner.text = `Benchmarking ${compressor} on ${file}...`;
                    },
                });

                spinner.stop();
                const reporter = getReporter(options.format);
                console.log(reporter(results));
                process.exit(0);
            } catch (error) {
                spinner.fail("Benchmark failed");
                console.error(error);
                process.exit(1);
            }
        });

    program.on("--help", displayCompressorsList);

    return program;
}

/**
 * Prints the list of available compressors to standard output.
 *
 * Outputs a header, each compressor name prefixed with a dash, and a trailing blank line.
 */
function displayCompressorsList() {
    console.log("  List of compressors:");
    console.log("");
    AVAILABLE_MINIFIER.forEach((compressor) => {
        console.log(`    - ${compressor.name}`);
    });
    console.log("");
}

/**
 * Initialize the update notifier and start parsing command-line arguments for the CLI.
 *
 * Registers the package update notifier and parses process.argv with the configured command-line program.
 */
async function main(): Promise<void> {
    updateNotifier({ pkg: packageJson }).notify();

    const program = setupProgram();
    await program.parseAsync(process.argv);
}

main();
