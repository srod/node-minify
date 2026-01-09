/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";

export type RunCommandLineParams = {
    args: string[];
    data: string;
    maxBuffer?: number;
    timeout?: number;
};

/**
 * Run the command line with spawn.
 * @param args - Command line arguments for the Java process
 * @param data - Data to minify (piped to stdin)
 * @param maxBuffer - Optional buffer limit in bytes. Defaults to 1024 * 1024 (1MB).
 * @param timeout - Optional timeout in milliseconds. Process will be killed if it exceeds this limit.
 * @returns Promise with minified content from stdout
 */
export async function runCommandLine({
    args,
    data,
    maxBuffer,
    timeout,
}: RunCommandLineParams): Promise<string> {
    return run({ data, args, maxBuffer, timeout });
}

type RunParams = {
    data: string;
    args: string[];
    maxBuffer?: number;
    timeout?: number;
};

/**
 * Execute command with Java process.
 * @param data - Data to minify (piped to stdin)
 * @param args - Command line arguments
 * @param maxBuffer - Optional buffer limit in bytes. Defaults to 1024 * 1024 (1MB).
 * @param timeout - Optional timeout in milliseconds. Process will be killed if it exceeds this limit.
 * @returns Promise with minified content from stdout
 */
export async function run({
    data,
    args,
    maxBuffer = 1024 * 1024,
    timeout,
}: RunParams): Promise<string> {
    return new Promise((resolve, reject) => {
        const stdoutChunks: Buffer[] = [];
        const stderrChunks: Buffer[] = [];
        let stdoutLength = 0;
        let stderrLength = 0;
        let timeoutId: NodeJS.Timeout | undefined;
        let settled = false;

        const child = childProcess.spawn("java", args, {
            stdio: "pipe",
        });

        if (timeout) {
            timeoutId = setTimeout(() => {
                if (settled || child.killed) return;
                settled = true;
                child.kill();
                reject(new Error(`Process timed out after ${timeout}ms`));
            }, timeout);
        }

        child.on("error", (error) => {
            if (settled) return;
            settled = true;
            if (timeoutId) clearTimeout(timeoutId);
            reject(new Error(`Process error: ${error.message}`));
        });

        // Silence explicit error logging to prevent information leakage.
        // We attach empty error handlers to streams to prevent them from throwing
        // unhandled 'error' events, which would crash the process.
        const noop = () => {};
        child.stdin?.on("error", noop);
        child.stdout?.on("error", noop);
        child.stderr?.on("error", noop);

        child.on("exit", (code: number | null) => {
            if (settled) return;
            settled = true;
            if (timeoutId) clearTimeout(timeoutId);
            const stderr = Buffer.concat(stderrChunks).toString("utf8");
            if (code !== 0) {
                reject(new Error(stderr || `Process exited with code ${code}`));
                return;
            }

            resolve(Buffer.concat(stdoutChunks).toString("utf8"));
        });

        child.stdout?.on("data", (chunk: Buffer) => {
            stdoutChunks.push(chunk);
            stdoutLength += chunk.length;

            if (maxBuffer > 0 && stdoutLength > maxBuffer) {
                if (settled) return;
                settled = true;
                if (timeoutId) clearTimeout(timeoutId);
                child.kill();
                reject(new Error("stdout maxBuffer exceeded"));
                return;
            }
        });

        child.stderr?.on("data", (chunk: Buffer) => {
            stderrChunks.push(chunk);
            stderrLength += chunk.length;

            if (maxBuffer > 0 && stderrLength > maxBuffer) {
                if (settled) return;
                settled = true;
                if (timeoutId) clearTimeout(timeoutId);
                child.kill();
                reject(new Error("stderr maxBuffer exceeded"));
                return;
            }
        });

        child.stdin?.end(data);
    });
}
