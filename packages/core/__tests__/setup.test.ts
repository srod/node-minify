/*! node-minify core setup tests - MIT Licensed */

import type { Settings } from "@node-minify/types";
import { describe, expect, test, vi } from "vitest";

// Keep input untouched so checkOutput receives the literal paths instead of
// glob-expanded results.
vi.mock("@node-minify/utils", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@node-minify/utils")>();
    return {
        ...actual,
        wildcards: vi.fn((input: string | string[]) => ({ input })),
    };
});

import { setup } from "../src/setup.ts";

const compressor = (() => ({ code: "" })) as unknown as Settings["compressor"];

describe("setup $1 output handling", () => {
    test("rewrites the $1 placeholder for a single file", () => {
        const settings = setup({
            compressor,
            input: "a.js",
            output: "$1.min.js",
        });
        expect(typeof settings.output).toBe("string");
        expect(settings.output).not.toContain("$1");
        expect(settings.output).toContain("min.js");
    });

    test("rewrites the $1 placeholder per file for an array input", () => {
        const settings = setup({
            compressor,
            input: ["a.js", "b.js"],
            output: "$1.min.js",
        });
        expect(Array.isArray(settings.output)).toBe(true);
        const outputs = settings.output as string[];
        expect(outputs).toHaveLength(2);
        expect(outputs.every((o) => !o.includes("$1"))).toBe(true);
    });

    test("leaves a plain output without a placeholder unchanged", () => {
        const settings = setup({
            compressor,
            input: "a.js",
            output: "dist/a.min.js",
        });
        expect(settings.output).toBe("dist/a.min.js");
    });
});
