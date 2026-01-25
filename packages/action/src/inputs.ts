/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { getBooleanInput, getInput, warning } from "@actions/core";
import { isBuiltInCompressor } from "@node-minify/utils";
import { DEFAULT_PATTERNS } from "./discover.ts";
import type { ActionInputs } from "./types.ts";
import { validateOutputDir } from "./validate.ts";

const TYPE_REQUIRED_COMPRESSORS = ["esbuild", "yui"];

const DEPRECATED_COMPRESSORS: Record<string, string> = {
    "babel-minify":
        "babel-minify only supports Babel 6 and is no longer maintained. Use 'terser' instead.",
    "uglify-es": "uglify-es is no longer maintained. Use 'terser' instead.",
    yui: "YUI Compressor was deprecated by Yahoo in 2013. Use 'terser' for JS or 'lightningcss' for CSS.",
    crass: "crass is no longer maintained. Use 'lightningcss' or 'clean-css' instead.",
    sqwish: "sqwish is no longer maintained. Use 'lightningcss' or 'clean-css' instead.",
};

/**
 * Parse comma-separated string into array of trimmed non-empty strings.
 *
 * @param value - Comma-separated string
 * @returns Array of trimmed non-empty strings
 */
function parseCommaSeparated(value: string): string[] {
    if (!value) return [];
    return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

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
 * @throws Error if the `type` input is provided but is not 'js' or 'css'.
 * @throws Error if auto mode is disabled and input/output are not provided.
 */
export function parseInputs(): ActionInputs {
    const compressor = getInput("compressor") || "terser";
    const auto = getBooleanInput("auto");
    const dryRun = getBooleanInput("dry-run");
    const outputDir = getInput("output-dir") || "dist";

    // Sanitize output-dir to prevent path traversal
    const segments = outputDir.split(/[/\\]/);
    if (segments.includes("..") || path.isAbsolute(outputDir)) {
        throw new Error(
            'output-dir must be a relative path without ".." segments'
        );
    }
    const patterns = parseCommaSeparated(getInput("patterns"));
    const additionalIgnore = parseCommaSeparated(getInput("ignore"));

    const input = getInput("input");
    const output = getInput("output");

    if (!auto && (!input || !output)) {
        throw new Error(
            "Explicit mode requires both 'input' and 'output'. Enable 'auto' mode or provide both inputs."
        );
    }

    if (auto) {
        const patternsToValidate =
            patterns.length > 0 ? patterns : DEFAULT_PATTERNS;
        const workingDir = getInput("working-directory") || ".";
        validateOutputDir(outputDir, patternsToValidate, workingDir);
    }

    // Validate type input explicitly
    const typeRaw = getInput("type");
    let type: "js" | "css" | undefined;
    if (typeRaw) {
        if (typeRaw !== "js" && typeRaw !== "css") {
            throw new Error(
                `Invalid 'type' input: '${typeRaw}' (expected 'js' or 'css')`
            );
        }
        type = typeRaw;
    }

    if (TYPE_REQUIRED_COMPRESSORS.includes(compressor) && !type) {
        throw new Error(
            `Compressor '${compressor}' requires the 'type' input (js or css)`
        );
    }

    // Parse options JSON without leaking raw input in error messages
    let options: Record<string, unknown> = {};
    const optionsJson = getInput("options");
    if (optionsJson) {
        try {
            options = JSON.parse(optionsJson);
        } catch (err) {
            throw new Error(
                `Invalid JSON in 'options' input: ${err instanceof Error ? err.message : String(err)}`
            );
        }
    }

    // Parse benchmark compressors with deduplication and empty string filtering
    const benchmarkCompressorsInput = getInput("benchmark-compressors");
    const benchmarkCompressors = (() => {
        if (!benchmarkCompressorsInput) {
            return ["terser", "esbuild", "swc", "oxc"];
        }
        const parsed = benchmarkCompressorsInput
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c.length > 0);
        // Deduplicate while preserving order
        const unique = [...new Set(parsed)];
        return unique.length > 0 ? unique : ["terser", "esbuild", "swc", "oxc"];
    })();

    return {
        input,
        output,
        compressor,
        type,
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
        auto,
        patterns: patterns.length > 0 ? patterns : undefined,
        outputDir,
        additionalIgnore:
            additionalIgnore.length > 0 ? additionalIgnore : undefined,
        dryRun,
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
