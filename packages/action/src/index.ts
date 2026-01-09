/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { info, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { checkThresholds } from "./checks.ts";
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

        const thresholdError = checkThresholds(result.totalReduction, inputs);
        if (thresholdError) {
            setFailed(thresholdError);
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
