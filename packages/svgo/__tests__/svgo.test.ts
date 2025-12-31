/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { svgo } from "../src/index.ts";

const testSvg = resolve(__dirname, "../../../tests/fixtures/images/test.svg");

describe("svgo", () => {
    test("should minify SVG content", async () => {
        const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <rect x="0" y="0" width="100" height="100" fill="red"/>
</svg>`;

        const result = await svgo({
            settings: {
                compressor: svgo,
                options: {},
            },
            content: svgContent,
        });

        expect(result.code).toBeDefined();
        expect(result.code.length).toBeLessThan(svgContent.length);
        expect(result.code).toContain("<svg");
        // SVGO converts rect to path for optimization
        expect(result.code).toContain("<path");
    });

    test("should use multipass by default", async () => {
        const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <title>Test SVG</title>
  <desc>A test SVG</desc>
  <rect x="0" y="0" width="100" height="100" fill="red"/>
</svg>`;

        const result = await svgo({
            settings: {
                compressor: svgo,
                options: {},
            },
            content: svgContent,
        });

        // multipass should convert rect to path
        expect(result.code).toContain("<path");
    });

    test("should handle empty content", async () => {
        const result = await svgo({
            settings: {
                compressor: svgo,
                options: {},
            },
            content: "",
        });

        expect(result.code).toBe("");
    });

    test("should preserve viewBox when not removed", async () => {
        const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="0" y="0" width="100" height="100" fill="blue"/>
</svg>`;

        const result = await svgo({
            settings: {
                compressor: svgo,
                options: {},
            },
            content: svgContent,
        });

        expect(result.code).toContain("viewBox");
    });

    test("should accept custom options", async () => {
        const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <rect x="0" y="0" width="100" height="100" fill="green"/>
</svg>`;

        const result = await svgo({
            settings: {
                compressor: svgo,
                options: {
                    floatPrecision: 2,
                    js2svg: {
                        indent: 2,
                        pretty: true,
                    },
                },
            },
            content: svgContent,
        });

        expect(result.code).toBeDefined();
        expect(result.code).toContain("<path");
    });

    test("should handle Buffer input", async () => {
        const svgBuffer = Buffer.from(
            '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>'
        );

        const result = await svgo({
            settings: {
                compressor: svgo,
                options: {},
            },
            content: svgBuffer,
        });

        expect(result.code).toBeDefined();
        expect(result.code).toContain("<svg");
    });
});

describe("svgo (integration)", () => {
    test("should optimize real SVG file content", async () => {
        const svgContent = readFileSync(testSvg, "utf8");

        const result = await svgo({
            settings: {
                compressor: svgo,
                options: {},
            },
            content: svgContent,
        });

        expect(result.code).toBeDefined();
        expect(result.code.length).toBeLessThan(svgContent.length);
        expect(result.code).toContain("<svg");
        expect(result.code).toContain("viewBox");
    });
});

describe("svgo (error handling)", () => {
    test("should wrap SVGO errors with descriptive message", async () => {
        // Invalid SVG that will cause SVGO to throw an error
        const invalidSvg = "<svg><invalid-element";

        await expect(
            svgo({
                settings: {
                    compressor: svgo,
                    options: {},
                },
                content: invalidSvg,
            })
        ).rejects.toThrow("SVGO optimization failed:");
    });

    test("should re-throw non-Error exceptions", async () => {
        // Use a plugin that throws a non-Error value
        const validSvg =
            '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

        await expect(
            svgo({
                settings: {
                    compressor: svgo,
                    options: {
                        plugins: [
                            {
                                name: "throwNonError",
                                fn: () => {
                                    throw "string error"; // Non-Error throw
                                },
                            },
                        ],
                    },
                },
                content: validSvg,
            })
        ).rejects.toBe("string error");
    });
});
