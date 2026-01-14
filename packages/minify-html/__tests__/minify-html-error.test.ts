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

    test("should throw when minify-html returns empty result", async () => {
        vi.doMock("@minify-html/node", () => ({
            minify: () => ({
                toString: () => undefined,
            }),
        }));

        const { minifyHtml } = await import("../src/index.ts");

        await expect(
            minifyHtml({
                settings: {} as any,
                content: "<html><body>test</body></html>",
            })
        ).rejects.toThrow("minify-html failed: empty result");
    });

    test("should wrap unexpected errors", async () => {
        vi.doMock("@minify-html/node", () => ({
            minify: () => {
                throw new Error("Minify-html parse error");
            },
        }));

        const { minifyHtml } = await import("../src/index.ts");

        await expect(
            minifyHtml({
                settings: {} as any,
                content: "<html><body>test</body></html>",
            })
        ).rejects.toThrow("minify-html");
    });
});
