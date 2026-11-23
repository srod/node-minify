/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test, vi } from "vitest";

vi.mock("terser", () => ({
    minify: vi.fn().mockResolvedValue({ code: undefined }),
}));

describe("Package: terser error handling", async () => {
    test("should throw when terser returns empty code", async () => {
        const { terser } = await import("../src/index.ts");

        await expect(
            // @ts-expect-error testing invalid input: settings is missing required fields
            terser({ settings: {}, content: "var x = 1;" })
        ).rejects.toThrow("Terser failed: empty result");
    });
});
