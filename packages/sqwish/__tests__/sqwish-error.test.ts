/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Package: sqwish error handling", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("sqwish");
    });

    test("should wrap minification errors", async () => {
        vi.doMock("sqwish", () => ({
            default: {
                minify: () => {
                    throw new Error("CSS parse error");
                },
            },
        }));

        const { sqwish } = await import("../src/index.ts");

        await expect(
            sqwish({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("sqwish minification failed: CSS parse error");
    });
});
