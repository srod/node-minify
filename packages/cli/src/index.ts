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
import { compress } from "./compress.ts";
import { spinnerError, spinnerStart, spinnerStop } from "./spinner.ts";

/**
 * Module variables.
 */
let silence = false;

/**
 * Run one compressor.
 * @param cli Settings
 */
async function runOne(cli: SettingsWithCompressor): Promise<Result> {
    // Load compressor dynamically
    const { default: compressorModule } = await import(
        `@node-minify/${cli.compressor}`
    );

    // Prepare settings
    const settings: Settings = {
        compressorLabel: cli.compressor,
        compressor: compressorModule,
        input: typeof cli.input === "string" ? cli.input.split(",") : cli.input,
        output: cli.output,
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
export type SettingsWithCompressor = Settings & {
    compressor: string;
};
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
