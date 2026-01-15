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
        vi.doMock("@minify-html/node", () => ({
            minify: () => {
                throw new Error("Invalid HTML syntax");
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
});
