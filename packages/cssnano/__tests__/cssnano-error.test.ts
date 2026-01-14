/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Package: cssnano error handling", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("postcss");
    });

    test("should throw when cssnano returns empty result", async () => {
        vi.doMock("postcss", () => ({
            default: () => ({
                process: async () => ({ css: undefined }),
            }),
        }));

        const { cssnano } = await import("../src/index.ts");

        await expect(
            cssnano({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow(
            "cssnano minification failed: cssnano failed: empty or invalid result"
        );
    });
});
