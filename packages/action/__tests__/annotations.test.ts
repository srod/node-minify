/*! node-minify action annotations tests - MIT Licensed */

import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@actions/core", () => ({
    error: vi.fn(),
    notice: vi.fn(),
    warning: vi.fn(),
}));

import { error, notice, warning } from "@actions/core";
import { addAnnotations, addErrorAnnotation } from "../src/annotations.ts";
import type { MinifyResult } from "../src/types.ts";

/**
 * Build a MinifyResult whose files carry the given reduction percentages.
 */
function resultWith(reductions: number[]): MinifyResult {
    const files = reductions.map((reduction, i) => ({
        file: `f${i}.js`,
        originalSize: 100,
        minifiedSize: 50,
        reduction,
        timeMs: 1,
    }));
    return {
        files,
        compressor: "terser",
        totalOriginalSize: 0,
        totalMinifiedSize: 0,
        totalReduction: 0,
        totalTimeMs: 0,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("addAnnotations", () => {
    test("emits an error when the minified file grew", () => {
        addAnnotations(resultWith([-10]));
        expect(error).toHaveBeenCalledWith(
            expect.stringContaining("larger than original"),
            { file: "f0.js" }
        );
        expect(warning).not.toHaveBeenCalled();
        expect(notice).not.toHaveBeenCalled();
    });

    test("warns on a very low compression ratio", () => {
        addAnnotations(resultWith([3]));
        expect(warning).toHaveBeenCalledWith(
            expect.stringContaining("Very low compression ratio"),
            { file: "f0.js" }
        );
    });

    test("emits a notice on a low compression ratio", () => {
        addAnnotations(resultWith([15]));
        expect(notice).toHaveBeenCalledWith(
            expect.stringContaining("Low compression ratio"),
            { file: "f0.js" }
        );
    });

    test("stays silent on a healthy compression ratio", () => {
        addAnnotations(resultWith([60]));
        expect(error).not.toHaveBeenCalled();
        expect(warning).not.toHaveBeenCalled();
        expect(notice).not.toHaveBeenCalled();
    });

    test("annotates each file independently", () => {
        addAnnotations(resultWith([-5, 3, 15, 80]));
        expect(error).toHaveBeenCalledTimes(1);
        expect(warning).toHaveBeenCalledTimes(1);
        expect(notice).toHaveBeenCalledTimes(1);
    });
});

describe("addErrorAnnotation", () => {
    test("records a minification-failed error annotation", () => {
        addErrorAnnotation("x.js", "kaboom");
        expect(error).toHaveBeenCalledWith("Minification failed: kaboom", {
            file: "x.js",
        });
    });
});
