/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CLIResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}

export interface TempFixtures {
    dir: string;
    cleanup: () => Promise<void>;
}

/**
 * Locate the CLI binary and return its absolute filesystem path.
 *
 * @returns The absolute path to the CLI binary file
 */
export function getCLIPath(): string {
    return path.resolve(__dirname, "../../packages/cli/dist/bin/cli.js");
}

/**
 * Run CLI command and capture output
 */
/**
 * Execute the project's CLI binary with the given arguments and collect its exit code, stdout, and stderr.
 *
 * @param args - Arguments to pass to the CLI process
 * @returns An object containing the process `exitCode`, captured `stdout`, and captured `stderr`
 */
export function runCLI(args: string[]): Promise<CLIResult> {
    const cliPath = getCLIPath();

    return new Promise((resolve, reject) => {
        const child = spawn("node", [cliPath, ...args], {
            stdio: ["ignore", "pipe", "pipe"],
            // windowsHide: true, // Only available on Windows
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("error", (error) => {
            reject(error);
        });

        child.on("close", (code) => {
            resolve({
                exitCode: code ?? 1,
                stdout,
                stderr,
            });
        });
    });
}

/**
 * Creates an isolated temporary directory populated with the provided files.
 *
 * The keys of `files` are treated as relative paths inside the temp directory and their values are written using UTF-8 encoding.
 *
 * @param files - Mapping of relative file paths to file contents to create inside the temp directory
 * @returns An object containing `dir`, the absolute path to the created temp directory, and `cleanup`, a function that removes the directory and its contents and returns a Promise<void>
 */
export async function createTempFixtures(
    files: Record<string, string>
): Promise<TempFixtures> {
    const tmpBase = path.resolve(__dirname, "../tmp/integration");
    const dir = path.join(tmpBase, crypto.randomUUID());

    await fs.mkdir(dir, { recursive: true });

    for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(dir, filename);
        const fileDir = path.dirname(filePath);
        await fs.mkdir(fileDir, { recursive: true });
        await fs.writeFile(filePath, content, "utf-8");
    }

    const cleanup = async () => {
        try {
            await fs.rm(dir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    };

    return { dir, cleanup };
}

/**
 * Read and return the UTF-8 contents of a file inside a TempFixtures directory.
 *
 * @param fixtures - The temporary fixtures container whose `dir` is used as the base path
 * @param filename - Relative path to the file within the fixtures directory
 * @returns The file contents as a string
 */
export async function readTempFile(
    fixtures: TempFixtures,
    filename: string
): Promise<string> {
    const filePath = path.join(fixtures.dir, filename);
    return fs.readFile(filePath, "utf-8");
}

/**
 * Determine whether a file exists inside a TempFixtures directory.
 *
 * @param fixtures - The TempFixtures container whose `dir` is used as the base path
 * @param filename - Path to the file relative to `fixtures.dir`
 * @returns `true` if the file is accessible, `false` otherwise
 */
export async function tempFileExists(
    fixtures: TempFixtures,
    filename: string
): Promise<boolean> {
    const filePath = path.join(fixtures.dir, filename);
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validates that a minified JavaScript string is non-empty and reasonably sized compared to the original.
 *
 * @param original - The original JavaScript source used as the size/reference input.
 * @param minified - The minified JavaScript output to validate.
 * @throws Error if `minified` is empty or contains only whitespace, or if `original` is longer than 100 characters and `minified` exceeds 110% of `original`'s length.
 */
export function assertValidMinifiedJS(
    original: string,
    minified: string
): void {
    if (!minified || minified.trim().length === 0) {
        throw new Error("Minified JS is empty");
    }

    // For non-trivial input, minified should generally be smaller
    if (original.length > 100 && minified.length > original.length * 1.1) {
        throw new Error(
            `Minified JS is larger than original: ${minified.length} > ${original.length}`
        );
    }
}

/**
 * Validates basic expectations for minified CSS content.
 *
 * Throws if the minified output is empty or, for inputs longer than 100 characters,
 * if the minified output is more than 10% larger than the original.
 *
 * @param original - The original CSS source text used as the reference size.
 * @param minified - The minified CSS output to validate.
 * @throws Error if `minified` is empty or consists only of whitespace.
 * @throws Error if `original` length is greater than 100 and `minified` length is greater than `original.length * 1.1`.
 */
export function assertValidMinifiedCSS(
    original: string,
    minified: string
): void {
    if (!minified || minified.trim().length === 0) {
        throw new Error("Minified CSS is empty");
    }

    // For non-trivial input, minified should generally be smaller
    if (original.length > 100 && minified.length > original.length * 1.1) {
        throw new Error(
            `Minified CSS is larger than original: ${minified.length} > ${original.length}`
        );
    }
}

/**
 * Sample JS content for testing
 */
export const sampleJS = `
// This is a comment that should be removed
function helloWorld(name) {
    var greeting = "Hello, " + name + "!";
    console.log(greeting);
    return greeting;
}

// Another comment
var result = helloWorld("World");
`;

/**
 * Sample CSS content for testing
 */
export const sampleCSS = `
/* This is a comment that should be removed */
body {
    background-color: #ffffff;
    margin: 0;
    padding: 0;
}

/* Another comment */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}
`;

/**
 * Sample HTML content for testing
 */
export const sampleHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page</title>
</head>
<body>
    <!-- This is a comment -->
    <div class="container">
        <h1>Hello World</h1>
        <p>This is a test paragraph.</p>
    </div>
</body>
</html>
`;

/**
 * Sample JSON content for testing
 */
export const sampleJSON = `{
    "name": "test",
    "version": "1.0.0",
    "description": "A test package",
    "keywords": [
        "test",
        "sample"
    ]
}`;