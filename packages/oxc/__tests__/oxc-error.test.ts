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
            // @ts-expect-error testing invalid input: settings is missing required fields
            oxc({ settings: {}, content: "var x = 1;" })
        ).rejects.toThrow("oxc");
    });

    test("should throw when oxc reports an error", async () => {
        vi.doMock("oxc-minify", () => ({
            minify: async () => ({
                code: "",
                errors: [
                    {
                        severity: "Error",
                        message: "Unexpected token",
                        labels: [],
                        helpMessage: null,
                        codeframe: null,
                    },
                ],
            }),
        }));

        const { oxc } = await import("../src/index.ts");

        await expect(
            // @ts-expect-error testing invalid input: settings is missing required fields
            oxc({ settings: {}, content: "var a = ;" })
        ).rejects.toThrow("oxc minification failed: Unexpected token");
    });

    test("should not throw when oxc reports only warnings", async () => {
        vi.doMock("oxc-minify", () => ({
            minify: async () => ({
                code: "var x=1;",
                errors: [
                    {
                        severity: "Warning",
                        message: "w",
                        labels: [],
                        helpMessage: null,
                        codeframe: null,
                    },
                ],
            }),
        }));

        const { oxc } = await import("../src/index.ts");

        const result = await (
            // @ts-expect-error testing invalid input: settings is missing required fields
            oxc({ settings: {}, content: "var x = 1;" })
        );

        expect(result.code).toBe("var x=1;");
    });
});
