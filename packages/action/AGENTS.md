# packages/action/AGENTS.md

GitHub Action for node-minify. **Different build process than other packages.**

## Build (Non-Standard)

```bash
bun run build      # bun build (bundled + minified)
bun run build:ncc  # Alternative: Vercel ncc bundler
```

**NOT** tsdown like other packages. Output: `dist/index.js` (bundled).

## Structure

```
src/
├── index.ts        # Orchestrator: explicit/auto modes
├── types.ts        # ActionInputs, MinifyResult, BenchmarkResult
├── inputs.ts       # Parse GitHub Actions inputs
├── minify.ts       # Single-file compression
├── discover.ts     # File discovery (auto mode)
├── autoDetect.ts   # Type detection, compressor selection
├── outputs.ts      # Set GitHub Actions outputs
├── reporters/
│   └── summary.ts  # Markdown job summaries (3 variants)
├── compare.ts      # Base branch comparison
├── comment.ts      # PR comment posting
├── checks.ts       # Threshold validation
├── annotations.ts  # File-level warnings
├── benchmark.ts    # Benchmark orchestration
└── validate.ts     # Output path validation
```

## Dual-Mode Architecture

| Mode | Trigger | Flow |
|------|---------|------|
| **Explicit** | `input` + `output` provided | Single file → minify → report |
| **Auto** | `auto: true` | Discover → group by type → batch compress (4 concurrent) |

Both converge on same reporting pipeline.

## Key Patterns

### Internal Exports for Testing
```ts
export const _internal = { runAutoMode, runExplicitMode };
```

### Concurrency Control
```ts
const chunks = chunkArray(files, 4);
for (const chunk of chunks) {
    const results = await Promise.allSettled(chunk.map(f => minify(f)));
}
```

### Idempotent PR Comments
```ts
const COMMENT_TAG = "<!-- node-minify-report -->";
// Finds existing comment by tag, updates or creates
```

### Type-Based Compressor Selection
```ts
js → terser
css → lightningcss  
html → html-minifier
json → jsonminify
svg → svgo
```

## Reporters

| Function | Purpose |
|----------|---------|
| `generateSummary()` | Explicit mode: single/multi-file table |
| `generateAutoModeSummary()` | Auto mode: grouped by file type |
| `generateBenchmarkSummary()` | Compressor comparison with badges |

## Inputs Validation

**Type-required compressors**: `esbuild`, `yui` must have `type: "js" | "css"`

**Deprecated compressors**: `babel-minify`, `uglify-es`, `yui`, `crass`, `sqwish` emit warnings

**Path security**: `output-dir` cannot contain `..` or be absolute

## Tests

13 test files covering:
- Input parsing + validation
- Auto-detection + discovery
- Minification + metrics
- Reporters + formatting
- Threshold checks
- PR comments + annotations

## Anti-Patterns

- **Never** change concurrency limit without testing memory impact
- **Never** skip `validateOutputDir()` — prevents infinite loops
- **Never** modify `COMMENT_TAG` — breaks idempotent updates
