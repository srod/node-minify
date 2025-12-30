/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { Compressor, Result, Settings } from "@node-minify/types";
import chalk from "chalk";
import { compress } from "./compress.ts";
import { AVAILABLE_MINIFIER } from "./config.ts";
import { spinnerError, spinnerStart, spinnerStop } from "./spinner.ts";

export type SettingsWithCompressor = Omit<Settings, "compressor"> & {
    compressor: (typeof AVAILABLE_MINIFIER)[number]["name"];
};

/**
 * Module variables.
 */
let silence = false;

/**
 * Execute a single compressor using the provided CLI-style settings.
 *
 * @param cli - Configuration selecting the compressor (by name) and its input/output plus optional `type` and `option` values.
 * @returns The compression `Result` produced by the selected compressor.
 * @throws Error if the named compressor is not listed in AVAILABLE_MINIFIER.
 * @throws Error if the compressor package does not expose a valid implementation function.
 * @throws Error Propagates any error thrown during compression.
 */
async function runOne(cli: SettingsWithCompressor): Promise<Result> {
    // Find compressor
    const minifierDefinition = AVAILABLE_MINIFIER.find(
        (compressor) => compressor.name === cli.compressor
    );

    if (!minifierDefinition) {
        throw new Error(`Compressor '${cli.compressor}' not found.`);
    }

    // Load minifier implementation dynamically
    const minifierPackage = (await import(
        `@node-minify/${cli.compressor}`
    )) as Record<string, Compressor>;

    const minifierImplementation = minifierPackage[
        minifierDefinition.export
    ] as Compressor;

    if (
        !minifierImplementation ||
        typeof minifierImplementation !== "function"
    ) {
        throw new Error(
            `Invalid compressor implementation for '${cli.compressor}'.`
        );
    }

    // Prepare settings
    const settings: Settings = {
        compressorLabel: cli.compressor,
        compressor: minifierImplementation,
        input: typeof cli.input === "string" ? cli.input.split(",") : cli.input,
        output: cli.output,
        ...(cli.type && { type: cli.type }),
        ...(cli.option && { options: JSON.parse(cli.option) }),
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