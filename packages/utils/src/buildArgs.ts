/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Builds arguments array based on an object.
 * @param options
 */
export function buildArgs(options: Record<string, unknown>): any {
    const args: unknown[] = [];
    Object.keys(options).forEach((key: string) => {
        if (options[key] && (options[key] as unknown) !== false) {
            args.push(`--${key}`);
        }

        if (options[key] && options[key] !== true) {
            args.push(options[key]);
        }
    });

    return args;
}
