/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("Package: clean-css error handling", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("clean-css");
    });

    test("should throw when clean-css returns empty result", async () => {
        vi.doMock("clean-css", () => ({
            default: class {
                minify() {
                    return { styles: undefined };
                }
            },
        }));

        const { cleanCss } = await import("../src/index.ts");

        await expect(
            cleanCss({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("clean-css failed: empty result");
    });

    test("should throw when clean-css returns errors", async () => {
        vi.doMock("clean-css", () => ({
            default: class {
                minify() {
                    return {
                        errors: ["Invalid CSS syntax", "Another error"],
                        styles: "minified",
                    };
                }
            },
        }));

        const { cleanCss } = await import("../src/index.ts");

        await expect(
            cleanCss({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("Invalid CSS syntax; Another error");
    });

    test("should wrap unexpected errors", async () => {
        vi.doMock("clean-css", () => ({
            default: class {
                minify() {
                    throw new Error("Unexpected error");
                }
            },
        }));

        const { cleanCss } = await import("../src/index.ts");

        await expect(
            cleanCss({ settings: {} as any, content: ".a { color: red; }" })
        ).rejects.toThrow("clean-css");
    });
});
