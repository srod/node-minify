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
# dist output.
EXCLUDE_PATHS=(
  --exclude-dir="node_modules"
  --exclude-dir="dist"
  --exclude-dir="__tests__"
  --exclude-dir=".changeset"
  --exclude-dir="plans"
  --exclude="CHANGELOG*"
  --exclude="Migrate.md"
  --exclude="v11-migration*"
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
SCOPED_MATCHES=$(grep -rnE "$REMOVED_PACKAGES" \
  "${SCOPED_INCLUDES[@]}" "${EXCLUDE_PATHS[@]}" \
  packages/ examples/ docs/src/ .github/ \
  action.yml Readme.md SKILL.md AGENTS.md package.json \
  2>/dev/null || true)

# 2. Bare removed-compressor identifiers used as an Action/workflow `compressor:`
#    value. Anchored to `compressor:` so prose and migration tables don't trip it.
YAML_MATCHES=$(grep -rnE "compressor:[[:space:]]*['\"]?($REMOVED_NAMES)\b" \
  --exclude-dir="node_modules" \
  action.yml .github/ packages/action/action.yml \
  2>/dev/null || true)

# 3a. Bare removed-compressor names in shipped CODE and action manifests: CLI and
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

# 3b. Bare removed-compressor names in shipped DOCS: the Action agent notes, the
#     composite-action READMEs, and the root skill/agent files. Documentation
#     legitimately carries "Removed (v11) ..." migration notes, so the content
#     filter exempts those lines — but ONLY for docs, never for code (see 3a).
#     Heavier migration-mapping pages (the docs site, packages/action/README.md)
#     are intentionally out of this scan and are covered only by the scoped pass
#     (#1); they do not depend on the content filter.
BARE_DOC_MATCHES=$(grep -rnE "\b($REMOVED_NAMES)\b" \
  --include="*.md" "${EXCLUDE_PATHS[@]}" \
  packages/cli/src/ packages/action/src/ .github/actions/ \
  packages/action/AGENTS.md SKILL.md AGENTS.md \
  2>/dev/null \
  | grep -viE "removed|use instead" || true)

MATCHES=$(printf '%s\n%s\n%s\n%s' \
  "$SCOPED_MATCHES" "$YAML_MATCHES" "$BARE_CODE_MATCHES" "$BARE_DOC_MATCHES" \
  | grep -v '^[[:space:]]*$' || true)

if [ -n "$MATCHES" ]; then
  echo "ERROR: Found references to removed packages/compressors:"
  echo "$MATCHES"
  exit 1
fi

echo "Guard passed: no removed compressor references found."
exit 0
