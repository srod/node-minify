/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Package: minify-html error handling", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("@minify-html/node");
    });

    test("should wrap minification errors", async () => {
        // Mirrors the real module shape: @minify-html/node is CommonJS, so its
        // exports are reached through the default export.
        vi.doMock("@minify-html/node", () => ({
            default: {
                minify: () => {
                    throw new Error("Invalid HTML syntax");
                },
            },
        }));

        const { minifyHtml } = await import("../src/index.ts");

        await expect(
            minifyHtml({
                settings: {} as any,
                content: "<html><body>test</body></html>",
            })
        ).rejects.toThrow(
            "minify-html minification failed: Invalid HTML syntax"
        );
    });

    test("should call minify through the CommonJS default export", async () => {
        // Regression guard: importing `minify` as a named export resolves to
        // undefined under Node's ESM loader, which shipped broken in v10.
        const lib = await import("@minify-html/node");

        expect(typeof lib.default.minify).toBe("function");
    });
});
