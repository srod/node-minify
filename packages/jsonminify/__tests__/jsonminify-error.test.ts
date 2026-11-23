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
            // @ts-expect-error testing invalid input: settings is missing required fields
            jsonMinify({ settings: {}, content: '{"key": "value"}' })
        ).rejects.toThrow("jsonminify minification failed: JSON parse error");
    });
});
