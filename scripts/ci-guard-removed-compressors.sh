#!/usr/bin/env bash
set -euo pipefail

# Scoped package names only ever appear in real imports/deps. Migration docs use
# bare names ("yui"), so scanning the scoped form broadly is false-positive safe.
REMOVED_PACKAGES="@node-minify/babel-minify|@node-minify/uglify-es|@node-minify/yui|@node-minify/sqwish|@node-minify/crass|@node-minify/run"
REMOVED_NAMES="babel-minify|uglify-es|yui|sqwish|crass"

# Exclusions: changelogs, deps, plans, migration guides (which intentionally name
# removed packages), changesets, the registry data, tests, and bundled dist output.
#
# Each pattern is anchored to the PATH only — `^[^:]*` consumes everything before
# the first `:` in grep's `path:line:text` output — so a removed name mentioned
# inside a matched line of code can never mask a real violation by accident.
exclude() {
  grep -vE "^[^:]*CHANGELOG" \
    | grep -vE "^[^:]*node_modules" \
    | grep -vE "^[^:]*docs/plans" \
    | grep -vE "^[^:]*v11-migration" \
    | grep -vE "^[^:]*Migrate\.md" \
    | grep -vE "^[^:]*\.changeset" \
    | grep -vE "^[^:]*compressor-registry" \
    | grep -vE "^[^:]*__tests__" \
    | grep -vE "^[^:]*/dist/"
}

# 1. Scoped @node-minify/<removed> across source, examples, the docs site, the
#    Actions, the root README, and the shipped skill/agent docs — anywhere a real
#    usage would live.
SCOPED_MATCHES=$(grep -rnE "$REMOVED_PACKAGES" \
  --include="*.ts" --include="*.js" --include="*.json" \
  --include="*.md" --include="*.mdx" --include="*.yml" --include="*.yaml" \
  packages/ examples/ docs/src/ .github/ \
  action.yml Readme.md SKILL.md AGENTS.md package.json \
  2>/dev/null | exclude || true)

# 2. Bare removed-compressor identifiers used as an Action/workflow `compressor:`
#    value. Anchored to `compressor:` so prose and migration tables don't trip it.
YAML_MATCHES=$(grep -rnE "compressor:[[:space:]]*['\"]?($REMOVED_NAMES)\b" \
  action.yml .github/ packages/action/action.yml \
  2>/dev/null | grep -vE "^[^:]*node_modules" || true)

# 3. Bare removed-compressor names anywhere in shipped, must-stay-clean surfaces:
#    CLI/Action source, the Action agent notes, the composite actions, and the
#    root skill/agent files. These must never imply a removed compressor still
#    works. Intentional "Removed (v11) ..." migration notes are allowed via the
#    line filter; the removal detector (doctor.ts) names them by design and is
#    skipped. Migration-mapping docs (docs/site, action READMEs) keep the bare
#    names with replacements on purpose and stay on the scoped scan only.
BARE_MATCHES=$(grep -rnE "\b($REMOVED_NAMES)\b" \
  --include="*.ts" --include="*.js" --include="*.md" \
  packages/cli/src/ packages/action/src/ packages/action/AGENTS.md \
  .github/actions/ SKILL.md AGENTS.md \
  2>/dev/null \
  | exclude \
  | grep -vE "^[^:]*doctor\.ts" \
  | grep -viE "removed|use instead" || true)

MATCHES=$(printf '%s\n%s\n%s' "$SCOPED_MATCHES" "$YAML_MATCHES" "$BARE_MATCHES" \
  | grep -v '^[[:space:]]*$' || true)

if [ -n "$MATCHES" ]; then
  echo "ERROR: Found references to removed packages/compressors:"
  echo "$MATCHES"
  exit 1
fi

echo "Guard passed: no removed compressor references found."
exit 0
