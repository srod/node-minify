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

    test("should throw when sqwish returns empty result", async () => {
        vi.doMock("sqwish", () => ({
            default: {
                minify: () => undefined,
            },
        }));

        const { sqwish } = await import("../src/index.ts");

        await expect(
            sqwish({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("sqwish failed: empty result");
    });

    test("should wrap unexpected errors", async () => {
        vi.doMock("sqwish", () => ({
            default: {
                minify: () => {
                    throw new Error("Sqwish parse error");
                },
            },
        }));

        const { sqwish } = await import("../src/index.ts");

        await expect(
            sqwish({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("sqwish");
    });
});
