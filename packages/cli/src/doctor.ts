/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import process from "node:process";
import type { CompressorEntry } from "@node-minify/utils";
import { COMPRESSOR_REGISTRY } from "@node-minify/utils";

/**
 * Severity levels for doctor findings.
 * "removed" maps to ERROR (exit 1), "legacy" maps to WARNING (exit 0).
 */
type DiagnosticSeverity = "removed" | "legacy";

/**
 * A single diagnostic finding from the doctor scan.
 */
interface Finding {
    /** Relative file path from the scanned project root */
    file: string;
    /** 1-indexed line number where the issue was found */
    line?: number;
    /** The matched package or compressor name */
    name: string;
    /** Severity: removed → ERROR, legacy → WARNING */
    severity: DiagnosticSeverity;
    /** Suggested replacement for removed compressors */
    replacement?: string;
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
const IMPORT_REGEX =
    /(?:from\s+["']|(?:require|import)\s*\(\s*["'])(@node-minify\/[^"']+)["']/g;
const COMPRESSOR_REGEX =
    /(?:^|[\s,{])["']?compressor["']?:\s*["']?([a-zA-Z][\w-]*)["']?/;

/**
 * Type guard narrowing CompressorStatus to DiagnosticSeverity.
 *
 * @param status - The compressor status string to check
 * @returns True if status is "removed" or "legacy"
 */
function isDiagnosticSeverity(status: string): status is DiagnosticSeverity {
    return status === "removed" || status === "legacy";
}

/**
 * Build a lookup map from @node-minify package names to their registry entries,
 * filtered to only removed and legacy compressors.
 *
 * @returns Map keyed by package name (e.g. "@node-minify/terser")
 */
function buildPackageNameMap(): Map<string, CompressorEntry> {
    const map = new Map<string, CompressorEntry>();
    for (const entry of COMPRESSOR_REGISTRY) {
        if (isDiagnosticSeverity(entry.status)) {
            map.set(entry.packageName, entry);
        }
    }
    return map;
}

/**
 * Build a lookup map from compressor names to their registry entries,
 * filtered to only removed and legacy compressors.
 *
 * @returns Map keyed by compressor name (e.g. "terser")
 */
function buildCompressorNameMap(): Map<string, CompressorEntry> {
    const map = new Map<string, CompressorEntry>();
    for (const entry of COMPRESSOR_REGISTRY) {
        if (isDiagnosticSeverity(entry.status)) {
            map.set(entry.name, entry);
        }
    }
    return map;
}

/**
 * Collect all source files under cwd, excluding node_modules/dist/.git etc.
 *
 * @param cwd - Root directory to scan
 * @returns Array of relative file paths matching source extensions
 */
function getSourceFiles(cwd: string): string[] {
    try {
        const entries = readdirSync(cwd, {
            recursive: true,
            encoding: "utf-8",
        });
        return entries.filter((entry) => {
            if (!SOURCE_EXTENSIONS.has(extname(entry))) return false;
            const parts = entry.split(/[\\/]/);
            return !parts.some((part) => EXCLUDED_DIRS.has(part));
        });
    } catch {
        return [];
    }
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
function getPackageJsonFiles(cwd: string): string[] {
    const result: string[] = [];

    // Always include root package.json
    const rootPkg = join(cwd, "package.json");
    if (existsSync(rootPkg)) {
        result.push(rootPkg);
    }

    // Recursively find all other package.json files
    try {
        const entries = readdirSync(cwd, {
            recursive: true,
            encoding: "utf-8",
        });
        for (const entry of entries) {
            const parts = entry.split(/[\\/]/);
            // Must be exactly "package.json", not "template-package.json" etc.
            if (parts[parts.length - 1] !== "package.json") continue;
            // Skip root (already added)
            if (parts.length === 1) continue;
            if (parts.some((part) => EXCLUDED_DIRS.has(part))) continue;
            result.push(join(cwd, entry));
        }
    } catch {
        // Ignore read errors
    }

    return result;
}

/**
 * Scanner 1: Check package.json files for removed/legacy @node-minify dependencies.
 * Recursively scans all package.json files in the project, excluding node_modules, dist, etc.
 *
 * @param cwd - Project root directory
 * @returns Array of findings for problematic dependencies
 */
function scanPackageJsonFiles(cwd: string): Finding[] {
    const findings: Finding[] = [];
    const packageMap = buildPackageNameMap();
    const packageJsonPaths = getPackageJsonFiles(cwd);

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
                    if (entry && isDiagnosticSeverity(entry.status)) {
                        findings.push({
                            file: relPath,
                            name: entry.packageName,
                            severity: entry.status,
                            replacement: entry.replacement,
                        });
                    }
                }
            }
        } catch {
            // Skip files with parse errors
        }
    }

    return findings;
}

/**
 * Scanner 2: Check source files for imports/requires of removed/legacy @node-minify packages,
 * and for compressor name assignments (e.g. `compressor: "babel-minify"`).
 * Scans all .js/.ts/.mjs/.cjs files, excluding node_modules, dist, and .git directories.
 *
 * @param cwd - Project root directory
 * @returns Array of findings with file path and line number
 */
function scanSourceImports(cwd: string): Finding[] {
    const findings: Finding[] = [];
    const packageMap = buildPackageNameMap();
    const compressorMap = buildCompressorNameMap();
    const sourceFiles = getSourceFiles(cwd);

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
                    if (entry && isDiagnosticSeverity(entry.status)) {
                        findings.push({
                            file: relPath,
                            line: i + 1,
                            name: pkgName,
                            severity: entry.status,
                            replacement: entry.replacement,
                        });
                    }
                }

                // Check compressor: "name" assignments in config objects
                const compressorMatch = COMPRESSOR_REGEX.exec(line);
                if (compressorMatch) {
                    const compressorName = compressorMatch[1];
                    if (compressorName) {
                        const entry = compressorMap.get(compressorName);
                        if (entry && isDiagnosticSeverity(entry.status)) {
                            findings.push({
                                file: relPath,
                                line: i + 1,
                                name: compressorName,
                                severity: entry.status,
                                replacement: entry.replacement,
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
    const compressorMap = buildCompressorNameMap();
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
                    if (entry && isDiagnosticSeverity(entry.status)) {
                        findings.push({
                            file: relPath,
                            line: i + 1,
                            name: compressorName,
                            severity: entry.status,
                            replacement: entry.replacement,
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
 * @returns Formatted string like "ERROR: file:line - name was removed in v11..."
 */
function formatFinding(finding: Finding): string {
    const prefix = finding.severity === "removed" ? "ERROR" : "WARNING";
    const location =
        finding.line !== undefined
            ? `${finding.file}:${finding.line}`
            : finding.file;

    if (finding.severity === "removed") {
        const replacement = finding.replacement ?? "a supported compressor";
        return `${prefix}: ${location} - ${finding.name} was removed in v11. Use ${replacement} instead.`;
    }

    return `${prefix}: ${location} - ${finding.name} is legacy tier. Consider migrating.`;
}

/**
 * Print all findings to stdout, grouped by severity (errors first, then warnings).
 * Silent when no findings exist.
 *
 * @param findings - Array of diagnostic findings to report
 */
function reportFindings(findings: Finding[]): void {
    if (findings.length === 0) return;

    const errors = findings.filter((f) => f.severity === "removed");
    const warnings = findings.filter((f) => f.severity === "legacy");

    if (errors.length > 0) {
        for (const finding of errors) {
            console.log(formatFinding(finding));
        }
    }

    if (warnings.length > 0) {
        for (const finding of warnings) {
            console.log(formatFinding(finding));
        }
    }
}

/**
 * Run the doctor diagnostic scan on a project directory.
 * Scans package.json files, source imports, and workflow YAML for removed or legacy
 * @node-minify compressor references.
 *
 * @param cwd - Project root directory to scan (defaults to process.cwd())
 * @returns Exit code: 0 if no errors (warnings are OK), 1 if removed-package errors found
 */
export async function runDoctor(cwd?: string): Promise<number> {
    const projectDir = cwd ?? process.cwd();

    const findings: Finding[] = [
        ...scanPackageJsonFiles(projectDir),
        ...scanSourceImports(projectDir),
        ...scanWorkflowYaml(projectDir),
    ];

    reportFindings(findings);

    const hasErrors = findings.some((f) => f.severity === "removed");
    return hasErrors ? 1 : 0;
}

/**
 * CLI entry point for the doctor command.
 * Runs the diagnostic scan on the current working directory and exits the process
 * with the appropriate code.
 */
export async function doctor(): Promise<void> {
    const code = await runDoctor(process.cwd());
    process.exit(code);
}
