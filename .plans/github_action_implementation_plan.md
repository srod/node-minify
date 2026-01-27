# Implementation Plan - GitHub Action for node-minify

> **Status:** ✅ Complete
> **Updated:** 2026-01-27
> **Published as:** `srod/node-minify@v1`

## Context

Create a GitHub Action that runs node-minify in CI/CD pipelines, providing:
- Automated minification of JS/CSS/HTML assets
- Detailed reporting with size statistics
- PR comments with before/after comparisons
- Job summaries with compression metrics
- Configurable thresholds for pass/fail

## Why GitHub Action (not GitHub App)?

| Approach | Complexity | Use Case |
|----------|------------|----------|
| **GitHub Action** | Low | Per-repo automation, runs on user's infrastructure |
| GitHub App | High | Cross-repo features, webhooks, OAuth, hosted service |

A GitHub Action is the right choice because:
- Users want minification in their own CI pipeline
- No need for hosted infrastructure
- Simple installation (just reference the action)
- Full access to repo files during workflow

---

## Existing Infrastructure (Leverage These)

**Already available:**
- `@node-minify/cli` — File minification with all compressors
- `@node-minify/benchmark` — Compressor comparison, timing, stats
- `@node-minify/utils` — File size calculations (`getFilesizeGzippedInBytes`, `prettyBytes`, `resolveCompressor`)
- All compressor packages — terser, esbuild, swc, lightningcss, etc.

> **DONE:** The action now imports `resolveCompressor` directly from `@node-minify/utils`. The inline implementation was removed after v10.3.0 was published.

**Already in benchmark package:**
- `reporters/json.ts` — Structured output
- `reporters/markdown.ts` — GFM tables (perfect for GitHub)
- Timing and size metrics

---

## Architecture

### Option A: Composite Action (Recommended for MVP)

A composite action using existing CLI + benchmark tools. Simple, maintainable, leverages existing code.

```
.github/actions/node-minify/
├── action.yml           # Action metadata
└── scripts/
    └── report.js        # Generate GitHub-specific outputs
```

### Option B: JavaScript Action (Full Featured)

A dedicated package with custom logic, richer integration.

```
packages/action/
├── src/
│   ├── index.ts         # Main entry point
│   ├── inputs.ts        # Parse action inputs
│   ├── minify.ts        # Minification logic (wraps core)
│   ├── compare.ts       # Before/after comparison
│   ├── reporters/
│   │   ├── summary.ts   # Job summary (GITHUB_STEP_SUMMARY)
│   │   ├── comment.ts   # PR comment via GitHub API
│   │   └── annotations.ts # File annotations
│   └── outputs.ts       # Set action outputs
├── dist/
│   └── index.js         # Bundled for action (ncc compiled)
├── action.yml
├── package.json
└── README.md
```

**Recommendation:** Start with **Option A** (composite), migrate to **Option B** if advanced features needed.

---

## Feature Specifications

### Action Inputs

```yaml
inputs:
  # Required
  input:
    description: 'Files to minify (glob pattern or path)'
    required: true
  
  # Minification options
  compressor:
    description: 'Compressor to use (terser, esbuild, swc, lightningcss, etc.)'
    required: false
    default: 'terser'
  output:
    description: 'Output path (single file or directory)'
    required: false
  options:
    description: 'Compressor-specific options (JSON string)'
    required: false
    default: '{}'
  
  # Reporting options
  report-summary:
    description: 'Add results to job summary'
    required: false
    default: 'true'
  report-pr-comment:
    description: 'Post results as PR comment'
    required: false
    default: 'false'
  report-annotations:
    description: 'Add file annotations for warnings'
    required: false
    default: 'false'
  
  # Benchmark options
  benchmark:
    description: 'Run benchmark comparison across compressors'
    required: false
    default: 'false'
  benchmark-compressors:
    description: 'Compressors to compare (comma-separated)'
    required: false
    default: 'terser,esbuild,swc'
  
  # Thresholds
  fail-on-increase:
    description: 'Fail if minified size is larger than original'
    required: false
    default: 'false'
  min-reduction:
    description: 'Minimum reduction % required (0-100)'
    required: false
    default: '0'
  
  # Advanced
  include-gzip:
    description: 'Include gzip sizes in report'
    required: false
    default: 'true'
  working-directory:
    description: 'Working directory for file operations'
    required: false
    default: '.'
```

### Action Outputs

```yaml
outputs:
  original-size:
    description: 'Original file size in bytes'
  minified-size:
    description: 'Minified file size in bytes'
  reduction-percent:
    description: 'Size reduction percentage'
  gzip-size:
    description: 'Gzipped size in bytes'
  time-ms:
    description: 'Compression time in milliseconds'
  report-json:
    description: 'Full report as JSON string'
  benchmark-winner:
    description: 'Best compressor from benchmark (if run)'
```

---

## Reporting Features

### 1. Job Summary (Primary)

Written to `$GITHUB_STEP_SUMMARY`. Rendered in workflow run UI.

```markdown
## 📦 node-minify Results

### Compression Summary

| File | Original | Minified | Reduction | Gzip | Time |
|------|----------|----------|-----------|------|------|
| `src/app.js` | 45.2 kB | 12.3 kB | 72.8% | 4.5 kB | 45ms |
| `src/utils.js` | 23.1 kB | 8.2 kB | 64.5% | 3.1 kB | 23ms |
| **Total** | **68.3 kB** | **20.5 kB** | **70.0%** | **7.6 kB** | **68ms** |

### Configuration
- **Compressor:** terser
- **Include Gzip:** true
```

### 2. PR Comment (Optional)

Posted via GitHub API when `report-pr-comment: true`.

```markdown
## 📦 node-minify Report

### Size Changes vs Base Branch

| File | Before | After | Change |
|------|--------|-------|--------|
| `src/app.js` | 12.5 kB | 12.3 kB | -1.6% ✅ |
| `src/utils.js` | 8.0 kB | 8.2 kB | +2.5% ⚠️ |

<details>
<summary>Full compression details</summary>

| File | Original | Minified | Reduction |
|------|----------|----------|-----------|
| `src/app.js` | 45.2 kB | 12.3 kB | 72.8% |
| `src/utils.js` | 23.1 kB | 8.2 kB | 64.5% |

</details>

---
*Generated by [node-minify](https://github.com/srod/node-minify) action*
```

### 3. Benchmark Report (Optional)

When `benchmark: true`, compare multiple compressors.

```markdown
## 🏁 Benchmark Results

**File:** `src/app.js` (45.2 kB)

| Compressor | Size | Reduction | Time | Gzip |
|------------|------|-----------|------|------|
| esbuild | 12.5 kB | 72.3% | 12ms ⚡ | 4.6 kB |
| swc | 12.3 kB | 72.8% | 28ms | 4.5 kB |
| terser | 12.1 kB | 73.2% | 156ms | 4.4 kB |
| oxc | 12.4 kB | 72.6% | 8ms ⚡ | 4.5 kB |

**Recommendation:** `esbuild` (best speed/compression balance)
```

### 4. Annotations (Optional)

File-level annotations for warnings/errors.

```
::warning file=src/app.js::Compression ratio below 50% (45.2%). Consider reviewing for dead code.
::error file=src/legacy.js::Minification failed: Unexpected token at line 42
```

---

## Implementation Phases

### Phase 1: MVP Composite Action

**Goal:** Working action with basic minification and job summary.

#### 1.1 Create Action Structure

```
.github/actions/node-minify/
├── action.yml
└── scripts/
    └── run.sh
```

#### 1.2 Implement `action.yml`

```yaml
name: 'node-minify'
description: 'Minify JavaScript, CSS, and HTML files with detailed reporting'
author: 'srod'
branding:
  icon: 'minimize-2'
  color: 'green'

inputs:
  input:
    description: 'Files to minify (glob pattern)'
    required: true
  compressor:
    description: |
      Compressor to use.
      Recommended: terser, esbuild, swc (fast, no Java).
      Note: 'gcc' and 'yui' require Java (pre-installed on GitHub runners).
    default: 'terser'
  output:
    description: 'Output path'
    required: false
  report-summary:
    description: 'Add results to job summary'
    default: 'true'
  include-gzip:
    description: 'Include gzip sizes'
    default: 'true'
  java-version:
    description: 'Java version for gcc/yui compressors (optional, uses runner default if not set)'
    required: false

outputs:
  original-size:
    description: 'Original size in bytes'
    value: ${{ steps.minify.outputs.original-size }}
  minified-size:
    description: 'Minified size in bytes'
    value: ${{ steps.minify.outputs.minified-size }}
  reduction-percent:
    description: 'Reduction percentage'
    value: ${{ steps.minify.outputs.reduction-percent }}

runs:
  using: 'composite'
  steps:
    # Setup Java for gcc/yui compressors (only if explicitly requested or needed)
    - name: Setup Java (for gcc/yui)
      if: inputs.java-version != '' && contains(fromJSON('["gcc", "google-closure-compiler", "yui"]'), inputs.compressor)
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: ${{ inputs.java-version }}
    
    # Warn about deprecated yui compressor
    - name: Deprecation warning (yui)
      if: inputs.compressor == 'yui'
      shell: bash
      run: |
        echo "::warning::YUI Compressor was deprecated by Yahoo in 2013. Consider using 'terser' for JS or 'lightningcss' for CSS."
    
    - name: Setup Bun
      uses: oven-sh/setup-bun@v2
      with:
        bun-version: '1.1.38'
    
    - name: Install node-minify
      shell: bash
      env:
        COMPRESSOR: ${{ inputs.compressor }}
      run: |
        bun add @node-minify/core @node-minify/$COMPRESSOR
    
    - name: Run minification
      id: minify
      shell: bash
      env:
        INPUT_PATH: ${{ inputs.input }}
        COMPRESSOR: ${{ inputs.compressor }}
        OUTPUT_PATH: ${{ inputs.output }}
      run: |
        # Run CLI and capture output
        OUTPUT_ARG=""
        if [ -n "$OUTPUT_PATH" ]; then
          OUTPUT_ARG="--output \"$OUTPUT_PATH\""
        fi
        OUTPUT=$(bunx @node-minify/cli \
          --input "$INPUT_PATH" \
          --compressor "$COMPRESSOR" \
          $OUTPUT_ARG \
          --json 2>&1)
        
        # Parse and set outputs
        echo "original-size=$(echo $OUTPUT | jq -r '.originalSize')" >> $GITHUB_OUTPUT
        echo "minified-size=$(echo $OUTPUT | jq -r '.minifiedSize')" >> $GITHUB_OUTPUT
        echo "reduction-percent=$(echo $OUTPUT | jq -r '.reduction')" >> $GITHUB_OUTPUT
    
    - name: Generate job summary
      if: inputs.report-summary == 'true'
      shell: bash
      env:
        ORIGINAL_SIZE: ${{ steps.minify.outputs.original-size }}
        MINIFIED_SIZE: ${{ steps.minify.outputs.minified-size }}
        REDUCTION_PERCENT: ${{ steps.minify.outputs.reduction-percent }}
      run: |
        cat >> $GITHUB_STEP_SUMMARY << EOF
        ## 📦 node-minify Results
        
        | Metric | Value |
        |--------|-------|
        | Original Size | $ORIGINAL_SIZE |
        | Minified Size | $MINIFIED_SIZE |
        | Reduction | $REDUCTION_PERCENT% |
        EOF
```

### Phase 2: JavaScript Action Package

**Goal:** Full-featured action with PR comments, annotations, and benchmark.

#### 2.1 Create Package Structure

```
packages/action/
├── src/
│   ├── index.ts
│   ├── inputs.ts
│   ├── minify.ts
│   ├── compare.ts
│   ├── reporters/
│   │   ├── summary.ts
│   │   ├── comment.ts
│   │   └── annotations.ts
│   └── outputs.ts
├── action.yml
├── package.json
└── tsconfig.json
```

#### 2.2 Core Implementation

```typescript
// packages/action/src/index.ts
import * as core from "@actions/core";
import * as github from "@actions/github";
import { minify } from "@node-minify/core";
import { benchmark } from "@node-minify/benchmark";
import { parseInputs } from "./inputs.ts";
import { generateSummary } from "./reporters/summary.ts";
import { postPRComment } from "./reporters/comment.ts";
import { addAnnotations } from "./reporters/annotations.ts";
import { setOutputs } from "./outputs.ts";

async function run(): Promise<void> {
    try {
        const inputs = parseInputs();
        
        // Run minification or benchmark
        const results = inputs.benchmark
            ? await runBenchmark(inputs)
            : await runMinification(inputs);
        
        // Generate reports
        if (inputs.reportSummary) {
            await generateSummary(results);
        }
        
        if (inputs.reportPRComment && github.context.payload.pull_request) {
            await postPRComment(results, inputs);
        }
        
        if (inputs.reportAnnotations) {
            addAnnotations(results);
        }
        
        // Set outputs
        setOutputs(results);
        
        // Check thresholds
        if (inputs.failOnIncrease && results.reduction < 0) {
            core.setFailed("Minified size is larger than original");
        }
        
        if (inputs.minReduction && results.reduction < inputs.minReduction) {
            core.setFailed(`Reduction ${results.reduction}% below threshold ${inputs.minReduction}%`);
        }
        
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();
```

#### 2.3 Job Summary Reporter

```typescript
// packages/action/src/reporters/summary.ts
import * as core from "@actions/core";
import { prettyBytes } from "@node-minify/utils";
import type { MinifyResult } from "../types.ts";

export async function generateSummary(results: MinifyResult): Promise<void> {
    const summary = core.summary
        .addHeading("📦 node-minify Results", 2)
        .addTable([
            [
                { data: "File", header: true },
                { data: "Original", header: true },
                { data: "Minified", header: true },
                { data: "Reduction", header: true },
                { data: "Gzip", header: true },
                { data: "Time", header: true },
            ],
            ...results.files.map((f) => [
                `\`${f.file}\``,
                prettyBytes(f.originalSize),
                prettyBytes(f.minifiedSize),
                `${f.reduction.toFixed(1)}%`,
                f.gzipSize ? prettyBytes(f.gzipSize) : "-",
                `${f.timeMs.toFixed(0)}ms`,
            ]),
        ])
        .addRaw("\n---\n")
        .addRaw(`*Compressor: ${results.compressor}*`);
    
    await summary.write();
}
```

#### 2.4 PR Comment Reporter

```typescript
// packages/action/src/reporters/comment.ts
import * as github from "@actions/github";
import * as core from "@actions/core";
import type { MinifyResult } from "../types.ts";

const COMMENT_TAG = "<!-- node-minify-report -->";

export async function postPRComment(
    results: MinifyResult,
    inputs: ActionInputs
): Promise<void> {
    const token = core.getInput("github-token") || process.env.GITHUB_TOKEN;
    if (!token) {
        core.warning("No GitHub token provided, skipping PR comment");
        return;
    }
    
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;
    const prNumber = github.context.payload.pull_request?.number;
    
    if (!prNumber) {
        core.warning("Not a pull request, skipping PR comment");
        return;
    }
    
    const body = generateCommentBody(results);
    
    // Find existing comment
    const { data: comments } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: prNumber,
    });
    
    const existingComment = comments.find((c) => c.body?.includes(COMMENT_TAG));
    
    if (existingComment) {
        await octokit.rest.issues.updateComment({
            owner,
            repo,
            comment_id: existingComment.id,
            body,
        });
    } else {
        await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: prNumber,
            body,
        });
    }
}

function generateCommentBody(results: MinifyResult): string {
    return `${COMMENT_TAG}
## 📦 node-minify Report

| File | Original | Minified | Reduction |
|------|----------|----------|-----------|
${results.files.map((f) => `| \`${f.file}\` | ${prettyBytes(f.originalSize)} | ${prettyBytes(f.minifiedSize)} | ${f.reduction.toFixed(1)}% |`).join("\n")}

---
*Generated by [node-minify](https://github.com/srod/node-minify) action*
`;
}
```

### Phase 3: Before/After Comparison

**Goal:** Compare minified sizes against base branch (for PRs).

```typescript
// packages/action/src/compare.ts
import * as exec from "@actions/exec";
import * as github from "@actions/github";

export async function compareWithBase(
    files: string[],
    inputs: ActionInputs
): Promise<ComparisonResult[]> {
    const token = core.getInput("github-token");
    const octokit = github.getOctokit(token);
    
    const baseBranch = github.context.payload.pull_request?.base.ref || "main";
    
    const results: ComparisonResult[] = [];
    
    for (const file of files) {
        // Get file from base branch
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                path: file,
                ref: baseBranch,
            });
            
            if ("content" in data) {
                const baseContent = Buffer.from(data.content, "base64").toString();
                const baseSize = baseContent.length;
                
                results.push({
                    file,
                    baseSize,
                    // currentSize will be filled after minification
                });
            }
        } catch {
            // File doesn't exist in base branch (new file)
            results.push({ file, baseSize: null });
        }
    }
    
    return results;
}
```

### Phase 4: Marketplace Publishing

#### 4.1 Action Metadata

```yaml
# action.yml (root level for marketplace)
name: 'node-minify'
description: 'Minify JS, CSS, HTML files in CI with detailed reporting and PR comments'
author: 'srod'

branding:
  icon: 'minimize-2'
  color: 'green'

inputs:
  # ... (full input list)

outputs:
  # ... (full output list)

runs:
  using: 'node20'
  main: 'packages/action/dist/index.js'
```

#### 4.2 Release Workflow

```yaml
# .github/workflows/release-action.yml
name: Release Action

on:
  push:
    tags:
      - 'action-v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v2
      
      - name: Build action
        run: |
          cd packages/action
          bun install
          bun run build
      
      - name: Commit dist
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add packages/action/dist -f
          git commit -m "Build action dist"
          git push
```

---

## Usage Examples

### Basic Minification

```yaml
name: Minify Assets
on: [push]

jobs:
  minify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Minify JavaScript
        uses: srod/node-minify@v1
        with:
          input: 'src/**/*.js'
          compressor: 'terser'
          output: 'dist/'
```

### With PR Comment and Thresholds

```yaml
name: Asset Size Check
on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Minify and Report
        uses: srod/node-minify@v1
        with:
          input: 'src/**/*.js'
          compressor: 'esbuild'
          report-summary: true
          report-pr-comment: true
          min-reduction: 50
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Benchmark Mode

```yaml
name: Compressor Benchmark
on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Benchmark Compressors
        uses: srod/node-minify@v1
        with:
          input: 'src/main.js'
          benchmark: true
          benchmark-compressors: 'terser,esbuild,swc,oxc'
          include-gzip: true
```

### Using Google Closure Compiler (gcc)

For maximum compression with advanced optimizations (requires Java):

```yaml
name: Build with GCC
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Optional: Use specific Java version (runners have Java pre-installed)
      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      
      - name: Minify with GCC
        uses: srod/node-minify@v1
        with:
          input: 'src/**/*.js'
          compressor: 'gcc'
          output: 'dist/'
          options: '{"compilation_level": "ADVANCED_OPTIMIZATIONS"}'
```

> **Note:** Google Closure Compiler provides the best compression ratios but is slower due to Java startup time. For CI where speed matters, prefer `terser` or `esbuild`.

### Full CI/CD Integration

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v2
      
      - name: Build
        run: bun run build
      
      - name: Minify Assets
        id: minify
        uses: srod/node-minify@v1
        with:
          input: 'dist/**/*.js'
          compressor: 'esbuild'
          output: 'dist/'
          report-summary: true
          report-pr-comment: ${{ github.event_name == 'pull_request' }}
          report-annotations: true
          include-gzip: true
          fail-on-increase: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: minified-assets
          path: dist/
      
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: echo "Deploy minified assets (reduction: ${{ steps.minify.outputs.reduction-percent }}%)"
```

---

## Dependencies

### `packages/action/package.json`

```json
{
  "name": "@node-minify/action",
  "version": "1.0.0",
  "description": "GitHub Action for node-minify",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "ncc build src/index.ts -o dist --source-map --license licenses.txt",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@actions/core": "^1.10.1",
    "@actions/github": "^6.0.0",
    "@actions/exec": "^1.1.1",
    "@node-minify/core": "workspace:*",
    "@node-minify/benchmark": "workspace:*",
    "@node-minify/utils": "workspace:*"
  },
  "devDependencies": {
    "@node-minify/types": "workspace:*",
    "@vercel/ncc": "^0.38.1"
  },
  "peerDependencies": {
    "@node-minify/terser": "workspace:*",
    "@node-minify/esbuild": "workspace:*"
  }
}
```

---

## File Checklist

### Phase 1 (Composite Action)

Skipped — went directly to JavaScript Action (Phase 2).

### Phase 2 (JavaScript Action)

- [x] `packages/action/package.json`
- [x] `packages/action/tsconfig.json`
- [x] `packages/action/action.yml`
- [x] `packages/action/src/index.ts`
- [x] `packages/action/src/inputs.ts`
- [x] `packages/action/src/minify.ts`
- [x] `packages/action/src/compare.ts`
- [x] `packages/action/src/outputs.ts`
- [x] `packages/action/src/types.ts`
- [x] `packages/action/src/reporters/summary.ts`
- [x] `packages/action/src/reporters/comment.ts` → `packages/action/src/comment.ts`
- [x] `packages/action/src/reporters/annotations.ts` → `packages/action/src/annotations.ts`
- [x] `packages/action/README.md`
- [x] `packages/action/__tests__/action.test.ts`

### Files Modified

- [x] Root `action.yml` (in `packages/action/action.yml`, referenced by marketplace)
- [x] `.github/workflows/test-action.yml`
- [x] Docs site: `docs/src/content/docs/github-action.md`

---

## Estimated Effort

| Phase | Effort | Notes |
|-------|--------|-------|
| Phase 1 (Composite MVP) | 0.5 day | Basic working action |
| Phase 2 (JS Action) | 2 days | Full package implementation |
| Phase 3 (Comparison) | 1 day | Base branch comparison |
| Phase 4 (Marketplace) | 0.5 day | Publishing, docs |
| **Total** | **4 days** | |

---

## Java-Based Compressors (gcc, yui)

### The Issue

Two compressors require Java Runtime Environment (JRE):

| Compressor | Java Dependency | Notes |
|------------|-----------------|-------|
| `gcc` (Google Closure Compiler) | `google-closure-compiler-java` → runs `-jar` | Active, but slow startup |
| `yui` (YUI Compressor) | Bundled `yuicompressor-2.4.7.jar` → runs `-jar` | **Deprecated since 2013** |

Both use `@node-minify/run` to execute `java -jar ...` commands.

### GitHub Runners & Java

| Runner | Java Pre-installed | Default Version |
|--------|-------------------|-----------------|
| `ubuntu-latest` | ✅ Yes | Java 11 (8, 17, 21 available) |
| `macos-latest` | ✅ Yes | Java 11 (8, 17, 21 available) |
| `windows-latest` | ✅ Yes | Java 11 (8, 17, 21 available) |

**Good news:** Java is pre-installed on all GitHub-hosted runners, so gcc/yui will work out of the box.

### Recommendations

1. **Default to pure-JS compressors** (no Java needed, faster):
   - JS: `terser`, `esbuild`, `swc`, `oxc`
   - CSS: `lightningcss`, `clean-css`, `cssnano`

2. **Document Java requirement** in action inputs:
   ```yaml
   compressor:
     description: |
       Compressor to use. Recommended: terser, esbuild, swc (fast, no Java).
       Note: 'gcc' and 'yui' require Java (pre-installed on GitHub runners).
   ```

3. **Warn about yui deprecation** in job summary if used.

4. **Optional: Explicit Java setup** for users who need a specific version:
   ```yaml
   java-version:
     description: 'Java version for gcc/yui (default: runner default)'
     required: false
   ```

### Implementation: Conditional Java Setup

For the composite action (Phase 1), add conditional Java setup:

```yaml
runs:
  using: 'composite'
  steps:
    # Conditional Java setup for gcc/yui compressors
    - name: Setup Java (for gcc/yui)
      if: contains(fromJSON('["gcc", "google-closure-compiler", "yui"]'), inputs.compressor)
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: ${{ inputs.java-version || '17' }}
    
    - name: Setup Bun
      uses: oven-sh/setup-bun@v2
      # ... rest of steps
```

For the JavaScript action (Phase 2), detect and validate:

```typescript
// packages/action/src/inputs.ts
const JAVA_COMPRESSORS = ["gcc", "google-closure-compiler", "yui"];

export function validateInputs(inputs: ActionInputs): void {
    if (JAVA_COMPRESSORS.includes(inputs.compressor)) {
        // Check if Java is available
        try {
            execSync("java -version", { stdio: "ignore" });
        } catch {
            throw new Error(
                `Compressor '${inputs.compressor}' requires Java. ` +
                `Add 'actions/setup-java@v4' before this action, or use a pure-JS compressor like 'terser' or 'esbuild'.`
            );
        }
        
        // Warn about yui deprecation
        if (inputs.compressor === "yui") {
            core.warning(
                "YUI Compressor was deprecated by Yahoo in 2013. " +
                "Consider using 'terser' for JS or 'lightningcss' for CSS."
            );
        }
    }
}
```

### Benchmark Mode with Java Compressors

When running benchmarks with gcc/yui included:

1. **First run is slow** (JVM cold start ~1-2s)
2. **Subsequent runs faster** (JVM warm)
3. **Recommendation**: Use `warmup: 1` for fair comparison

Add note in benchmark output:
```markdown
> ⚠️ `gcc` uses Java which has slower startup. Times may not reflect production performance.
```

### Updated Action Inputs

```yaml
inputs:
  compressor:
    description: |
      Compressor to use.
      
      **Recommended (fast, no dependencies):**
      - JS: terser, esbuild, swc, oxc
      - CSS: lightningcss, clean-css, cssnano, esbuild
      - HTML: html-minifier
      
      **Requires Java (pre-installed on GitHub runners):**
      - gcc (Google Closure Compiler) - advanced optimizations
      - yui (deprecated) - use terser/lightningcss instead
    default: 'terser'
  
  java-version:
    description: 'Java version for gcc/yui compressors (default: runner default, usually 11)'
    required: false
```

### Compressor Recommendation Matrix

| Use Case | Recommended | Alternative | Avoid |
|----------|-------------|-------------|-------|
| JS (speed) | `esbuild`, `swc` | `oxc` | - |
| JS (compression) | `terser` | `gcc` (needs Java) | `yui` (deprecated) |
| JS (advanced opts) | `gcc` | - | - |
| CSS (speed) | `lightningcss` | `esbuild` | - |
| CSS (features) | `cssnano` | `clean-css` | `yui` (deprecated) |
| HTML | `html-minifier` | - | - |
| CI default | `terser` or `esbuild` | - | `gcc`, `yui` |

---

## Risks & Considerations

| Risk | Mitigation |
|------|------------|
| Action size limit | Use `@vercel/ncc` to bundle; exclude unused compressors |
| GitHub API rate limits | Cache results, batch API calls |
| Token permissions | Document required permissions clearly |
| Cross-platform | Test on ubuntu, macos, windows runners |
| Bun vs Node | Support both runtimes; default to Node for compatibility |
| **Java for gcc/yui** | Pre-installed on runners; add setup-java step if specific version needed |
| **yui deprecation** | Warn in docs and job summary; recommend alternatives |

---

## Future Extensions

- **Caching**: Cache node_modules between runs
- **Delta mode**: Only minify changed files
- **Size budgets**: Fail if total size exceeds budget
- **Historical tracking**: Store results, show trends
- **Multiple compressor comparison**: Run same file through multiple compressors, pick best
- **Custom reporter plugins**: Allow users to add custom reporters
- **Slack/Discord notifications**: Alert on size regressions

---

## Success Criteria

1. ✅ Users can add action to workflow with `uses: srod/node-minify@v1`
2. ✅ Minification runs successfully in CI
3. ✅ Job summary shows compression statistics
4. ✅ PR comments show before/after comparison
5. ✅ Thresholds can fail the workflow
6. ✅ Benchmark mode compares compressors
7. ✅ Action published to GitHub Marketplace
