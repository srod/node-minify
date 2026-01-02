# Implementation Plan - Benchmark Feature for node-minify (v2)

> **Revision**: Updated based on codebase analysis. Changes from v1 marked with 🆕.

## Context

Add a benchmark feature to node-minify that allows comparing the performance of different compressors (execution time, final size, compression ratio) via CLI and programmatic API.

## Existing Infrastructure (Leverage These)

🆕 **Already available in `@node-minify/utils`:**
- `getFilesizeInBytes(file)` — returns formatted size string (e.g., "45.2 kB")
- `getFilesizeGzippedInBytes(file)` — async, returns gzipped size string
- `prettyBytes(bytes)` — formats bytes to human-readable string
- `getContentFromFilesAsync(files)` — reads file contents
- `wildcards(pattern)` — glob pattern expansion

🆕 **Already available in `@node-minify/cli`:**
- `chalk@5.6.2` — terminal colors (reuse, don't add new dep)
- `ora@9.0.0` — spinner for progress
- `commander@14.0.2` — CLI framework
- `AVAILABLE_MINIFIER` config — list of all compressors with metadata

## Architecture

### 1. New Package `@node-minify/benchmark`

**Location:** `packages/benchmark/`

**Structure:**
```
packages/benchmark/
├── src/
│   ├── index.ts                 # Main entry point, exports benchmark()
│   ├── runner.ts                # Core benchmark execution logic
│   ├── metrics.ts               # Timing and size calculations
│   ├── compressor-loader.ts     # Dynamic compressor import with validation
│   ├── reporters/
│   │   ├── index.ts             # Reporter factory
│   │   ├── console.ts           # Terminal table with colors
│   │   ├── json.ts              # JSON export
│   │   └── markdown.ts          # Markdown table export
│   └── types.ts                 # TypeScript types
├── __tests__/
│   └── benchmark.test.ts
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

### 2. Extend CLI with Subcommand

🆕 **Location:** `packages/cli/src/bin/cli.ts`

**Approach:** Add `benchmark` as a Commander.js subcommand (not modifying existing compress flow).

## Technical Specifications

### BenchmarkOptions Interface

```typescript
interface BenchmarkOptions {
    /** Files to benchmark (path, glob, or array) */
    input: string | string[];
    /** Compressors to test. If empty, auto-detect installed ones */
    compressors?: string[];
    /** Number of iterations per compressor (default: 1) */
    iterations?: number;
    /** 🆕 Warmup runs to discard (default: 1 if iterations > 1) */
    warmup?: number;
    /** Calculate gzip size */
    includeGzip?: boolean;
    /** 🆕 Calculate brotli size (requires adding utility) */
    includeBrotli?: boolean;
    /** Output format */
    format?: "console" | "json" | "markdown";
    /** Output file path (if not specified, prints to stdout) */
    output?: string;
    /** Verbose mode with per-iteration details */
    verbose?: boolean;
    /** Filter by file type */
    type?: "js" | "css" | "html";
    /** 🆕 Compressor-specific options (applied to all) */
    compressorOptions?: Record<string, unknown>;
}
```

### BenchmarkResult Interface

```typescript
interface CompressorMetrics {
    compressor: string;
    /** Output size in bytes */
    sizeBytes: number;
    /** Formatted size string */
    size: string;
    /** Execution time in milliseconds (average if multiple iterations) */
    timeMs: number;
    /** 🆕 Min/max time across iterations */
    timeMinMs?: number;
    timeMaxMs?: number;
    /** Size reduction percentage */
    reductionPercent: number;
    /** Gzip size if requested */
    gzipBytes?: number;
    gzipSize?: string;
    /** Brotli size if requested */
    brotliBytes?: number;
    brotliSize?: string;
    /** Error message if compression failed */
    error?: string;
    /** 🆕 Whether this compressor succeeded */
    success: boolean;
}

interface FileResult {
    file: string;
    originalSizeBytes: number;
    originalSize: string;
    results: CompressorMetrics[];
}

interface BenchmarkResult {
    timestamp: string;
    options: Partial<BenchmarkOptions>;
    files: FileResult[];
    summary: {
        /** Best compression ratio */
        bestCompression: string;
        /** Fastest execution */
        bestPerformance: string;
        /** 🆕 Best compression/speed ratio (calculated score) */
        recommended: string;
    };
}
```

## Implementation Phases

### Phase 0: Prerequisites 🆕

**Add missing utilities to `@node-minify/utils`:**

1. **`getFilesizeBrotliInBytes(file)`** — Similar to gzip utility
   ```typescript
   // packages/utils/src/getFilesizeBrotliInBytes.ts
   import { createReadStream } from "node:fs";
   import { constants, brotliCompress } from "node:zlib";
   import { promisify } from "node:util";
   ```

2. **`getRawFilesizeInBytes(file)`** — Returns number, not string (for calculations)
   ```typescript
   // Already have statSync, just expose raw bytes
   export const getRawFilesizeInBytes = (file: string): number => {
       return statSync(file).size;
   };
   ```

3. **Export new utilities from index.ts**

### Phase 1: Benchmark Core

1. **Create package structure**
   - `packages/benchmark/package.json` (follow terser pattern)
   - `packages/benchmark/tsconfig.json` (extend root)
   - Add to workspace in root `package.json`

2. **Implement `compressor-loader.ts`**
   ```typescript
   // Dynamic import with graceful failure
   export async function loadCompressor(name: string): Promise<Compressor | null> {
       try {
           const mod = await import(`@node-minify/${name}`);
           // Find the exported compressor function
           const exportName = COMPRESSOR_EXPORTS[name];
           return mod[exportName] ?? mod.default;
       } catch {
           return null; // Not installed
       }
   }

   export async function detectInstalledCompressors(
       type?: "js" | "css" | "html"
   ): Promise<string[]> {
       // Try importing each, return those that succeed
   }
   ```

3. **Implement `metrics.ts`**
   ```typescript
   export function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; timeMs: number }> {
       const start = performance.now();
       const result = await fn();
       return { result, timeMs: performance.now() - start };
   }

   export function calculateReduction(original: number, compressed: number): number {
       return ((original - compressed) / original) * 100;
   }

   export function calculateRecommendedScore(timeMs: number, reductionPercent: number): number {
       // Balance speed and compression (tunable weights)
       const speedScore = 1000 / (timeMs + 1); // Faster = higher
       const compressionScore = reductionPercent;
       return speedScore * 0.4 + compressionScore * 0.6;
   }
   ```

4. **Implement `runner.ts`**
   ```typescript
   export async function runBenchmark(options: BenchmarkOptions): Promise<BenchmarkResult> {
       const files = await resolveInputFiles(options.input);
       const compressors = options.compressors?.length
           ? options.compressors
           : await detectInstalledCompressors(options.type);

       const results: FileResult[] = [];

       for (const file of files) {
           const fileResult = await benchmarkFile(file, compressors, options);
           results.push(fileResult);
       }

       return {
           timestamp: new Date().toISOString(),
           options,
           files: results,
           summary: calculateSummary(results),
       };
   }
   ```

### Phase 2: Reporters

5. **Implement `reporters/console.ts`**
   - 🆕 Reuse `chalk` from CLI (peer dependency or direct import)
   - Simple ASCII table (avoid `cli-table3` bloat)
   ```typescript
   export function formatConsoleOutput(result: BenchmarkResult): string {
       // Use chalk for colors
       // Build table with fixed-width columns
       // Add emoji indicators: 🏆 ⚡ 🐢
   }
   ```

6. **Implement `reporters/json.ts`**
   - Direct JSON.stringify with formatting
   - Optional schema validation

7. **Implement `reporters/markdown.ts`**
   - Generate GFM table
   - Include metadata header

### Phase 3: CLI Integration

8. **Add benchmark subcommand to CLI**

   🆕 In `packages/cli/src/bin/cli.ts`:
   ```typescript
   import { benchmark } from "@node-minify/benchmark";

   // After existing program setup, add subcommand:
   program
       .command("benchmark <input>")
       .description("Benchmark compressors on input files")
       .option("-c, --compressors <list>", "comma-separated compressor names")
       .option("-n, --iterations <n>", "iterations per compressor", "1")
       .option("-f, --format <type>", "output: console|json|markdown", "console")
       .option("-o, --output <file>", "write results to file")
       .option("--gzip", "include gzip sizes")
       .option("--brotli", "include brotli sizes")
       .option("-t, --type <type>", "filter: js|css|html")
       .option("-v, --verbose", "show per-iteration details")
       .action(runBenchmarkCommand);

   async function runBenchmarkCommand(input: string, options: CLIBenchmarkOptions) {
       const result = await benchmark({
           input,
           compressors: options.compressors?.split(","),
           iterations: parseInt(options.iterations, 10),
           format: options.format,
           output: options.output,
           includeGzip: options.gzip,
           includeBrotli: options.brotli,
           type: options.type,
           verbose: options.verbose,
       });

       // Output handling based on format
   }
   ```

9. **Update CLI package.json**
   - Add `@node-minify/benchmark` to dependencies

### Phase 4: Tests & Documentation

10. **Unit tests** (`packages/benchmark/__tests__/`)
    - `runner.test.ts` — core logic
    - `metrics.test.ts` — calculations
    - `reporters.test.ts` — output formatting
    - Use existing fixtures from `tests/fixtures.ts`

11. **Integration test** (`tests/integration/`)
    - `cli-benchmark.integration.test.ts`

12. **Documentation**
    - `packages/benchmark/README.md`
    - Update docs site if exists

## CLI Commands

```bash
# Basic usage
node-minify benchmark src/app.js

# Specific compressors
node-minify benchmark src/app.js -c terser,esbuild,swc

# Multiple iterations for accuracy
node-minify benchmark src/app.js -c terser,esbuild -n 10

# With gzip sizes
node-minify benchmark src/app.js --gzip

# JSON output to file
node-minify benchmark src/app.js -f json -o results.json

# Markdown for docs
node-minify benchmark src/app.js -f markdown -o BENCHMARK.md

# CSS compressors only
node-minify benchmark src/styles.css -t css

# Verbose with per-iteration stats
node-minify benchmark src/app.js -n 5 -v
```

## Dependencies

### `@node-minify/benchmark/package.json`

```json
{
  "name": "@node-minify/benchmark",
  "version": "10.2.0",
  "description": "Benchmark tool for @node-minify compressors",
  "keywords": ["compressor", "minify", "benchmark", "performance"],
  "author": "Rodolphe Stoclin <srodolphe@gmail.com>",
  "homepage": "https://github.com/srod/node-minify/tree/main/packages/benchmark#readme",
  "license": "MIT",
  "type": "module",
  "engines": { "node": ">=20.0.0" },
  "directories": { "lib": "dist", "test": "__tests__" },
  "types": "./dist/index.d.ts",
  "main": "./dist/index.js",
  "exports": {
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  },
  "sideEffects": false,
  "files": ["dist/**/*"],
  "publishConfig": { "access": "public" },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/srod/node-minify.git"
  },
  "bugs": { "url": "https://github.com/srod/node-minify/issues" },
  "scripts": {
    "build": "tsdown src/index.ts",
    "check-exports": "attw --pack . --profile esm-only",
    "format:check": "biome check .",
    "lint": "biome lint .",
    "prepublishOnly": "bun run build",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "dev": "tsdown src/index.ts --watch"
  },
  "dependencies": {
    "@node-minify/core": "workspace:*",
    "@node-minify/utils": "workspace:*",
    "chalk": "5.6.2"
  },
  "devDependencies": {
    "@node-minify/types": "workspace:*",
    "@node-minify/terser": "workspace:*",
    "@node-minify/esbuild": "workspace:*",
    "@node-minify/swc": "workspace:*"
  }
}
```

🆕 **Note:** No `cli-table3` — implement simple ASCII table instead. No `glob` — use existing `@node-minify/utils` wildcards.

## Programmatic Usage

```typescript
import { benchmark } from "@node-minify/benchmark";

// Basic usage
const results = await benchmark({
    input: "src/**/*.js",
    compressors: ["terser", "esbuild", "swc"],
});

console.log(`Recommended: ${results.summary.recommended}`);
console.log(`Fastest: ${results.summary.bestPerformance}`);
console.log(`Smallest: ${results.summary.bestCompression}`);

// With all options
const results = await benchmark({
    input: ["src/app.js", "src/utils.js"],
    compressors: ["terser", "esbuild", "swc", "oxc"],
    iterations: 10,
    warmup: 2,
    includeGzip: true,
    includeBrotli: true,
    format: "json",
    output: "benchmark-results.json",
    verbose: true,
});

// Access detailed results
for (const file of results.files) {
    console.log(`\n${file.file} (${file.originalSize}):`);
    for (const r of file.results) {
        if (r.success) {
            console.log(`  ${r.compressor}: ${r.size} (${r.reductionPercent.toFixed(1)}%) in ${r.timeMs.toFixed(1)}ms`);
        } else {
            console.log(`  ${r.compressor}: FAILED - ${r.error}`);
        }
    }
}
```

## Expected Output Examples

### Console (Default)

```
🔍 Benchmarking: src/app.js (45.2 kB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compressor       Size       Reduction    Time       Gzip
─────────────────────────────────────────────────────────────
esbuild          12.3 kB    72.8%        45ms ⚡    4.5 kB
swc              12.1 kB    73.2%        67ms       4.4 kB
terser           11.8 kB    73.9%        234ms      4.3 kB
uglify-js        11.9 kB    73.7%        456ms 🐢   4.4 kB
gcc              11.5 kB    74.6%        892ms 🐢   4.2 kB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 Best compression: gcc (74.6% reduction)
⚡ Fastest: esbuild (45ms)
💡 Recommended: terser (best balance)
```

### JSON

```json
{
  "timestamp": "2026-01-02T17:50:00.000Z",
  "options": {
    "iterations": 1,
    "includeGzip": true
  },
  "files": [
    {
      "file": "src/app.js",
      "originalSizeBytes": 46284,
      "originalSize": "45.2 kB",
      "results": [
        {
          "compressor": "esbuild",
          "sizeBytes": 12595,
          "size": "12.3 kB",
          "timeMs": 45.2,
          "reductionPercent": 72.78,
          "gzipBytes": 4521,
          "gzipSize": "4.5 kB",
          "success": true
        }
      ]
    }
  ],
  "summary": {
    "bestCompression": "gcc",
    "bestPerformance": "esbuild",
    "recommended": "terser"
  }
}
```

### Markdown

```markdown
# Benchmark Results

**Generated:** 2026-01-02T17:50:00.000Z

## src/app.js (45.2 kB)

| Compressor | Size | Reduction | Time | Gzip |
|------------|------|-----------|------|------|
| esbuild | 12.3 kB | 72.8% | 45ms | 4.5 kB |
| swc | 12.1 kB | 73.2% | 67ms | 4.4 kB |
| terser | 11.8 kB | 73.9% | 234ms | 4.3 kB |
| uglify-js | 11.9 kB | 73.7% | 456ms | 4.4 kB |
| gcc | 11.5 kB | 74.6% | 892ms | 4.2 kB |

### Summary

- 🏆 **Best compression:** gcc (74.6%)
- ⚡ **Fastest:** esbuild (45ms)
- 💡 **Recommended:** terser
```

## Implementation Priority

### MVP (Must Have)

1. ✅ Core benchmark runner with timing
2. ✅ Console reporter with basic table
3. ✅ Support for terser, esbuild, swc (common JS compressors)
4. ✅ CLI `benchmark` subcommand
5. ✅ Basic tests

### Should Have

1. JSON and Markdown reporters
2. Gzip size calculation (already exists in utils)
3. Multiple iterations with min/max/avg
4. Auto-detect installed compressors
5. Warmup runs
6. Comprehensive test coverage

### Nice to Have

1. Brotli size calculation (requires new utility)
2. Progress spinner during benchmark
3. Memory usage tracking
4. Verbose per-iteration output
5. Historical comparison (save/compare runs)
6. CSS and HTML compressor support
7. Parallel benchmarking option

## Key Implementation Decisions

| Decision | Rationale |
|----------|-----------|
| Separate package | Optional dependency, testable independently, programmatic API |
| Subcommand not options | Cleaner UX, doesn't pollute main compress command |
| No cli-table3 | Avoid bloat, simple ASCII table is sufficient |
| Reuse chalk from CLI | Already a dependency, no version conflicts |
| performance.now() | High-resolution timing for accurate measurements |
| Warmup runs | JIT compilation can skew first run; discard for accuracy |
| Score-based recommendation | Balances speed vs compression with tunable weights |

## Error Handling

```typescript
// Graceful compressor failures
for (const name of compressors) {
    try {
        const compressor = await loadCompressor(name);
        if (!compressor) {
            results.push({ compressor: name, success: false, error: "Not installed" });
            continue;
        }
        // Run benchmark...
    } catch (err) {
        results.push({
            compressor: name,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}
```

## File Checklist

### New Files to Create

- [ ] `packages/benchmark/package.json`
- [ ] `packages/benchmark/tsconfig.json`
- [ ] `packages/benchmark/LICENSE`
- [ ] `packages/benchmark/README.md`
- [ ] `packages/benchmark/src/index.ts`
- [ ] `packages/benchmark/src/runner.ts`
- [ ] `packages/benchmark/src/metrics.ts`
- [ ] `packages/benchmark/src/compressor-loader.ts`
- [ ] `packages/benchmark/src/types.ts`
- [ ] `packages/benchmark/src/reporters/index.ts`
- [ ] `packages/benchmark/src/reporters/console.ts`
- [ ] `packages/benchmark/src/reporters/json.ts`
- [ ] `packages/benchmark/src/reporters/markdown.ts`
- [ ] `packages/benchmark/__tests__/benchmark.test.ts`

### Files to Modify

- [ ] `packages/cli/src/bin/cli.ts` — add benchmark subcommand
- [ ] `packages/cli/package.json` — add @node-minify/benchmark dependency
- [ ] `packages/utils/src/index.ts` — export new utilities (if adding brotli/raw size)
- [ ] Root `package.json` — add benchmark to workspaces (if not auto-detected)

### Optional New Files (Phase 0)

- [ ] `packages/utils/src/getFilesizeBrotliInBytes.ts`
- [ ] `packages/utils/src/getRawFilesizeInBytes.ts`

## Estimated Effort

| Phase | Effort | Notes |
|-------|--------|-------|
| Phase 0 (Prerequisites) | 0.5 day | Optional, can defer Brotli |
| Phase 1 (Core) | 1.5 days | Main implementation |
| Phase 2 (Reporters) | 0.5 day | Console first, others quick |
| Phase 3 (CLI) | 0.5 day | Straightforward integration |
| Phase 4 (Tests/Docs) | 1 day | Thorough coverage |
| **Total MVP** | **3-4 days** | |

## Future Extensions (Out of Scope)

- Watch mode for continuous benchmarking
- Historical comparison with trend graphs
- CI/CD integration (GitHub Actions workflow)
- Web dashboard for results visualization
- REST API for remote benchmarking
- Comparison with baseline/previous version
