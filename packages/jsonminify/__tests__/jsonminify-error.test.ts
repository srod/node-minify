/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Package: jsonminify error handling", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("jsonminify");
    });

    test("should throw when jsonminify returns empty result", async () => {
        vi.doMock("jsonminify", () => ({
            default: () => undefined,
        }));

        const { jsonMinify } = await import("../src/index.ts");

        await expect(
            jsonMinify({ settings: {} as any, content: '{"key": "value"}' })
        ).rejects.toThrow("jsonminify failed: empty result");
    });

    test("should wrap unexpected errors", async () => {
        vi.doMock("jsonminify", () => ({
            default: () => {
                throw new Error("JSON parse error");
            },
        }));

        const { jsonMinify } = await import("../src/index.ts");

        await expect(
            jsonMinify({ settings: {} as any, content: '{"key": "value"}' })
        ).rejects.toThrow("jsonminify");
    });
});
