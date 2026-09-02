/*! node-minify action PR-comment tests - MIT Licensed */

import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@actions/core", () => ({
    info: vi.fn(),
    warning: vi.fn(),
}));

vi.mock("@actions/github", () => ({
    context: {
        payload: {},
        repo: { owner: "test-owner", repo: "test-repo" },
    },
    getOctokit: vi.fn(),
}));

import { info, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { postPRComment } from "../src/comment.ts";
import type { ComparisonResult, MinifyResult } from "../src/types.ts";

const result: MinifyResult = {
    files: [
        {
            file: "app.js",
            originalSize: 1000,
            minifiedSize: 400,
            reduction: 60,
            timeMs: 12,
        },
    ],
    compressor: "terser",
    totalOriginalSize: 1000,
    totalMinifiedSize: 400,
    totalReduction: 60,
    totalTimeMs: 12,
};

/**
 * Wire up a fake octokit for the mocked getOctokit.
 *
 * postPRComment only reads `paginate` and `rest.issues.{listComments,updateComment,createComment}`,
 * so the mock intentionally implements just that subset rather than the full Octokit surface.
 */
function mockOctokit(comments: { id: number; body?: string }[] = []) {
    const listComments = vi.fn();
    const paginate = vi.fn().mockResolvedValue(comments);
    const updateComment = vi.fn().mockResolvedValue({ data: { id: 1 } });
    const createComment = vi.fn().mockResolvedValue({ data: { id: 99 } });
    const octokit = {
        paginate,
        rest: { issues: { listComments, updateComment, createComment } },
    };
    // @ts-expect-error mocked octokit only implements the paginate/issues subset postPRComment reads, not the full Octokit type
    vi.mocked(getOctokit).mockReturnValue(octokit);
    return { paginate, updateComment, createComment };
}

beforeEach(() => {
    vi.clearAllMocks();
    (context as { payload: Record<string, unknown> }).payload = {
        pull_request: { number: 7 },
    };
});

describe("postPRComment", () => {
    test("skips when no GitHub token is provided", async () => {
        await postPRComment(result, undefined);
        expect(warning).toHaveBeenCalledWith(
            expect.stringContaining("skipping PR comment")
        );
        expect(getOctokit).not.toHaveBeenCalled();
    });

    test("skips when the event is not a pull request", async () => {
        (context as { payload: Record<string, unknown> }).payload = {};
        await postPRComment(result, "token");
        expect(warning).toHaveBeenCalledWith(
            expect.stringContaining("Not a pull request")
        );
        expect(getOctokit).not.toHaveBeenCalled();
    });

    test("creates a new comment when none exists yet", async () => {
        const { createComment, updateComment } = mockOctokit([]);
        await postPRComment(result, "token");
        expect(createComment).toHaveBeenCalledWith(
            expect.objectContaining({
                owner: "test-owner",
                repo: "test-repo",
                issue_number: 7,
                body: expect.stringContaining("📦 node-minify Report"),
            })
        );
        expect(updateComment).not.toHaveBeenCalled();
        expect(info).toHaveBeenCalledWith(
            expect.stringContaining("Created new PR comment")
        );
    });

    test("updates the existing node-minify comment when present", async () => {
        const { createComment, updateComment } = mockOctokit([
            { id: 55, body: "<!-- node-minify-report -->\nold report" },
            { id: 56, body: "unrelated comment" },
        ]);
        await postPRComment(result, "token");
        expect(updateComment).toHaveBeenCalledWith(
            expect.objectContaining({ comment_id: 55 })
        );
        expect(createComment).not.toHaveBeenCalled();
        expect(info).toHaveBeenCalledWith(
            expect.stringContaining("Updated existing PR comment #55")
        );
    });

    test("adds a base-comparison column and handles files without a comparison", async () => {
        const multiResult: MinifyResult = {
            files: [
                {
                    file: "a.js",
                    originalSize: 1000,
                    minifiedSize: 400,
                    reduction: 60,
                    timeMs: 12,
                },
                {
                    file: "b.js",
                    originalSize: 500,
                    minifiedSize: 450,
                    reduction: 10,
                    timeMs: 5,
                },
            ],
            compressor: "terser",
            totalOriginalSize: 1500,
            totalMinifiedSize: 850,
            totalReduction: 43.3,
            totalTimeMs: 17,
        };
        // Comparison only for a.js, so b.js renders the "-" placeholder.
        const comparisons: ComparisonResult[] = [
            {
                file: "a.js",
                baseSize: 1200,
                currentSize: 400,
                change: -66.7,
                isNew: false,
            },
        ];
        const { createComment } = mockOctokit([]);
        await postPRComment(multiResult, "token", comparisons);
        const body = vi.mocked(createComment).mock.calls[0]?.[0].body as string;
        expect(body).toContain("vs Base");

        // a.js has a comparison -> its formatted change is rendered.
        const aRow = body.split("\n").find((l) => l.includes("`a.js`")) ?? "";
        expect(aRow).toContain("-66.7% ✅");
        // b.js has no comparison -> its vs-base column shows the "-" placeholder.
        const bRow = body.split("\n").find((l) => l.includes("`b.js`")) ?? "";
        expect(bRow).toContain("| - |");
    });

    test("warns instead of throwing when the GitHub API fails", async () => {
        const { paginate } = mockOctokit([]);
        paginate.mockRejectedValue(new Error("boom"));
        await expect(postPRComment(result, "token")).resolves.toBeUndefined();
        expect(warning).toHaveBeenCalledWith(
            expect.stringContaining("Failed to post PR comment")
        );
    });
});
