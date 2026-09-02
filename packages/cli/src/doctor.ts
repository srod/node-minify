/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { type Dirent, existsSync, readdirSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import process from "node:process";
import type { CompressorEntry } from "@node-minify/utils";
import { COMPRESSOR_REGISTRY } from "@node-minify/utils";

/**
 * Severity levels for doctor findings.
 * "error" exits 1; "warning" exits 0.
 */
type DiagnosticSeverity = "error" | "warning";

/**
 * Compressor registry statuses that produce a diagnostic.
 * "removed" maps to an error, "legacy" to a warning.
 */
type DiagnosticStatus = "removed" | "legacy";

/**
 * A single diagnostic finding from the doctor scan.
 */
interface Finding {
    /** Relative file path from the scanned project root */
    file: string;
    /** 1-indexed line number where the issue was found */
    line?: number;
    /** Human-readable description of the problem and its fix */
    message: string;
    /** Severity: error → exit 1, warning → exit 0 */
    severity: DiagnosticSeverity;
}

const EXCLUDED_DIRS = new Set([
    "node_modules",
    "dist",
    ".git",
    "coverage",
    "build",
    ".next",
    "__tests__",
]);
const SOURCE_EXTENSIONS = new Set([
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".mjs",
    ".cjs",
    ".mts",
    ".cts",
]);
/**
 * A @node-minify specifier reached through `from "..."`, `require("...")`,
 * `import("...")`, or a side-effect `import "..."`.
 */
const IMPORT_REGEX =
    /(?:from\s+["']|(?:require|import)\s*\(\s*["']|import\s+["'])(@node-minify\/[^"']+)["']/g;
/**
 * A `compressor:` assignment. Whitespace is allowed before the colon so
 * formatted config objects are not skipped.
 */
const COMPRESSOR_REGEX =
    /(?:^|[\s,{])["']?compressor["']?\s*:\s*["']?([a-zA-Z][\w-]*)["']?/;
/**
 * Named import or re-export block from a @node-minify package. Matches
 * multi-line forms so a wrapped list cannot slip past the type-alias scanner,
 * and `export ... from` so re-exported aliases are still reported.
 */
const NAMED_IMPORT_REGEX =
    /(?:import|export)\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["'](@node-minify\/[^"']+)["']/g;

/** Minimum Node.js major version required by v11. */
const MIN_NODE_MAJOR = 22;

/**
 * Non-compressor packages removed in v11, mapped to migration guidance.
 * Compressor removals live in COMPRESSOR_REGISTRY instead.
 */
const REMOVED_PACKAGES: Record<string, string> = {
    "@node-minify/run":
        "It was an internal Java/process-spawn helper with no public replacement; remove it from your dependencies.",
};

/** Type aliases removed in v11, mapped to their replacements. */
const REMOVED_TYPE_ALIASES: Record<string, string> = {
    CompressorReturnType: "CompressorResult",
    MinifyOptions: "Settings",
};

/** File extensions that can carry TypeScript type imports. */
const TYPE_SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts"]);

/**
 * Type guard narrowing a compressor registry status to one that is reported.
 *
 * @param status - Registry status string
 * @returns True when the status should produce a diagnostic
 */
function isDiagnosticStatus(status: string): status is DiagnosticStatus {
    return status === "removed" || status === "legacy";
}

/**
 * Build a lookup map of removed/legacy compressors keyed by the given field.
 *
 * @param key - Entry field to key by ("name" or "packageName")
 * @returns Map of diagnostic-severity entries keyed by the chosen field
 */
function buildEntryMap(
    key: "name" | "packageName"
): Map<string, CompressorEntry> {
    const map = new Map<string, CompressorEntry>();
    for (const entry of COMPRESSOR_REGISTRY) {
        if (isDiagnosticStatus(entry.status)) {
            map.set(entry[key], entry);
        }
    }
    return map;
}

/**
 * Build the message and severity for a compressor registry entry.
 *
 * @param entry - Registry entry describing the compressor
 * @param displayName - Name to show in the diagnostic (bare or scoped)
 * @returns The message and severity for the finding
 */
function describeEntry(
    entry: CompressorEntry,
    displayName: string
): { message: string; severity: DiagnosticSeverity } {
    if (entry.status === "removed") {
        const replacement = entry.replacement ?? "a supported compressor";
        return {
            message: `${displayName} was removed in v11. Use ${replacement} instead.`,
            severity: "error",
        };
    }

    return {
        message: `${displayName} is legacy tier. Consider migrating.`,
        severity: "warning",
    };
}

/**
 * Resolve the 1-indexed line number containing a character offset.
 *
 * @param content - Full file contents
 * @param index - Character offset into `content`
 * @returns 1-indexed line number
 */
function lineNumberAt(content: string, index: number): number {
    let line = 1;
    for (let i = 0; i < index && i < content.length; i++) {
        if (content[i] === "\n") line++;
    }
    return line;
}

/**
 * Report a package.json whose engines.node range still admits a Node release
 * below the v11 minimum.
 *
 * The lowest major version mentioned in the range is used, which is accurate for
 * the range styles seen in practice (">=20.0.0", "^20 || ^22", "20.x", ">=20 <24").
 *
 * @param pkg - Parsed package.json object
 * @param relPath - Relative path used in the diagnostic
 * @returns A warning finding, or undefined when the range is already v11-safe
 */
function checkNodeEngine(
    pkg: Record<string, unknown>,
    relPath: string
): Finding | undefined {
    const engines = pkg.engines;
    if (typeof engines !== "object" || engines === null) return undefined;

    const nodeRange = (engines as Record<string, unknown>).node;
    if (typeof nodeRange !== "string") return undefined;

    const majors = [...nodeRange.matchAll(/(\d+)(?:\.\d+)*/g)]
        .map((match) => Number(match[1]))
        .filter((major) => Number.isFinite(major));
    if (majors.length === 0) return undefined;

    const lowest = Math.min(...majors);
    if (lowest >= MIN_NODE_MAJOR) return undefined;

    return {
        file: relPath,
        message: `engines.node is "${nodeRange}", which allows Node ${lowest}. v11 requires Node >=${MIN_NODE_MAJOR}.`,
        severity: "warning",
    };
}

/**
 * Recursively collect files under `dir`, pruning EXCLUDED_DIRS during traversal
 * so heavy directories like node_modules are never descended into (rather than
 * walked and filtered afterwards).
 *
 * @param dir - Directory to walk
 * @param cwd - Project root used to compute relative paths
 * @param accept - Predicate deciding whether a relative file path is kept
 * @returns Relative file paths (from `cwd`) that satisfy `accept`
 */
async function collectFiles(
    dir: string,
    cwd: string,
    accept: (relativePath: string) => boolean
): Promise<string[]> {
    let entries: Dirent[];
    try {
        entries = await readdir(dir, { withFileTypes: true });
    } catch {
        return [];
    }

    const results: string[] = [];
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.has(entry.name)) continue;
            results.push(...(await collectFiles(fullPath, cwd, accept)));
        } else if (entry.isFile()) {
            const relativePath = relative(cwd, fullPath);
            if (accept(relativePath)) results.push(relativePath);
        }
    }
    return results;
}

/**
 * Collect all source files under cwd, excluding node_modules/dist/.git etc.
 *
 * @param cwd - Root directory to scan
 * @returns Array of relative file paths matching source extensions
 */
function getSourceFiles(cwd: string): Promise<string[]> {
    return collectFiles(cwd, cwd, (relativePath) =>
        SOURCE_EXTENSIONS.has(extname(relativePath))
    );
}

/**
 * Collect all GitHub Actions workflow YAML files under cwd/.github/workflows/.
 *
 * @param cwd - Root directory to scan
 * @returns Array of relative file paths to workflow files
 */
function getWorkflowFiles(cwd: string): string[] {
    const workflowDir = join(cwd, ".github", "workflows");
    if (!existsSync(workflowDir)) return [];
    try {
        const entries = readdirSync(workflowDir, { encoding: "utf-8" });
        return entries
            .filter((entry) => {
                const ext = extname(entry);
                return ext === ".yml" || ext === ".yaml";
            })
            .map((entry) => join(".github", "workflows", entry));
    } catch {
        return [];
    }
}

/**
 * Collect all package.json files under cwd, excluding node_modules/dist/.git etc.
 *
 * @param cwd - Root directory to scan
 * @returns Array of absolute file paths to package.json files
 */
async function getPackageJsonFiles(cwd: string): Promise<string[]> {
    const result: string[] = [];

    // Always include root package.json
    const rootPkg = join(cwd, "package.json");
    if (existsSync(rootPkg)) {
        result.push(rootPkg);
    }

    // Recursively find all other package.json files (root added above).
    const nested = await collectFiles(cwd, cwd, (relativePath) => {
        const parts = relativePath.split(/[\\/]/);
        // Must be exactly "package.json", not "template-package.json" etc., and
        // not the already-added root (which has a single path segment).
        return parts[parts.length - 1] === "package.json" && parts.length > 1;
    });
    for (const relativePath of nested) {
        result.push(join(cwd, relativePath));
    }

    return result;
}

/**
 * Scanner 1: Check package.json files for removed/legacy @node-minify dependencies,
 * non-compressor packages removed in v11, and an engines.node range that still
 * allows a Node release below the v11 minimum.
 * Recursively scans all package.json files in the project, excluding node_modules, dist, etc.
 *
 * @param cwd - Project root directory
 * @returns Array of findings for problematic dependencies
 */
async function scanPackageJsonFiles(cwd: string): Promise<Finding[]> {
    const findings: Finding[] = [];
    const packageMap = buildEntryMap("packageName");
    const packageJsonPaths = await getPackageJsonFiles(cwd);

    for (const pkgPath of packageJsonPaths) {
        try {
            const content = readFileSync(pkgPath, "utf-8");
            const pkg: unknown = JSON.parse(content);
            if (typeof pkg !== "object" || pkg === null) continue;

            const relPath = relative(cwd, pkgPath);
            const depSections = [
                "dependencies",
                "devDependencies",
                "peerDependencies",
                "optionalDependencies",
            ] as const;

            for (const section of depSections) {
                const deps: unknown = (pkg as Record<string, unknown>)[section];
                if (typeof deps !== "object" || deps === null) continue;

                for (const depName of Object.keys(deps)) {
                    const entry = packageMap.get(depName);
                    if (entry) {
                        findings.push({
                            file: relPath,
                            ...describeEntry(entry, entry.packageName),
                        });
                        continue;
                    }

                    const guidance = REMOVED_PACKAGES[depName];
                    if (guidance) {
                        findings.push({
                            file: relPath,
                            message: `${depName} was removed in v11. ${guidance}`,
                            severity: "error",
                        });
                    }
                }
            }

            const engineFinding = checkNodeEngine(
                pkg as Record<string, unknown>,
                relPath
            );
            if (engineFinding) findings.push(engineFinding);
        } catch {
            // Skip files with parse errors
        }
    }

    return findings;
}

/**
 * Scanner 2: Check source files for imports/requires of removed/legacy @node-minify
 * packages, for compressor name assignments (e.g. `compressor: "babel-minify"`), and
 * for removed type aliases imported from @node-minify packages.
 * Scans all .js/.ts/.mjs/.cjs files, excluding node_modules, dist, and .git directories.
 *
 * @param cwd - Project root directory
 * @returns Array of findings with file path and line number
 */
async function scanSourceImports(cwd: string): Promise<Finding[]> {
    const findings: Finding[] = [];
    const packageMap = buildEntryMap("packageName");
    const compressorMap = buildEntryMap("name");
    const sourceFiles = await getSourceFiles(cwd);

    for (const relPath of sourceFiles) {
        try {
            const fullPath = join(cwd, relPath);
            const content = readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;

                // Check import/require of @node-minify/* packages
                for (const match of line.matchAll(IMPORT_REGEX)) {
                    const pkgName = match[1];
                    if (!pkgName) continue;

                    const entry = packageMap.get(pkgName);
                    if (entry) {
                        findings.push({
                            file: relPath,
                            line: i + 1,
                            ...describeEntry(entry, pkgName),
                        });
                        continue;
                    }

                    const guidance = REMOVED_PACKAGES[pkgName];
                    if (guidance) {
                        findings.push({
                            file: relPath,
                            line: i + 1,
                            message: `${pkgName} was removed in v11. ${guidance}`,
                            severity: "error",
                        });
                    }
                }

                // Check compressor: "name" assignments in config objects
                const compressorMatch = COMPRESSOR_REGEX.exec(line);
                if (compressorMatch) {
                    const compressorName = compressorMatch[1];
                    if (compressorName) {
                        const entry = compressorMap.get(compressorName);
                        if (entry) {
                            findings.push({
                                file: relPath,
                                line: i + 1,
                                ...describeEntry(entry, compressorName),
                            });
                        }
                    }
                }
            }

            // Removed type aliases, matched across the whole file so multi-line
            // named-import blocks are covered.
            if (TYPE_SOURCE_EXTENSIONS.has(extname(relPath))) {
                for (const match of content.matchAll(NAMED_IMPORT_REGEX)) {
                    const specifiers = match[1];
                    if (!specifiers) continue;

                    for (const specifier of specifiers.split(",")) {
                        // Strip "type " prefixes and " as alias" suffixes.
                        const imported = specifier
                            .trim()
                            .replace(/^type\s+/, "")
                            .split(/\s+as\s+/)[0]
                            ?.trim();
                        if (!imported) continue;

                        const replacement = REMOVED_TYPE_ALIASES[imported];
                        if (replacement) {
                            findings.push({
                                file: relPath,
                                line: lineNumberAt(content, match.index),
                                message: `type ${imported} was removed in v11. Use ${replacement} instead.`,
                                severity: "error",
                            });
                        }
                    }
                }
            }
        } catch {
            // Skip unreadable files
        }
    }

    return findings;
}

/**
 * Scanner 3: Check GitHub Actions workflow YAML files for removed compressor names
 * in `compressor:` fields.
 *
 * @param cwd - Project root directory
 * @returns Array of findings with file path and line number
 */
function scanWorkflowYaml(cwd: string): Finding[] {
    const findings: Finding[] = [];
    const compressorMap = buildEntryMap("name");
    const workflowFiles = getWorkflowFiles(cwd);

    for (const relPath of workflowFiles) {
        try {
            const fullPath = join(cwd, relPath);
            const content = readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;
                const match = COMPRESSOR_REGEX.exec(line);
                if (match) {
                    const compressorName = match[1];
                    if (!compressorName) continue;
                    const entry = compressorMap.get(compressorName);
                    if (entry) {
                        findings.push({
                            file: relPath,
                            line: i + 1,
                            ...describeEntry(entry, compressorName),
                        });
                    }
                }
            }
        } catch {
            // Skip unreadable files
        }
    }

    return findings;
}

/**
 * Format a single finding into a human-readable diagnostic line.
 *
 * @param finding - The diagnostic finding to format
 * @returns Formatted string like "ERROR: file:line - message"
 */
function formatFinding(finding: Finding): string {
    const prefix = finding.severity === "error" ? "ERROR" : "WARNING";
    // Normalize to forward slashes so output is stable across OSes (Windows uses "\").
    const file = finding.file.replaceAll("\\", "/");
    const location =
        finding.line !== undefined ? `${file}:${finding.line}` : file;

    return `${prefix}: ${location} - ${finding.message}`;
}

/**
 * Print all findings to stdout, grouped by severity (errors first, then warnings).
 * Silent when no findings exist.
 *
 * @param findings - Array of diagnostic findings to report
 */
function reportFindings(findings: Finding[]): void {
    const errors = findings.filter((f) => f.severity === "error");
    const warnings = findings.filter((f) => f.severity === "warning");

    for (const finding of [...errors, ...warnings]) {
        console.log(formatFinding(finding));
    }
}

/**
 * Run the doctor diagnostic scan on a project directory.
 * Scans package.json files (dependencies and engines.node), source imports and
 * type imports, and workflow YAML for v11 migration issues.
 *
 * @param cwd - Project root directory to scan (defaults to process.cwd())
 * @returns Exit code: 0 if no errors (warnings are OK), 1 if errors found
 */
export async function runDoctor(cwd?: string): Promise<number> {
    const projectDir = cwd ?? process.cwd();

    const findings: Finding[] = [
        ...(await scanPackageJsonFiles(projectDir)),
        ...(await scanSourceImports(projectDir)),
        ...scanWorkflowYaml(projectDir),
    ];

    reportFindings(findings);

    const hasErrors = findings.some((f) => f.severity === "error");
    return hasErrors ? 1 : 0;
}

/**
 * CLI entry point for the doctor command.
 * Runs the diagnostic scan on the current working directory and exits the process
 * with the appropriate code.
 *
 * @returns A promise that does not resolve normally; the process exits with code
 *   0 (no errors) or 1 (removed-package errors found).
 */
export async function doctor(): Promise<void> {
    const code = await runDoctor(process.cwd());
    process.exit(code);
}
