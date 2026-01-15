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

    test("should wrap minification errors", async () => {
        vi.doMock("jsonminify", () => ({
            default: () => {
                throw new Error("JSON parse error");
            },
        }));

        const { jsonMinify } = await import("../src/index.ts");

        await expect(
            jsonMinify({ settings: {} as any, content: '{"key": "value"}' })
        ).rejects.toThrow("jsonminify minification failed: JSON parse error");
    });
});
