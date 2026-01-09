/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
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

export function getCLIPath(): string {
    return path.resolve(__dirname, "../../packages/cli/dist/bin/cli.js");
}

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
