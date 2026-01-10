/*! node-minify action tests - MIT Licensed */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Mock @actions/core before importing inputs
vi.mock("@actions/core", () => ({
    getInput: vi.fn(),
    getBooleanInput: vi.fn(),
    warning: vi.fn(),
}));

// Mock @node-minify/utils
vi.mock("@node-minify/utils", () => ({
    isBuiltInCompressor: vi.fn(),
}));

import { getInput, getBooleanInput, warning } from "@actions/core";
import { isBuiltInCompressor } from "@node-minify/utils";
import { parseInputs, validateCompressor } from "../src/inputs.ts";

describe("parseInputs", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Default mocks
        vi.mocked(getInput).mockImplementation((name: string) => {
            const defaults: Record<string, string> = {
                input: "src/app.js",
                output: "dist/app.min.js",
                compressor: "terser",
                options: "{}",
                "min-reduction": "0",
                "working-directory": ".",
            };
            return defaults[name] || "";
        });
        vi.mocked(getBooleanInput).mockImplementation((name: string) => {
            const defaults: Record<string, boolean> = {
                "report-summary": true,
                "report-pr-comment": false,
                "report-annotations": false,
                benchmark: false,
                "fail-on-increase": false,
                "include-gzip": true,
            };
            return defaults[name] ?? false;
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    test("parses basic inputs correctly", () => {
        const inputs = parseInputs();

        expect(inputs.input).toBe("src/app.js");
        expect(inputs.output).toBe("dist/app.min.js");
        expect(inputs.compressor).toBe("terser");
        expect(inputs.reportSummary).toBe(true);
    });

    test("throws error for invalid JSON in options", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "options") return "not-valid-json";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        expect(() => parseInputs()).toThrow("Invalid JSON in 'options' input");
    });

    test("throws error when type required but not provided", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "compressor") return "esbuild";
            if (name === "type") return "";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        expect(() => parseInputs()).toThrow(
            "Compressor 'esbuild' requires the 'type' input"
        );
    });

    test("throws error for invalid min-reduction value", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "min-reduction") return "abc";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        expect(() => parseInputs()).toThrow("Invalid 'min-reduction' input");
    });

    test("throws error for out-of-range min-reduction", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "min-reduction") return "150";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        expect(() => parseInputs()).toThrow("Invalid 'min-reduction' input");
    });

    test("parses benchmark compressors from comma-separated string", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "benchmark-compressors") return "terser, swc, oxc";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        const inputs = parseInputs();
        expect(inputs.benchmarkCompressors).toEqual(["terser", "swc", "oxc"]);
    });
});

describe("validateCompressor", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("warns for deprecated compressor", () => {
        vi.mocked(isBuiltInCompressor).mockReturnValue(true);

        validateCompressor("babel-minify");

        expect(warning).toHaveBeenCalledWith(
            expect.stringContaining("Deprecated")
        );
    });

    test("warns for non-built-in compressor", () => {
        vi.mocked(isBuiltInCompressor).mockReturnValue(false);

        validateCompressor("custom-compressor");

        expect(warning).toHaveBeenCalledWith(
            expect.stringContaining("not a built-in compressor")
        );
    });

    test("does not warn for valid built-in compressor", () => {
        vi.mocked(isBuiltInCompressor).mockReturnValue(true);

        validateCompressor("terser");

        expect(warning).not.toHaveBeenCalled();
    });
});

describe("parseInputs edge cases", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(getBooleanInput).mockImplementation((name: string) => {
            const defaults: Record<string, boolean> = {
                "report-summary": true,
                "report-pr-comment": false,
                "report-annotations": false,
                benchmark: false,
                "fail-on-increase": false,
                "include-gzip": true,
            };
            return defaults[name] ?? false;
        });
    });

    test("throws error for invalid type value", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "type") return "invalid";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        expect(() => parseInputs()).toThrow(
            "Invalid 'type' input: 'invalid' (expected 'js' or 'css')"
        );
    });

    test("accepts valid type 'js'", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "type") return "js";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        const inputs = parseInputs();
        expect(inputs.type).toBe("js");
    });

    test("accepts valid type 'css'", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "type") return "css";
            if (name === "input") return "src/app.css";
            if (name === "output") return "dist/app.min.css";
            return "";
        });

        const inputs = parseInputs();
        expect(inputs.type).toBe("css");
    });

    test("deduplicates benchmark compressors", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "benchmark-compressors")
                return "terser, terser, swc, swc";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        const inputs = parseInputs();
        expect(inputs.benchmarkCompressors).toEqual(["terser", "swc"]);
    });

    test("filters empty strings from benchmark compressors", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "benchmark-compressors") return "terser,,swc, ,oxc";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        const inputs = parseInputs();
        expect(inputs.benchmarkCompressors).toEqual(["terser", "swc", "oxc"]);
    });

    test("falls back to defaults when all benchmark compressors are empty", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "benchmark-compressors") return ", , ,";
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        const inputs = parseInputs();
        expect(inputs.benchmarkCompressors).toEqual([
            "terser",
            "esbuild",
            "swc",
            "oxc",
        ]);
    });

    test("does not leak raw JSON in error message", () => {
        vi.mocked(getInput).mockImplementation((name: string) => {
            if (name === "options") return '{"secret": "password123';
            if (name === "input") return "src/app.js";
            if (name === "output") return "dist/app.min.js";
            return "";
        });

        expect(() => parseInputs()).toThrow(/Invalid JSON in 'options' input/);
        // Should NOT contain the actual input value
        try {
            parseInputs();
        } catch (err) {
            expect((err as Error).message).not.toContain("password123");
        }
    });
});
