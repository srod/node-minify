/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface TempFixtures {
    dir: string;
    cleanup: () => Promise<void>;
}

export interface CLIResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
}

/**
 * Create a temporary directory populated with the provided files and return its path plus a cleanup function.
 *
 * @param files - Object mapping file paths (relative to the temporary directory) to file contents
 * @returns An object with `dir`, the temporary directory path, and `cleanup`, an async function that removes the directory and its contents
 */
export async function createTempFixtures(
    files: Record<string, string>
): Promise<TempFixtures> {
    const tempDir = await fs.mkdtemp(
        path.join(os.tmpdir(), "node-minify-test-")
    );

    for (const [name, content] of Object.entries(files)) {
        const filePath = path.join(tempDir, name);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
    }

    return {
        dir: tempDir,
        cleanup: async () => {
            await fs.rm(tempDir, { recursive: true, force: true });
        },
    };
}

/**
 * Get the absolute path to the project's CLI executable.
 *
 * @returns The absolute filesystem path to the CLI entry script at "../../packages/cli/dist/bin/cli.js"
 */
export function getCLIPath(): string {
    return path.resolve(__dirname, "../../packages/cli/dist/bin/cli.js");
}

/**
 * Run the CLI with the given arguments and capture its output and exit code.
 *
 * @param args - Command-line arguments to pass to the CLI executable
 * @returns An object containing `stdout` (captured standard output), `stderr` (captured standard error), and `exitCode` (the process exit code, or `null` if none was produced)
 */
export async function runCLI(args: string[]): Promise<CLIResult> {
    const cliPath = getCLIPath();
    const child = spawn("node", [cliPath, ...args]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
        stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
        stderr += data.toString();
    });

    const exitCode = await new Promise<number | null>((resolve, reject) => {
        child.on("error", reject);
        child.on("close", resolve);
    });

    return { stdout, stderr, exitCode };
}