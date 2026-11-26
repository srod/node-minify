#!/usr/bin/env bun
/*! node-minify - MIT Licensed */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** A package's name and the full text of its CHANGELOG.md. */
export type PackageChangelog = { name: string; text: string };

/** Changeset bump kinds, highest first. */
export type Kind = "major" | "minor" | "patch";

/** One change, merged across every package that lists it. */
export type ReleaseEntry = {
    /** Commit hash, or undefined for an entry changesets wrote without one. */
    hash: string | undefined;
    kind: Kind;
    /** Short package names (without `@node-minify/`), sorted. */
    packages: string[];
    /** First line of the entry, without the `- <hash>: ` prefix. */
    firstLine: string;
    /** Remaining lines, kept with their original indentation. */
    rest: string[];
};

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "srod/node-minify";
const SCOPE = "@node-minify/";

const KINDS: Kind[] = ["major", "minor", "patch"];
const KIND_HEADINGS: Record<string, Kind> = {
    "### Major Changes": "major",
    "### Minor Changes": "minor",
    "### Patch Changes": "patch",
};
const SECTION_TITLES: Record<Kind, string> = {
    major: "Breaking changes",
    minor: "Features",
    patch: "Fixes and internal changes",
};

// `- abc1234: text` (changesets' default) or `- [`abc1234`](url): text` (.changeset/changelog.cjs).
const ENTRY_START = /^- (?:([0-9a-f]{7})|\[`([0-9a-f]{7})`\]\([^)]*\)): (.*)$/;
// The exact lines changesets writes for internal dependency bumps: `@changesets/changelog-git`
// (`- Updated dependencies [abc1234]`, `- @node-minify/utils@11.0.2`) and .changeset/changelog.cjs.
const DEPENDENCY_LINE =
    /^- (?:Updated dependencies(?: \[[0-9a-f]{7}\])?|Updated `@node-minify\/\*` dependencies to \S+\.|@node-minify\/[a-z0-9-]+@\S+)$/;

/**
 * Return the lines of the `## <version>` section of a changelog, up to the next `## ` heading.
 *
 * @param text - The full CHANGELOG.md text
 * @param version - The version heading to look for, such as `11.1.0`
 * @returns The lines under the heading, or an empty array when the version is absent
 */
function sectionLines(text: string, version: string): string[] {
    // A Windows checkout can turn LF into CRLF, and `.` in a RegExp does not match `\r`.
    const lines = text.split(/\r?\n/);
    const start = lines.findIndex((line) => line.trimEnd() === `## ${version}`);
    if (start === -1) {
        return [];
    }
    const end = lines.findIndex(
        (line, index) => index > start && line.startsWith("## ")
    );
    return lines.slice(start + 1, end === -1 ? undefined : end);
}

type RawEntry = { hash: string | undefined; kind: Kind; lines: string[] };

/**
 * Parse the entries of one version section, skipping dependency-bump entries.
 *
 * @param lines - The lines of the version section
 * @returns The entries, with or without a commit hash, with their continuation lines
 */
function parseSection(lines: string[]): RawEntry[] {
    const entries: RawEntry[] = [];
    let kind: Kind | undefined;
    let current: RawEntry | undefined;

    for (const line of lines) {
        if (line.startsWith("### ")) {
            kind = KIND_HEADINGS[line.trimEnd()];
            current = undefined;
            continue;
        }
        const start = ENTRY_START.exec(line);
        if (start && kind) {
            current = {
                hash: start[1] ?? start[2],
                kind,
                lines: [(start[3] ?? "").trimEnd()],
            };
            entries.push(current);
        } else if (
            kind &&
            line.startsWith("- ") &&
            !DEPENDENCY_LINE.test(line.trimEnd())
        ) {
            // changesets writes `- text` for a changeset that has no commit.
            current = { hash: undefined, kind, lines: [line.slice(2).trimEnd()] };
            entries.push(current);
        } else if (line.startsWith("- ") || /^\S/.test(line)) {
            current = undefined;
        } else if (current) {
            current.lines.push(line.trimEnd());
        }
    }

    for (const entry of entries) {
        while (entry.lines.at(-1) === "") {
            entry.lines.pop();
        }
    }
    return entries;
}

/**
 * Collect one version's entries from every package changelog, merged by commit hash.
 *
 * An entry listed by several packages becomes one entry that lists all of them.
 * Entries are matched by commit hash, or by their first line when they have no hash.
 * Its kind is the highest one any package filed it under.
 *
 * @param version - The version to collect, such as `11.1.0`
 * @param changelogs - Each package's name and CHANGELOG.md text
 * @returns The merged entries, in first-seen order
 */
export function collectEntries(
    version: string,
    changelogs: PackageChangelog[]
): ReleaseEntry[] {
    const merged = new Map<string, ReleaseEntry>();

    for (const { name, text } of changelogs) {
        const shortName = name.startsWith(SCOPE)
            ? name.slice(SCOPE.length)
            : name;
        for (const raw of parseSection(sectionLines(text, version))) {
            const key = raw.hash ?? `text:${raw.lines[0] ?? ""}`;
            const existing = merged.get(key);
            if (!existing) {
                const [firstLine = "", ...rest] = raw.lines;
                merged.set(key, {
                    hash: raw.hash,
                    kind: raw.kind,
                    packages: [shortName],
                    firstLine,
                    rest,
                });
                continue;
            }
            if (KINDS.indexOf(raw.kind) < KINDS.indexOf(existing.kind)) {
                existing.kind = raw.kind;
            }
            if (!existing.packages.includes(shortName)) {
                existing.packages.push(shortName);
            }
        }
    }

    for (const entry of merged.values()) {
        entry.packages.sort();
    }
    return [...merged.values()];
}

/**
 * Order entries by PR number ascending, entries without a PR last, then by hash, then by first line.
 *
 * @param a - First entry
 * @param b - Second entry
 * @param prNumbers - PR number per commit hash
 * @returns A negative, zero or positive number for `Array.prototype.sort`
 */
function compareEntries(
    a: ReleaseEntry,
    b: ReleaseEntry,
    prNumbers: Map<string, number>
): number {
    const prOf = (entry: ReleaseEntry) =>
        (entry.hash === undefined ? undefined : prNumbers.get(entry.hash)) ??
        Number.POSITIVE_INFINITY;
    const prA = prOf(a);
    const prB = prOf(b);
    if (prA !== prB) {
        return prA < prB ? -1 : 1;
    }
    const keyA = `${a.hash ?? "~"} ${a.firstLine}`;
    const keyB = `${b.hash ?? "~"} ${b.firstLine}`;
    return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
}

/**
 * Build the GitHub release body for one version from all package changelogs.
 *
 * @param version - The released version, such as `11.1.0`
 * @param changelogs - Each package's name and CHANGELOG.md text
 * @param prNumbers - PR number per commit hash; entries without one omit the `(#N)` suffix
 * @returns Markdown with Breaking changes, Features and Fixes sections, then a footer line
 */
export function buildReleaseNotes(
    version: string,
    changelogs: PackageChangelog[],
    prNumbers: Map<string, number> = new Map()
): string {
    const entries = collectEntries(version, changelogs);
    const footer = `All \`@node-minify/*\` npm packages are published at \`${version}\`, and the GitHub Action is released as \`v${version}\`. Each package's \`CHANGELOG.md\` has its own entries.`;
    if (entries.length === 0) {
        return footer;
    }

    const lines: string[] = [];
    for (const kind of KINDS) {
        const inKind = entries
            .filter((entry) => entry.kind === kind)
            .sort((a, b) => compareEntries(a, b, prNumbers));
        if (inKind.length === 0) {
            continue;
        }
        lines.push(`## ${SECTION_TITLES[kind]}`, "");
        for (const entry of inKind) {
            const packages = entry.packages.map((p) => `\`${p}\``).join(", ");
            const pr =
                entry.hash === undefined ? undefined : prNumbers.get(entry.hash);
            lines.push(
                `- **${packages}**${pr === undefined ? "" : ` (#${pr})`}: ${entry.firstLine}`,
                ...entry.rest
            );
        }
        lines.push("");
    }
    lines.push("---", "", footer);
    return lines.join("\n");
}

/**
 * Read the CHANGELOG.md of every workspace package.
 *
 * `@node-minify/action` is private (never on npm) but ships as the GitHub Action in
 * the same release, so its changelog is read too.
 *
 * @param packagesDir - The directory holding the workspace packages
 * @returns The name and changelog text of each package that has a CHANGELOG.md
 */
export function readChangelogs(packagesDir: string): PackageChangelog[] {
    const changelogs: PackageChangelog[] = [];
    for (const dir of readdirSync(packagesDir).sort()) {
        const pkgPath = join(packagesDir, dir, "package.json");
        const changelogPath = join(packagesDir, dir, "CHANGELOG.md");
        if (!(existsSync(pkgPath) && existsSync(changelogPath))) {
            continue;
        }
        const pkg: { name: string } = JSON.parse(
            readFileSync(pkgPath, "utf-8")
        );
        changelogs.push({
            name: pkg.name,
            text: readFileSync(changelogPath, "utf-8"),
        });
    }
    return changelogs;
}

/**
 * Look up the PR that introduced a commit through the GitHub API.
 *
 * @param hash - The commit hash
 * @returns The PR number, or undefined when the lookup fails or finds no PR
 */
export function findPrNumber(hash: string): number | undefined {
    try {
        const out = execFileSync(
            "gh",
            ["api", `repos/${REPO}/commits/${hash}/pulls`, "-q", ".[0].number"],
            { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }
        ).trim();
        const pr = Number.parseInt(out, 10);
        return Number.isInteger(pr) ? pr : undefined;
    } catch {
        return undefined;
    }
}

if (import.meta.main) {
    const version = process.argv[2];
    if (!version) {
        console.error("Usage: bun scripts/release-notes.ts <version>");
        process.exit(1);
    }
    const changelogs = readChangelogs(join(REPO_ROOT, "packages"));
    const prNumbers = new Map<string, number>();
    for (const { hash } of collectEntries(version, changelogs)) {
        if (!hash) {
            continue;
        }
        const pr = findPrNumber(hash);
        if (pr !== undefined) {
            prNumbers.set(hash, pr);
        }
    }
    console.log(buildReleaseNotes(version, changelogs, prNumbers));
}
