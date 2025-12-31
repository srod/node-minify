/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";

export type RunCommandLineParams = {
    args: string[];
    data: string;
    timeout?: number;
};

/**
 * Run the command line with spawn.
 * @param args - Command line arguments for the Java process
 * @param data - Data to minify (piped to stdin)
 * @param timeout - Timeout in milliseconds
 * @returns Promise with minified content from stdout
 */
export async function runCommandLine({
    args,
    data,
    timeout,
}: RunCommandLineParams): Promise<string> {
    return run({ data, args, timeout });
}

type RunParams = {
    data: string;
    args: string[];
    timeout?: number;
};

/**
 * Execute command with Java process.
 * @param data - Data to minify (piped to stdin)
 * @param args - Command line arguments
 * @param timeout - Timeout in milliseconds
 * @returns Promise with minified content from stdout
 */
export async function run({
    data,
    args,
    timeout,
}: RunParams): Promise<string> {
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";
        let timer: ReturnType<typeof setTimeout> | undefined;

        const child = childProcess.spawn("java", args, {
            stdio: "pipe",
        });

        if (timeout) {
            timer = setTimeout(() => {
                child.kill();
                reject(new Error("Processing timed out"));
            }, timeout);
        }

        const handleError = (source: string) => (error: Error) => {
            if (timer) clearTimeout(timer);
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
        });

        child.stderr?.on("data", (chunk: Buffer) => {
            stderr += chunk;
        });

        child.stdin?.end(data);
    });
}
