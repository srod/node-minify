#!/usr/bin/env bash
set -euo pipefail

# Scoped package names only ever appear in real imports/deps. Migration docs use
# bare names ("yui"), so scanning the scoped form broadly is false-positive safe.
REMOVED_PACKAGES="@node-minify/babel-minify|@node-minify/uglify-es|@node-minify/yui|@node-minify/sqwish|@node-minify/crass|@node-minify/run"

# Exclusions: changelogs, deps, plans, migration guides (which intentionally name
# removed packages), changesets, the registry data, tests, and bundled dist output.
exclude() {
  grep -v "CHANGELOG" \
    | grep -v "node_modules" \
    | grep -v "docs/plans" \
    | grep -v "v11-migration" \
    | grep -v "Migrate.md" \
    | grep -v ".changeset" \
    | grep -v "compressor-registry" \
    | grep -v "__tests__" \
    | grep -v "/dist/"
}

# 1. Scoped @node-minify/<removed> across source, examples, the docs site, the
#    Actions, and root README — anywhere a real usage would live.
SCOPED_MATCHES=$(grep -rnE "$REMOVED_PACKAGES" \
  --include="*.ts" --include="*.js" --include="*.json" \
  --include="*.md" --include="*.mdx" --include="*.yml" --include="*.yaml" \
  packages/ examples/ docs/src/ .github/ action.yml Readme.md \
  2>/dev/null | exclude || true)

# 2. Bare removed-compressor identifiers used as an Action/workflow `compressor:`
#    value. Anchored to `compressor:` so prose and migration tables don't trip it.
REMOVED_NAMES="babel-minify|uglify-es|yui|sqwish|crass"
YAML_MATCHES=$(grep -rnE "compressor:[[:space:]]*['\"]?($REMOVED_NAMES)\b" \
  action.yml .github/ packages/action/action.yml \
  2>/dev/null | grep -v "node_modules" || true)

MATCHES=$(printf '%s\n%s' "$SCOPED_MATCHES" "$YAML_MATCHES" | grep -v '^[[:space:]]*$' || true)

if [ -n "$MATCHES" ]; then
  echo "ERROR: Found references to removed packages/compressors:"
  echo "$MATCHES"
  exit 1
fi

echo "Guard passed: no removed compressor references found."
exit 0
