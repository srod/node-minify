/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Package: crass error handling", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("crass");
    });

    test("should throw when crass returns empty result", async () => {
        vi.doMock("crass", () => ({
            default: {
                parse: () => ({
                    optimize: () => ({
                        toString: () => undefined,
                    }),
                }),
            },
        }));

        const { crass } = await import("../src/index.ts");

        await expect(
            crass({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("crass failed: empty result");
    });

    test("should wrap unexpected errors", async () => {
        vi.doMock("crass", () => ({
            default: {
                parse: () => {
                    throw new Error("Parse error");
                },
            },
        }));

        const { crass } = await import("../src/index.ts");

        await expect(
            crass({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("crass");
    });
});
