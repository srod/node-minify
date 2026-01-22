/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Package: oxc error handling", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("oxc-minify");
    });

    test("should wrap unexpected errors", async () => {
        vi.doMock("oxc-minify", () => ({
            minify: async () => {
                throw new Error("OXC internal error");
            },
        }));

        const { oxc } = await import("../src/index.ts");

        await expect(
            oxc({ settings: {} as any, content: "var x = 1;" })
        ).rejects.toThrow("oxc");
    });
});
