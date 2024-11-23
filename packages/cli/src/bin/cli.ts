#!/usr/bin/env node

/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { Command } from "commander";
import updateNotifier from "update-notifier";
import packageJson from "../../package.json";
import { AVAILABLE_MINIFIER } from "../config.ts";
import { run } from "../index.ts";
import type { SettingsWithCompressor } from "../index.ts";

const DEFAULT_COMPRESSOR = "uglify-js";

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
        .option("-i, --input [file]", "input file path")
        .option("-o, --output [file]", "output file path")
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
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
