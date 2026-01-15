/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Package: csso error handling", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("csso");
    });

    test("should throw when csso returns empty result", async () => {
        vi.doMock("csso", () => ({
            minify: async () => ({ css: undefined }),
        }));

        const { csso } = await import("../src/index.ts");

        await expect(
            csso({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("csso failed: empty result");
    });

    test("should wrap unexpected errors", async () => {
        vi.doMock("csso", () => ({
            minify: async () => {
                throw new Error("CSSO parse error");
            },
        }));

        const { csso } = await import("../src/index.ts");

        await expect(
            csso({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("csso");
    });
});
