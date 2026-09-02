#!/usr/bin/env bash
set -euo pipefail

# Scoped package names only ever appear in real imports/deps. Migration docs use
# bare names ("yui"), so scanning the scoped form broadly is false-positive safe.
REMOVED_PACKAGES="@node-minify/babel-minify|@node-minify/uglify-es|@node-minify/yui|@node-minify/sqwish|@node-minify/crass|@node-minify/run"
REMOVED_NAMES="babel-minify|uglify-es|yui|sqwish|crass"

# Path-based exclusions applied natively by grep (--exclude-dir / --exclude): grep
# never descends into these directories and never opens these files. Filtering by
# path instead of by matched line means a removed name mentioned *inside* a line
# of code (e.g. a comment referencing node_modules or CHANGELOG) can never mask a
# real violation. These locations intentionally name removed packages: changelogs,
# deps, plans, migration guides, changesets, the registry data, tests, and bundled
# dist output. cli.md documents the doctor command, so it quotes the removed
# packages doctor reports on; its only other scoped reference is @node-minify/cli,
# which is not a removed package.
EXCLUDE_PATHS=(
  --exclude-dir="node_modules"
  --exclude-dir="dist"
  --exclude-dir="__tests__"
  --exclude-dir=".changeset"
  --exclude-dir="plans"
  --exclude="CHANGELOG*"
  --exclude="Migrate.md"
  --exclude="v11-migration*"
  --exclude="cli.md"
  --exclude="compressor-registry*"
)

SCOPED_INCLUDES=(
  --include="*.ts" --include="*.js" --include="*.json"
  --include="*.md" --include="*.mdx" --include="*.yml" --include="*.yaml"
)

# 1. Scoped @node-minify/<removed> across source, examples, the docs site, the
#    Actions, the root README/manifest, and the shipped skill/agent docs — anywhere
#    a real usage would live. Recursive directories honor EXCLUDE_PATHS; the
#    explicitly named files are hand-picked and always scanned.
#    doctor.ts is excluded for the same reason as in scan 3: it is the removal
#    detector and must name the packages it reports on, including the scoped
#    @node-minify/run form.
SCOPED_MATCHES=$(grep -rnE "$REMOVED_PACKAGES" \
  "${SCOPED_INCLUDES[@]}" "${EXCLUDE_PATHS[@]}" --exclude="doctor.ts" \
  packages/ examples/ docs/src/ .github/ \
  action.yml Readme.md SKILL.md AGENTS.md package.json \
  2>/dev/null || true)

# 2. Bare removed-compressor identifiers used as an Action/workflow `compressor:`
#    value. Anchored to `compressor:` so prose and migration tables don't trip it.
YAML_MATCHES=$(grep -rnE "compressor:[[:space:]]*['\"]?($REMOVED_NAMES)\b" \
  --exclude-dir="node_modules" \
  action.yml .github/ packages/action/action.yml \
  2>/dev/null || true)

# 3. Bare removed-compressor names in shipped CODE and action manifests: CLI and
#     Action source, the composite actions, and the JS action's YAML manifest.
#     These can never legitimately name a removed compressor, so NO content filter
#     is applied — a removed name in code or workflow YAML is always a violation.
#     `*.yml`/`*.yaml` are scanned so a composite-action reference cannot bypass
#     the guard. The removal detector (doctor.ts) names them by design and is the
#     only exception.
BARE_CODE_MATCHES=$(grep -rnE "\b($REMOVED_NAMES)\b" \
  --include="*.ts" --include="*.js" --include="*.yml" --include="*.yaml" \
  "${EXCLUDE_PATHS[@]}" --exclude="doctor.ts" \
  packages/cli/src/ packages/action/src/ .github/actions/ \
  packages/action/action.yml \
  2>/dev/null || true)

MATCHES=$(printf '%s\n%s\n%s' \
  "$SCOPED_MATCHES" "$YAML_MATCHES" "$BARE_CODE_MATCHES" \
  | grep -v '^[[:space:]]*$' || true)

if [ -n "$MATCHES" ]; then
  echo "ERROR: Found references to removed packages/compressors:"
  echo "$MATCHES"
  exit 1
fi

echo "Guard passed: no removed compressor references found."
exit 0
