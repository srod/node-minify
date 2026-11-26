/*! node-minify - MIT Licensed */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { buildReleaseNotes, readChangelogs } from "../release-notes.ts";

const FOOTER =
    "All `@node-minify/*` npm packages are published at `11.1.0`, and the GitHub Action is released as `v11.1.0`. Each package's `CHANGELOG.md` has its own entries.";

function changelog(name: string, body: string) {
    return {
        name: `@node-minify/${name}`,
        text: `# @node-minify/${name}\n\n${body}`,
    };
}

describe("buildReleaseNotes", () => {
    test("merges one commit across packages into one sorted package list", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "utils",
                "## 11.1.0\n\n### Patch Changes\n\n- aaaaaaa: Shared fix.\n"
            ),
            changelog(
                "cli",
                "## 11.1.0\n\n### Patch Changes\n\n- aaaaaaa: Shared fix.\n"
            ),
        ]);

        expect(notes).toContain("- **`cli`, `utils`**: Shared fix.");
        expect(notes.match(/Shared fix/g)).toHaveLength(1);
    });

    test("files a merged entry under the highest kind any package used", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                "## 11.1.0\n\n### Patch Changes\n\n- aaaaaaa: Both.\n"
            ),
            changelog(
                "sharp",
                "## 11.1.0\n\n### Minor Changes\n\n- aaaaaaa: Both.\n"
            ),
        ]);

        expect(notes).toContain("## Features\n\n- **`core`, `sharp`**: Both.");
        expect(notes).not.toContain("## Fixes and internal changes");
    });

    test("drops Updated dependencies entries and their package lines", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                [
                    "## 11.1.0",
                    "",
                    "### Patch Changes",
                    "",
                    "- aaaaaaa: Real change.",
                    "",
                    "- Updated dependencies [bbbbbbb]",
                    "- Updated dependencies [ccccccc]",
                    "  - @node-minify/utils@11.1.0",
                    "",
                ].join("\n")
            ),
        ]);

        expect(notes).toContain("Real change.");
        expect(notes).not.toContain("Updated dependencies");
        expect(notes).not.toContain("@node-minify/utils@11.1.0");
        expect(notes).not.toContain("bbbbbbb");
    });

    test("keeps an entry changesets wrote without a commit, merged by its text", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                "## 11.1.0\n\n### Patch Changes\n\n- No commit here.\n  Second line.\n- Updated `@node-minify/*` dependencies to 11.1.0.\n"
            ),
            changelog(
                "cli",
                "## 11.1.0\n\n### Patch Changes\n\n- No commit here.\n  Second line.\n- @node-minify/utils@11.1.0\n"
            ),
        ]);

        expect(notes).toContain(
            "- **`cli`, `core`**: No commit here.\n  Second line."
        );
        expect(notes.match(/No commit here/g)).toHaveLength(1);
        expect(notes).not.toContain("dependencies to 11.1.0");
        expect(notes).not.toContain("@node-minify/utils@11.1.0");
    });

    test("drops only the exact dependency lines, not changes that start the same way", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                [
                    "## 11.1.0",
                    "",
                    "### Patch Changes",
                    "",
                    "- Updated dependencies",
                    "- Updated dependencies [bbbbbbb]",
                    "- @node-minify/utils@11.1.0",
                    "- Updated `@node-minify/*` dependencies to 11.1.0.",
                    "- Updated dependencies to fix the lockfile.",
                    "- @node-minify/utils now exports `CompressorName`.",
                    "",
                ].join("\n")
            ),
        ]);

        expect(notes).toContain("Updated dependencies to fix the lockfile.");
        expect(notes).toContain("@node-minify/utils now exports `CompressorName`.");
        expect(notes).not.toContain("[bbbbbbb]");
        expect(notes).not.toContain("utils@11.1.0");
        expect(notes).not.toContain("dependencies to 11.1.0.");
        expect(notes.match(/^- \*\*/gm)).toHaveLength(2);
    });

    test("reads changelogs with CRLF line endings", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                "## 11.1.0\r\n\r\n### Minor Changes\r\n\r\n- aaaaaaa: Windows checkout.\r\n  Body line.\r\n"
            ),
        ]);

        expect(notes).toContain(
            "## Features\n\n- **`core`**: Windows checkout.\n  Body line.\n"
        );
        expect(notes).not.toContain("\r");
    });

    test("parses plain and linked hash entries", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                "## 11.1.0\n\n### Patch Changes\n\n- aaaaaaa: Plain format.\n"
            ),
            changelog(
                "cli",
                "## 11.1.0\n\n### Patch Changes\n\n- [`bbbbbbb`](https://github.com/srod/node-minify/commit/bbbbbbb0123456789012345678901234567890ab): Linked format.\n"
            ),
        ]);

        expect(notes).toContain("- **`core`**: Plain format.");
        expect(notes).toContain("- **`cli`**: Linked format.");
    });

    test("keeps the body lines, tables and sub-lists with their indentation", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "types",
                [
                    "## 11.1.0",
                    "",
                    "### Minor Changes",
                    "",
                    "- aaaaaaa: Deprecated exports.",
                    "",
                    "  | Package | Use instead |",
                    "  | ------- | ----------- |",
                    "  | `utils` | `other`     |",
                    "",
                    "  - sub item",
                    "    - nested item",
                    "",
                    "  Closing line.",
                    "",
                    "### Patch Changes",
                    "",
                    "- bbbbbbb: Next entry.",
                    "",
                ].join("\n")
            ),
        ]);

        expect(notes).toContain(
            [
                "- **`types`**: Deprecated exports.",
                "",
                "  | Package | Use instead |",
                "  | ------- | ----------- |",
                "  | `utils` | `other`     |",
                "",
                "  - sub item",
                "    - nested item",
                "",
                "  Closing line.",
                "",
                "## Fixes and internal changes",
            ].join("\n")
        );
    });

    test("orders sections breaking, features, fixes and omits empty ones", () => {
        const text = changelog(
            "core",
            [
                "## 11.1.0",
                "",
                "### Patch Changes",
                "",
                "- 3333333: A fix.",
                "",
                "### Major Changes",
                "",
                "- 1111111: A break.",
                "",
                "### Minor Changes",
                "",
                "- 2222222: A feature.",
                "",
            ].join("\n")
        );
        const notes = buildReleaseNotes("11.1.0", [text]);

        const headings = notes.split("\n").filter((l) => l.startsWith("## "));
        expect(headings).toEqual([
            "## Breaking changes",
            "## Features",
            "## Fixes and internal changes",
        ]);

        const onlyPatch = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                "## 11.1.0\n\n### Patch Changes\n\n- 3333333: A fix.\n"
            ),
        ]);
        expect(onlyPatch).not.toContain("## Breaking changes");
        expect(onlyPatch).not.toContain("## Features");
    });

    test("sorts by PR number, entries without a PR last, then by hash", () => {
        const notes = buildReleaseNotes(
            "11.1.0",
            [
                changelog(
                    "core",
                    [
                        "## 11.1.0",
                        "",
                        "### Patch Changes",
                        "",
                        "- ddddddd: No PR d.",
                        "- ccccccc: No PR c.",
                        "- bbbbbbb: PR 20.",
                        "- aaaaaaa: PR 7.",
                        "",
                    ].join("\n")
                ),
            ],
            new Map([
                ["aaaaaaa", 7],
                ["bbbbbbb", 20],
            ])
        );

        const order = [...notes.matchAll(/^- \*\*`core`\*\*.*$/gm)].map(
            (m) => m[0]
        );
        expect(order).toEqual([
            "- **`core`** (#7): PR 7.",
            "- **`core`** (#20): PR 20.",
            "- **`core`**: No PR c.",
            "- **`core`**: No PR d.",
        ]);
    });

    test("omits the PR suffix when no PR is known", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                "## 11.1.0\n\n### Patch Changes\n\n- aaaaaaa: No lookup.\n"
            ),
        ]);

        expect(notes).toContain("- **`core`**: No lookup.");
        expect(notes).not.toContain("(#");
    });

    test("ignores other versions' sections", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                [
                    "## 11.2.0",
                    "",
                    "### Minor Changes",
                    "",
                    "- 2222222: Newer.",
                    "",
                    "## 11.1.0",
                    "",
                    "### Patch Changes",
                    "",
                    "- 1111111: Wanted.",
                    "",
                    "## 11.0.0",
                    "",
                    "### Major Changes",
                    "",
                    "- 0000000: Older.",
                    "",
                ].join("\n")
            ),
        ]);

        expect(notes).toContain("Wanted.");
        expect(notes).not.toContain("Newer.");
        expect(notes).not.toContain("Older.");
    });

    test("ends with a rule and the footer", () => {
        const notes = buildReleaseNotes("11.1.0", [
            changelog(
                "core",
                "## 11.1.0\n\n### Patch Changes\n\n- aaaaaaa: Change.\n"
            ),
        ]);

        expect(notes.endsWith(`\n\n---\n\n${FOOTER}`)).toBe(true);
    });

    test("returns only the footer when no entry is found", () => {
        expect(
            buildReleaseNotes("11.1.0", [
                changelog(
                    "core",
                    "## 11.1.0\n\n### Patch Changes\n\n- Updated dependencies [aaaaaaa]\n  - @node-minify/utils@11.1.0\n"
                ),
                changelog("cli", "## 11.0.0\n\n- 0000000: Old.\n"),
            ])
        ).toBe(FOOTER);
        expect(buildReleaseNotes("11.1.0", [])).toBe(FOOTER);
    });
});

describe("buildReleaseNotes on the repository changelogs", () => {
    test("lists every 11.1.0 change and no dependency noise", () => {
        const packagesDir = join(
            dirname(fileURLToPath(import.meta.url)),
            "..",
            "..",
            "packages"
        );
        const notes = buildReleaseNotes("11.1.0", readChangelogs(packagesDir));

        for (const start of [
            "Drop the `gzip-size` and `chalk` dependencies",
            "Removed compressors (such as `yui`) now fail",
            "Every built-in compressor now reports",
            "`csso`, `imagemin` and `uglify-js` move from the supported tier",
            "Add `gif` as an output format",
            "Every export that v12 removes is now marked `@deprecated`",
            "Internal cleanup, no change to output.\n",
            "Internal cleanup with no change to output or reported sizes.",
            "Internal cleanup, no change to behavior.",
            "`benchmark` detects the file type from each input file's extension",
        ]) {
            expect(notes).toContain(start);
        }
        expect(notes).not.toContain("Updated dependencies");
        expect(notes).toContain("## Features");
        expect(notes).toContain("## Fixes and internal changes");
    });
});
