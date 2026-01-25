import path from "node:path";
import * as core from "@actions/core";
import fg from "fast-glob";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
    DEFAULT_IGNORES,
    DEFAULT_PATTERNS,
    discoverFiles,
    generateOutputPath,
} from "../src/discover.ts";

// Mock fast-glob globally
vi.mock("fast-glob", () => {
    return {
        default: {
            globSync: vi.fn(),
        },
    };
});

// Mock @actions/core
vi.mock("@actions/core", () => ({
    info: vi.fn(),
    warning: vi.fn(),
}));

describe("discover", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("DEFAULT_PATTERNS", () => {
        test("should include common source directories without TypeScript", () => {
            expect(DEFAULT_PATTERNS).toContain(
                "src/**/*.{js,mjs,cjs,jsx,css,html,htm,json,svg}"
            );
            expect(DEFAULT_PATTERNS).toContain(
                "app/**/*.{js,mjs,cjs,jsx,css,html,htm,json,svg}"
            );
            expect(DEFAULT_PATTERNS).toContain(
                "lib/**/*.{js,mjs,cjs,jsx,css,html,htm,json,svg}"
            );
            expect(DEFAULT_PATTERNS).toContain("styles/**/*.css");
            expect(DEFAULT_PATTERNS).toContain("*.{js,mjs,cjs,css,html,htm}");

            const hasTypeScript = DEFAULT_PATTERNS.some(
                (pattern: string) =>
                    pattern.includes(".ts") || pattern.includes(".tsx")
            );
            expect(hasTypeScript).toBe(false);
        });
    });

    describe("DEFAULT_IGNORES", () => {
        test("should include standard ignore patterns", () => {
            expect(DEFAULT_IGNORES).toContain("**/node_modules/**");
            expect(DEFAULT_IGNORES).toContain("**/dist/**");
            expect(DEFAULT_IGNORES).toContain("**/build/**");
            expect(DEFAULT_IGNORES).toContain("**/.next/**");
            expect(DEFAULT_IGNORES).toContain("**/*.min.{js,css}");
            expect(DEFAULT_IGNORES).toContain("**/*.d.ts");
            expect(DEFAULT_IGNORES).toContain("**/__tests__/**");
            expect(DEFAULT_IGNORES).toContain("**/.*");
        });
    });

    describe("discoverFiles", () => {
        test("should find files using default patterns in common directories", () => {
            vi.mocked(fg.globSync).mockReturnValue([
                "src/app.js",
                "app/main.js",
                "lib/utils.js",
                "styles/main.css",
            ]);

            const files = discoverFiles();

            expect(fg.globSync).toHaveBeenCalledWith(DEFAULT_PATTERNS, {
                cwd: process.cwd(),
                ignore: DEFAULT_IGNORES,
                followSymbolicLinks: false,
                onlyFiles: true,
            });
            expect(files).toEqual([
                "src/app.js",
                "app/main.js",
                "lib/utils.js",
                "styles/main.css",
            ]);
        });

        test("should exclude files matching default ignores", () => {
            vi.mocked(fg.globSync).mockReturnValue([
                "src/app.js",
                "lib/utils.js",
            ]);

            const files = discoverFiles();

            expect(fg.globSync).toHaveBeenCalledWith(
                expect.any(Array),
                expect.objectContaining({
                    ignore: expect.arrayContaining([
                        "**/node_modules/**",
                        "**/dist/**",
                        "**/.next/**",
                    ]),
                })
            );
            expect(files).toEqual(["src/app.js", "lib/utils.js"]);
        });

        test("should use custom patterns when provided", () => {
            vi.mocked(fg.globSync).mockReturnValue(["custom/file.js"]);

            const files = discoverFiles({
                patterns: ["custom/**/*.js"],
            });

            expect(fg.globSync).toHaveBeenCalledWith(["custom/**/*.js"], {
                cwd: process.cwd(),
                ignore: DEFAULT_IGNORES,
                followSymbolicLinks: false,
                onlyFiles: true,
            });
            expect(files).toEqual(["custom/file.js"]);
        });

        test("should merge custom ignore with defaults", () => {
            vi.mocked(fg.globSync).mockReturnValue(["src/app.js"]);

            discoverFiles({
                ignore: ["**/temp/**", "**/cache/**"],
            });

            expect(fg.globSync).toHaveBeenCalledWith(
                expect.any(Array),
                expect.objectContaining({
                    ignore: [...DEFAULT_IGNORES, "**/temp/**", "**/cache/**"],
                })
            );
        });

        test("should log files in dry-run mode", () => {
            vi.mocked(fg.globSync).mockReturnValue([
                "src/app.js",
                "src/utils.js",
            ]);

            const files = discoverFiles({ dryRun: true });

            expect(core.info).toHaveBeenCalledWith(
                "[dry-run] Would process 2 files"
            );
            expect(core.info).toHaveBeenCalledWith("  - src/app.js");
            expect(core.info).toHaveBeenCalledWith("  - src/utils.js");
            expect(files).toEqual(["src/app.js", "src/utils.js"]);
        });

        test("should warn when no files found", () => {
            vi.mocked(fg.globSync).mockReturnValue([]);

            const files = discoverFiles();

            expect(core.warning).toHaveBeenCalledWith(
                "No files found matching patterns"
            );
            expect(files).toEqual([]);
        });

        test("should use custom working directory", () => {
            vi.mocked(fg.globSync).mockReturnValue(["src/app.js"]);

            discoverFiles({ workingDirectory: "/custom/path" });

            expect(fg.globSync).toHaveBeenCalledWith(
                expect.any(Array),
                expect.objectContaining({
                    cwd: "/custom/path",
                })
            );
        });
    });

    describe("generateOutputPath", () => {
        test("should join input file with output directory", () => {
            const result = generateOutputPath("src/app.js", "dist");
            expect(result).toBe(path.join("dist", "src/app.js"));
        });

        test("should handle absolute input paths by stripping root", () => {
            const result = generateOutputPath("/var/log/test.log", "dist");
            expect(result).toBe(path.join("dist", "var/log/test.log"));
        });

        test("should sanitize directory traversal in input path", () => {
            const result = generateOutputPath("../../test.log", "dist");
            expect(result).toBe(path.join("dist", "test.log"));
        });

        test("should sanitize nested directory traversal", () => {
            const result = generateOutputPath("foo/../../bar.js", "dist");
            expect(result).toBe(path.join("dist", "bar.js"));
        });

        test("should preserve nested directory structure", () => {
            const result = generateOutputPath(
                "app/components/Button.js",
                "output"
            );
            expect(result).toBe(
                path.join("output", "app/components/Button.js")
            );
        });

        test("should handle root-level files", () => {
            const result = generateOutputPath("main.js", "build");
            expect(result).toBe(path.join("build", "main.js"));
        });
    });
});
