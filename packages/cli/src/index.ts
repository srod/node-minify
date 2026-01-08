/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { Result, Settings } from "@node-minify/types";
import { resolveCompressor } from "@node-minify/utils";
import chalk from "chalk";
import { compress } from "./compress.ts";
import { AVAILABLE_MINIFIER } from "./config.ts";
import { spinnerError, spinnerStart, spinnerStop } from "./spinner.ts";

export type SettingsWithCompressor = Omit<Settings, "compressor"> & {
    compressor: string;
};

/**
 * Module variables.
 */
let silence = false;

/**
 * Runs a single compression task using the compressor specified in the CLI settings.
 *
 * Loads and validates the requested compressor, constructs the runtime Settings object
 * (including parsed input, output, type, and options), executes compression, and
 * manages CLI spinner state when not silenced.
 *
 * @param cli - CLI settings identifying the compressor and its runtime options
 * @returns The compression Result produced by the compressor
 * @throws Error if the specified compressor is not found
 * @throws Error if the compressor implementation is missing or not a function
 * @throws Error if the compressor only supports CSS but a non-`css` type is provided
 */
async function runOne(cli: SettingsWithCompressor): Promise<Result> {
    const resolution = await resolveCompressor(cli.compressor);
    const { compressor: minifierImplementation, label: compressorLabel } =
        resolution;

    if (resolution.isBuiltIn) {
        const minifierDefinition = AVAILABLE_MINIFIER.find(
            (c) => c.name === cli.compressor
        );
        if (
            minifierDefinition &&
            "cssOnly" in minifierDefinition &&
            cli.type &&
            cli.type !== "css"
        ) {
            throw new Error(`${cli.compressor} only supports type 'css'`);
        }
    }

    const inputValue = cli.input;

    const settings: Settings = {
        compressorLabel,
        compressor: minifierImplementation,
        input: inputValue,
        output: cli.output,
        ...(cli.type && { type: cli.type }),
        ...(cli.option && { options: parseOptions(cli.option) }),
    };

    if (!silence) spinnerStart(settings);

    try {
        const result = await compress(settings);
        if (!silence) spinnerStop(result);
        return result;
    } catch (error) {
        if (!silence) spinnerError(settings);
        throw error;
    }
}

/**
 * Run cli.
 * @param cli Settings
 */
export async function run(cli: SettingsWithCompressor) {
    silence = !!cli.silence;

    if (!silence) {
        logMessage("INFO", "Starting compression...", "bgBlue");
    }

    try {
        await runOne(cli);

        if (!silence) {
            logMessage("DONE", "Done!", "bgGreen", "green");
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Compression failed: ${errorMessage}`);
    }
}

// Helper function to handle consistent logging
function logMessage(
    badge: "INFO" | "DONE",
    message: string,
    badgeColor: "bgBlue" | "bgGreen",
    messageColor?: "green"
) {
    console.log("");
    console.log(
        chalk[badgeColor].black(` ${badge} `),
        messageColor ? chalk[messageColor](message) : message
    );
    console.log("");
}

function parseOptions(option: string) {
    try {
        return JSON.parse(option);
    } catch (e) {
        throw new Error(
            `Invalid JSON options: ${e instanceof Error ? e.message : String(e)}`
        );
    }
}
