/*! node-minify - MIT Licensed */

// Changesets `require()`s this file, and the root package is `"type": "module"`, so it must be `.cjs`.

/**
 * Format one changeset as a CHANGELOG entry, linking its commit.
 * Same as `@changesets/changelog-git`, except the short hash links to the full commit.
 *
 * @param {{ summary: string, commit?: string }} changeset - The changeset being released
 * @param {string} _type - The bump type (`major`, `minor` or `patch`), unused
 * @param {{ repo?: string } | null} options - The changelog options from `.changeset/config.json`
 * @returns {Promise<string>} The entry: ``- [`abc1234`](<commit url>): first line``, then indented body lines
 */
async function getReleaseLine(changeset, _type, options) {
    const [firstLine, ...futureLines] = changeset.summary
        .split("\n")
        .map((line) => line.trimEnd());
    if (!changeset.commit) {
        return withBody(`- ${firstLine}`, futureLines);
    }
    if (!options?.repo) {
        throw new Error(
            'Missing "repo" option. Add it to .changeset/config.json: ["./changelog.cjs", { "repo": "owner/name" }]'
        );
    }
    const link = `[\`${changeset.commit.slice(0, 7)}\`](https://github.com/${options.repo}/commit/${changeset.commit})`;
    return withBody(`- ${link}: ${firstLine}`, futureLines);
}

/**
 * Format the "dependencies updated" part of a package's CHANGELOG as one line.
 * All packages share one version (`fixed` group), so listing each changeset and dependency only repeats noise.
 *
 * @param {unknown[]} _changesets - The changesets that updated the dependencies, unused
 * @param {{ newVersion: string }[]} dependenciesUpdated - The internal dependencies bumped in this release
 * @returns {Promise<string>} One line naming the new version, or an empty string when no dependency changed
 */
async function getDependencyReleaseLine(_changesets, dependenciesUpdated) {
    if (dependenciesUpdated.length === 0) {
        return "";
    }
    return `- Updated \`@node-minify/*\` dependencies to ${dependenciesUpdated[0].newVersion}.`;
}

/**
 * Append the indented body lines of a changeset to its first line.
 *
 * @param {string} first - The entry's first line
 * @param {string[]} rest - The remaining summary lines
 * @returns {string} The entry, with each remaining line indented by two spaces
 */
function withBody(first, rest) {
    if (rest.length === 0) {
        return first;
    }
    return `${first}\n${rest.map((line) => `  ${line}`).join("\n")}`;
}

module.exports = { getReleaseLine, getDependencyReleaseLine };
