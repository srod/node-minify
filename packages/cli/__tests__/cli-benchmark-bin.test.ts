/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, test } from "vitest";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const cliEntry = path.join(repoRoot, "packages/cli/src/bin/cli.ts");

describe("cli benchmark command", () => {
    test("should use benchmark defaults when compressors are not provided", async () => {
        const { stdout } = await execFileAsync(
            "bun",
            [
                cliEntry,
                "benchmark",
                "tests/fixtures/es5/fixture-1.js",
                "--format",
                "json",
                "--iterations",
                "1",
            ],
            {
                cwd: repoRoot,
            }
        );

        const jsonStart = stdout.indexOf("{");
        const parsed = JSON.parse(stdout.slice(jsonStart)) as {
            files: Array<{
                results: Array<{ compressor: string }>;
            }>;
        };

        expect(
            parsed.files[0]?.results.map((result) => result.compressor)
        ).toEqual(["terser", "esbuild", "swc", "oxc"]);
    }, 60000);
});
