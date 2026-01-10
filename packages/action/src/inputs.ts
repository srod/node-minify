/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { getBooleanInput, getInput, warning } from "@actions/core";
import { isBuiltInCompressor } from "@node-minify/utils";
import type { ActionInputs } from "./types.ts";

const TYPE_REQUIRED_COMPRESSORS = ["esbuild", "lightningcss", "yui"];

const DEPRECATED_COMPRESSORS: Record<string, string> = {
    "babel-minify":
        "babel-minify only supports Babel 6 and is no longer maintained. Use 'terser' instead.",
    "uglify-es": "uglify-es is no longer maintained. Use 'terser' instead.",
    yui: "YUI Compressor was deprecated by Yahoo in 2013. Use 'terser' for JS or 'lightningcss' for CSS.",
    crass: "crass is no longer maintained. Use 'lightningcss' or 'clean-css' instead.",
    sqwish: "sqwish is no longer maintained. Use 'lightningcss' or 'clean-css' instead.",
};

/**
 * Parse and validate GitHub Action inputs into an ActionInputs object.
 *
 * Reads inputs such as `input`, `output`, `compressor`, `type`, `options`,
 * reporting flags, benchmarking settings, and other flags, applying defaults
 * and validations (including JSON parsing for `options` and required `type`
 * for certain compressors).
 *
 * @returns An object containing the parsed action inputs, including `input`,
 * `output`, `compressor`, `type`, `options`, report flags, benchmark settings,
 * `minReduction`, `includeGzip`, `workingDirectory`, and `githubToken`.
 *
 * @throws Error if a compressor that requires a `type` is selected but `type`
 * is not provided.
 * @throws Error if the `options` input is present but is not valid JSON.
 */
export function parseInputs(): ActionInputs {
    const compressor = getInput("compressor") || "terser";
    const type = getInput("type") as "js" | "css" | undefined;

    if (TYPE_REQUIRED_COMPRESSORS.includes(compressor) && !type) {
        throw new Error(
            `Compressor '${compressor}' requires the 'type' input (js or css)`
        );
    }

    let options: Record<string, unknown> = {};
    const optionsJson = getInput("options");
    if (optionsJson) {
        try {
            options = JSON.parse(optionsJson);
        } catch {
            throw new Error(`Invalid JSON in 'options' input: ${optionsJson}`);
        }
    }

    const benchmarkCompressorsInput = getInput("benchmark-compressors");
    const benchmarkCompressors = benchmarkCompressorsInput
        ? benchmarkCompressorsInput.split(",").map((c: string) => c.trim())
        : ["terser", "esbuild", "swc", "oxc"];

    return {
        input: getInput("input", { required: true }),
        output: getInput("output", { required: true }),
        compressor,
        type: type || undefined,
        options,
        reportSummary: getBooleanInput("report-summary"),
        reportPRComment: getBooleanInput("report-pr-comment"),
        reportAnnotations: getBooleanInput("report-annotations"),
        benchmark: getBooleanInput("benchmark"),
        benchmarkCompressors,
        failOnIncrease: getBooleanInput("fail-on-increase"),
        minReduction: (() => {
            const raw = getInput("min-reduction");
            if (!raw) return 0;
            const value = Number.parseFloat(raw);
            if (Number.isNaN(value) || value < 0 || value > 100) {
                throw new Error(
                    `Invalid 'min-reduction' input: '${raw}' is not a valid number (expected 0-100)`
                );
            }
            return value;
        })(),
        includeGzip: getBooleanInput("include-gzip"),
        workingDirectory: getInput("working-directory") || ".",
        githubToken: getInput("github-token") || process.env.GITHUB_TOKEN,
    };
}

/**
 * Validates a compressor identifier and emits warnings for deprecated or non-built-in compressors.
 *
 * Emits a warning when the compressor is listed as deprecated and emits a separate warning
 * when the compressor is not recognized as a built-in compressor (indicating it will be
 * treated as a custom npm package or local file).
 *
 * @param compressor - The compressor name or identifier to validate (e.g., "terser", "esbuild", or a custom package)
 */
export function validateCompressor(compressor: string): void {
    const deprecationMessage = DEPRECATED_COMPRESSORS[compressor];
    if (deprecationMessage) {
        warning(`⚠️ Deprecated: ${deprecationMessage}`);
    }

    if (!isBuiltInCompressor(compressor)) {
        warning(
            `Compressor '${compressor}' is not a built-in compressor. ` +
                `Treating as custom npm package or local file.`
        );
    }
}


export { DEPRECATED_COMPRESSORS, TYPE_REQUIRED_COMPRESSORS };
