/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { info, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { parseInputs, validateJavaCompressor } from "./inputs.ts";
import { runMinification } from "./minify.ts";
import { setMinifyOutputs } from "./outputs.ts";
import { addAnnotations } from "./reporters/annotations.ts";
import { postPRComment } from "./reporters/comment.ts";
import { generateSummary } from "./reporters/summary.ts";

async function run(): Promise<void> {
    try {
        const inputs = parseInputs();

        validateJavaCompressor(inputs.compressor);

        info(`Minifying ${inputs.input} with ${inputs.compressor}...`);

        const result = await runMinification(inputs);

        setMinifyOutputs(result);

        if (inputs.reportSummary) {
            await generateSummary(result);
        }

        if (inputs.reportPRComment && context.payload.pull_request) {
            await postPRComment(result, inputs.githubToken);
        }

        if (inputs.reportAnnotations) {
            addAnnotations(result);
        }

        if (inputs.failOnIncrease && result.totalReduction < 0) {
            setFailed(
                `Minified size is larger than original (${result.totalReduction.toFixed(1)}% increase)`
            );
            return;
        }

        if (
            inputs.minReduction > 0 &&
            result.totalReduction < inputs.minReduction
        ) {
            setFailed(
                `Reduction ${result.totalReduction.toFixed(1)}% is below minimum threshold ${inputs.minReduction}%`
            );
            return;
        }

        info(
            `✅ Minification complete! ${result.totalReduction.toFixed(1)}% reduction in ${result.totalTimeMs}ms`
        );
    } catch (error) {
        if (error instanceof Error) {
            setFailed(error.message);
        } else {
            setFailed("An unknown error occurred");
        }
    }
}

run();
