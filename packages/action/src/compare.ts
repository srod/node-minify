/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { info, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import type { ComparisonResult, MinifyResult } from "./types.ts";

/**
 * Compares minified file sizes against the base branch for pull requests.
 *
 * Fetches the minified output files from the base branch (if they exist) and
 * computes the size difference. This allows PR comments to show before/after
 * comparisons.
 *
 * @param result - The minification result containing file information
 * @param githubToken - GitHub API token for fetching base branch files
 * @returns Array of comparison results for each file, or empty array if not a PR or no token
 */
export async function compareWithBase(
    result: MinifyResult,
    githubToken: string | undefined
): Promise<ComparisonResult[]> {
    if (!githubToken) {
        warning("No GitHub token provided, skipping base branch comparison");
        return [];
    }

    const pullRequest = context.payload.pull_request;
    if (!pullRequest) {
        info("Not a pull request, skipping base branch comparison");
        return [];
    }

    const baseBranch = pullRequest.base.ref as string;
    const octokit = getOctokit(githubToken);
    const { owner, repo } = context.repo;

    const results: ComparisonResult[] = [];

    for (const fileResult of result.files) {
        const comparison = await compareFile(
            octokit,
            owner,
            repo,
            baseBranch,
            fileResult.file,
            fileResult.minifiedSize
        );
        results.push(comparison);
    }

    return results;
}

/**
 * Compares a single file against the base branch version.
 *
 * @param octokit - Authenticated Octokit instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param baseBranch - Base branch ref (e.g., "main")
 * @param filePath - Path to the file to compare
 * @param currentSize - Current minified size in bytes
 * @returns Comparison result with base size (null if file is new) and change percentage
 */
async function compareFile(
    octokit: ReturnType<typeof getOctokit>,
    owner: string,
    repo: string,
    baseBranch: string,
    filePath: string,
    currentSize: number
): Promise<ComparisonResult> {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: baseBranch,
        });

        // getContent returns different shapes depending on the path
        // For a single file, it returns an object with content
        if (Array.isArray(data)) {
            // Path is a directory, not a file
            return {
                file: filePath,
                baseSize: null,
                currentSize,
                change: null,
                isNew: true,
            };
        }

        if (data.type !== "file" || !("size" in data)) {
            // Not a regular file (could be a symlink or submodule)
            return {
                file: filePath,
                baseSize: null,
                currentSize,
                change: null,
                isNew: true,
            };
        }

        const baseSize = data.size;
        const change =
            baseSize > 0
                ? ((currentSize - baseSize) / baseSize) * 100
                : currentSize > 0
                  ? 100
                  : 0;

        return {
            file: filePath,
            baseSize,
            currentSize,
            change,
            isNew: false,
        };
    } catch (error) {
        // File doesn't exist in base branch (new file) or other error
        if (
            error instanceof Error &&
            "status" in error &&
            (error as { status: number }).status === 404
        ) {
            return {
                file: filePath,
                baseSize: null,
                currentSize,
                change: null,
                isNew: true,
            };
        }

        // Log unexpected errors but don't fail the action
        warning(
            `Failed to fetch base branch version of ${filePath}: ${error instanceof Error ? error.message : String(error)}`
        );

        return {
            file: filePath,
            baseSize: null,
            currentSize,
            change: null,
            isNew: true,
        };
    }
}

/**
 * Formats a comparison result for display (e.g., in PR comments).
 *
 * @param comparison - The comparison result to format
 * @returns Formatted string like "+2.5% ⚠️", "-1.6% ✅", or "new" for new files
 */
export function formatChange(comparison: ComparisonResult): string {
    if (comparison.isNew || comparison.change === null) {
        return "new";
    }

    const sign = comparison.change >= 0 ? "+" : "";
    const emoji = comparison.change > 0 ? "⚠️" : "✅";

    return `${sign}${comparison.change.toFixed(1)}% ${emoji}`;
}

/**
 * Checks if any comparison shows a size increase.
 *
 * @param comparisons - Array of comparison results
 * @returns True if any file increased in size
 */
export function hasIncrease(comparisons: ComparisonResult[]): boolean {
    return comparisons.some(
        (c) => !c.isNew && c.change !== null && c.change > 0
    );
}

/**
 * Calculates the total size change across all compared files.
 *
 * @param comparisons - Array of comparison results
 * @returns Object with totalBaseSize, totalCurrentSize, and totalChangePercent (null if no comparable files)
 */
export function calculateTotalChange(comparisons: ComparisonResult[]): {
    totalBaseSize: number;
    totalCurrentSize: number;
    totalChangePercent: number | null;
} {
    const comparable = comparisons.filter(
        (c) => !c.isNew && c.baseSize !== null
    );

    if (comparable.length === 0) {
        return {
            totalBaseSize: 0,
            totalCurrentSize: comparisons.reduce(
                (sum, c) => sum + c.currentSize,
                0
            ),
            totalChangePercent: null,
        };
    }

    const totalBaseSize = comparable.reduce(
        (sum, c) => sum + (c.baseSize ?? 0),
        0
    );
    const totalCurrentSize = comparable.reduce(
        (sum, c) => sum + c.currentSize,
        0
    );
    const totalChangePercent =
        totalBaseSize > 0
            ? ((totalCurrentSize - totalBaseSize) / totalBaseSize) * 100
            : 0;

    return {
        totalBaseSize,
        totalCurrentSize,
        totalChangePercent,
    };
}
