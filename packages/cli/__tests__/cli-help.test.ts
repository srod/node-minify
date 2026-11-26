/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { beforeAll, describe, expect, test } from "vitest";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const cliEntry = path.join(repoRoot, "packages/cli/src/bin/cli.ts");

describe("cli --help compressor list", () => {
    let list: string;

    beforeAll(async () => {
        const { stdout } = await execFileAsync("bun", [cliEntry, "--help"], {
            cwd: repoRoot,
        });
        list = stdout.slice(stdout.indexOf("List of compressors:"));
    });

    test("notes csso, imagemin and uglify-js as removed in v12 with their replacements", () => {
        expect(list).toContain(
            "      - csso (removed in v12, use lightningcss or cssnano)\n"
        );
        expect(list).toContain(
            "      - imagemin (removed in v12, use sharp, or svgo for SVG)\n"
        );
        expect(list).toContain(
            "      - uglify-js (removed in v12, use terser)\n"
        );
    });

    test("lists jsonminify under Supported and the three under Legacy", () => {
        const supported = list.slice(
            list.indexOf("Supported:"),
            list.indexOf("Legacy:")
        );
        const legacy = list.slice(list.indexOf("Legacy:"));

        expect(supported).toContain("      - jsonminify\n");
        expect(legacy).not.toContain("jsonminify");
        for (const name of ["csso", "imagemin", "uglify-js"]) {
            expect(supported).not.toContain(`- ${name}`);
            expect(legacy).toContain(`- ${name} (removed in v12`);
        }
    });

    test("leaves no-compress without a note", () => {
        expect(list).toContain("      - no-compress\n");
    });
});
