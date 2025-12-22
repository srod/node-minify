/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";

export type RunCommandLineParams = {
    args: string[];
    data: string;
};

/**
 * Run the command line with spawn.
 * @param args - Command line arguments for the Java process
 * @param data - Data to minify (piped to stdin)
 * @returns Promise with minified content from stdout
 */
export async function runCommandLine({
    args,
    data,
}: RunCommandLineParams): Promise<string> {
    return run({ data, args });
}

type RunParams = {
    data: string;
    args: string[];
};

/**
 * Exec command.
 * @param data Data to minify
 * @param args Arguments
 * @returns Promise with minified content
 */
export async function run({ data, args }: RunParams): Promise<string> {
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";

        const child = childProcess.spawn("java", args, {
            stdio: "pipe",
        });

        const handleError = (source: string) => (error: Error) => {
            console.error(`Error in ${source}:`, error);
        };

        child.on("error", (error) => {
            handleError("child")(error);
            reject(new Error(`Process error: ${error.message}`));
        });

        child.stdin?.on("error", handleError("child.stdin"));
        child.stdout?.on("error", handleError("child.stdout"));
        child.stderr?.on("error", handleError("child.stderr"));

        child.on("exit", (code: number | null) => {
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
