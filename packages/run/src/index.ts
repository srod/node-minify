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
 * @param timeout - Optional timeout in milliseconds.
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
 * @param timeout - Optional timeout in milliseconds.
 * @returns Promise with minified content from stdout
 */
export async function run({
    data,
    args,
    maxBuffer = 1024 * 1024,
    timeout,
}: RunParams): Promise<string> {
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";
        let timer: NodeJS.Timeout | undefined;

        const child = childProcess.spawn("java", args, {
            stdio: "pipe",
        });

        if (timeout) {
            timer = setTimeout(() => {
                child.kill();
                reject(new Error("timeout exceeded"));
            }, timeout);
        }

        const handleError = (source: string) => (error: Error) => {
            console.error(`Error in ${source}:`, error);
        };

        child.on("error", (error) => {
            if (timer) clearTimeout(timer);
            handleError("child")(error);
            reject(new Error(`Process error: ${error.message}`));
        });

        child.stdin?.on("error", handleError("child.stdin"));
        child.stdout?.on("error", handleError("child.stdout"));
        child.stderr?.on("error", handleError("child.stderr"));

        child.on("exit", (code: number | null) => {
            if (timer) clearTimeout(timer);
            if (code !== 0) {
                reject(new Error(stderr || `Process exited with code ${code}`));
                return;
            }

            resolve(stdout);
        });

        child.stdout?.on("data", (chunk: Buffer) => {
            stdout += chunk;
            if (
                maxBuffer > 0 &&
                Buffer.byteLength(stdout, "utf8") > maxBuffer
            ) {
                if (timer) clearTimeout(timer);
                child.kill();
                reject(new Error("stdout maxBuffer exceeded"));
                return;
            }
        });

        child.stderr?.on("data", (chunk: Buffer) => {
            stderr += chunk;
            if (
                maxBuffer > 0 &&
                Buffer.byteLength(stderr, "utf8") > maxBuffer
            ) {
                if (timer) clearTimeout(timer);
                child.kill();
                reject(new Error("stderr maxBuffer exceeded"));
                return;
            }
        });

        child.stdin?.end(data);
    });
}
