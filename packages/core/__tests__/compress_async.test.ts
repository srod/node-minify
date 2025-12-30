import { describe, expect, test, vi, afterAll } from "vitest";
import { compress } from "../src/compress.ts";
import { noCompress } from "../../no-compress/src/index.ts";
import type { Settings } from "@node-minify/types";
import path from "path";
import fs from "fs";

describe("compress async", () => {
    const tempDir = path.join(__dirname, "temp_async");
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    afterAll(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test("should handle empty input array", async () => {
        const settings: Settings = {
            compressor: noCompress,
            input: [],
            output: [],
        };
        const result = await compress(settings);
        expect(result).toBe("");
    });

    test("should handle input array with empty/null values", async () => {
        // This is tricky because input type is string[], so null is not allowed by TS.
        // But runtime might pass it.
        // Also the code checks `if (input)`.
        const settings: Settings = {
            compressor: noCompress,
            input: ["", "file.js"], // Empty string is falsy
            output: ["out1.js", "out2.js"],
        } as any;

        // Let's create a real file.
        const file = path.join(tempDir, "file.js");
        fs.writeFileSync(file, "content");
        const out2 = path.join(tempDir, "out2.js");

        const validSettings: Settings = {
            compressor: noCompress,
            input: ["", file],
            output: ["", out2], // output array length must match input
        };

        const result = await compress(validSettings);
        expect(result).toBe("content"); // The result of the last processed file?
        // The last file is "file.js" (index 1).
        // The first file (index 0) was skipped.
    });
});
