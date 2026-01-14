/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Package: html-minifier error handling", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("html-minifier-next");
    });

    test("should throw when html-minifier returns empty result", async () => {
        vi.doMock("html-minifier-next", () => ({
            minify: async () => undefined,
        }));

        const { htmlMinifier } = await import("../src/index.ts");

        await expect(
            htmlMinifier({
                settings: {} as any,
                content: "<html><body>test</body></html>",
            })
        ).rejects.toThrow("html-minifier failed: empty result");
    });

    test("should wrap unexpected errors", async () => {
        vi.doMock("html-minifier-next", () => ({
            minify: async () => {
                throw new Error("HTML parse error");
            },
        }));

        const { htmlMinifier } = await import("../src/index.ts");

        await expect(
            htmlMinifier({
                settings: {} as any,
                content: "<html><body>test</body></html>",
            })
        ).rejects.toThrow("html-minifier");
    });
});
