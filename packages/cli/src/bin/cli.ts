#!/usr/bin/env node

/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { Command } from "commander";
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
            "use the specified compressor [uglify-js]",
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
            "file type: js or css (required for esbuild, lightningcss, yui)"
        )
        .option("-s, --silence", "no output will be printed")
        .option(
            "-O, --option [option]",
            "option for the compressor as JSON object",
            ""
        );

    program.on("--help", displayCompressorsList);

    return program;
}

function displayCompressorsList() {
    console.log("  List of compressors:");
    console.log("");
    AVAILABLE_MINIFIER.forEach((compressor) => {
        console.log(`    - ${compressor.name}`);
    });
    console.log("");
}

function validateOptions(options: SettingsWithCompressor, program: Command) {
    if (!options.compressor || !options.input || !options.output) {
        program.help();
    }
}

async function main(): Promise<void> {
    updateNotifier({ pkg: packageJson }).notify();

    const program = setupProgram();
    program.parse(process.argv);

    const options: SettingsWithCompressor = program.opts();
    validateOptions(options, program);

    try {
        await run(options);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
