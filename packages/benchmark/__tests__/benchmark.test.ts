/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { benchmark } from "../src/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.resolve(
    __dirname,
    "../../../tests/fixtures/es5/fixture-1.js"
);

describe("Package: benchmark", () => {
    test("should benchmark multiple compressors", async () => {
        const results = await benchmark({
            input,
            compressors: ["terser", "esbuild"],
            iterations: 2,
            warmup: 1,
        });

        expect(results).toBeDefined();
        expect(results.files).toHaveLength(1);
        const firstFile = results.files[0];
        expect(firstFile).toBeDefined();
        expect(firstFile?.results).toHaveLength(2);
        expect(firstFile?.results[0]?.success).toBe(true);
        expect(results.summary).toBeDefined();
    });

    test("should handle missing compressors gracefully", async () => {
        const results = await benchmark({
            input,
            compressors: ["non-existent"],
        });

        const firstFile = results.files[0];
        const firstResult = firstFile?.results[0];
        expect(firstResult?.success).toBe(false);
        expect(firstResult?.error).toContain("not found");
    });
});
