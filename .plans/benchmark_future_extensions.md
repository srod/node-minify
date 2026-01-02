# Benchmark Future Extensions

> **Status:** These features are out of scope for the initial implementation but documented here for future consideration.

## 1. Memory Usage Tracking

**What:** Track peak memory (heap) used by each compressor during minification.

**Why useful:** Some compressors (like Google Closure Compiler) use significantly more memory than others. Important for CI environments with limited RAM, or when processing large bundles.

**How it would work:**

```typescript
const before = process.memoryUsage().heapUsed;
await minify(...);
const after = process.memoryUsage().heapUsed;
metrics.memoryDeltaMB = (after - before) / 1024 / 1024;
```

**Output example:**

```
Compressor      Size       Time       Memory
─────────────────────────────────────────────
terser          11.8 kB    234ms      45 MB
esbuild         12.3 kB    45ms       12 MB
gcc             11.5 kB    892ms      180 MB
```

**Effort:** ~0.5 day

---

## 2. Historical Comparison

**What:** Save benchmark results to a file (e.g., `.benchmark-history.json`) and compare current run against previous runs.

**Why useful:** Track performance regressions over time. Detect if a new version of terser is slower, or if code changes made compression worse.

**CLI usage:**

```bash
node-minify benchmark src/app.js --save              # Save result
node-minify benchmark src/app.js --compare           # Compare to last saved
node-minify benchmark src/app.js --baseline v1       # Compare to named baseline
node-minify benchmark src/app.js --history           # Show all saved runs
```

**Output example:**

```
Comparing to baseline (2026-01-01):

Compressor   Size (before → after)     Time (before → after)
────────────────────────────────────────────────────────────
terser       11.5 kB → 12.1 kB         220ms → 234ms
             (+5.2% regression ⚠️)      (+6.4% slower ⚠️)

esbuild      12.3 kB → 12.3 kB         48ms → 42ms
             (no change)               (-12.5% faster ✅)
```

**Implementation details:**

- Store results in `.node-minify/benchmark-history.json`
- Each entry has timestamp, git commit hash (if available), and full results
- Support naming baselines (e.g., "v1.0.0", "before-refactor")
- Configurable thresholds for regression warnings

**Effort:** ~1-2 days

---

## 3. Parallel Benchmarking Option

**What:** Run multiple compressors simultaneously instead of sequentially.

**Why useful:** Faster total benchmark time when testing many compressors. Currently we run terser, then esbuild, then swc sequentially.

**Trade-off:** May affect timing accuracy due to CPU contention. Best for quick comparisons, not precise measurements.

**CLI usage:**

```bash
node-minify benchmark src/app.js --parallel
node-minify benchmark src/app.js --parallel --concurrency 4
```

**Implementation:**

```typescript
if (options.parallel) {
    const results = await Promise.all(
        compressors.map(c => benchmarkCompressor(file, c, options))
    );
} else {
    // Current sequential approach
    for (const c of compressors) {
        results.push(await benchmarkCompressor(file, c, options));
    }
}
```

**Considerations:**

- Default concurrency should match CPU cores
- Add warning in output: "⚠️ Parallel mode - timing may be less accurate"
- Useful for size comparisons, less useful for timing comparisons

**Effort:** ~0.5 day

---

## 4. Watch Mode

**What:** Continuously re-run benchmark when source files change.

**Why useful:** During optimization work - edit code, instantly see impact on bundle size and compression time.

**CLI usage:**

```bash
node-minify benchmark src/app.js --watch
node-minify benchmark src/app.js --watch --debounce 500
```

**Implementation:**

```typescript
import { watch } from "chokidar";

if (options.watch) {
    const watcher = watch(inputFiles, { ignoreInitial: true });
    
    watcher.on("change", async (path) => {
        console.clear();
        console.log(`File changed: ${path}\n`);
        await runBenchmark(options);
    });
    
    console.log("Watching for changes... (Ctrl+C to exit)\n");
    await runBenchmark(options);
}
```

**Features:**

- Clear console on each run for clean output
- Show which file triggered the re-run
- Debounce rapid changes (default 300ms)
- Support glob patterns

**Effort:** ~1 day

---

## 5. CI/CD Integration

**What:** GitHub Action / workflow that runs benchmarks on PRs and posts results as comments.

**Why useful:** Automated performance monitoring. Block PRs that increase bundle size beyond threshold.

### GitHub Action Workflow

```yaml
# .github/workflows/benchmark.yml
name: Benchmark

on:
  pull_request:
    paths:
      - 'src/**'
      - 'package.json'

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v1
      
      - run: bun install
      
      - name: Run benchmark
        run: |
          bun run node-minify benchmark src/app.js \
            -c terser,esbuild,swc \
            -f json \
            -o benchmark.json
      
      - name: Compare to main
        uses: benchmark-action/github-action-benchmark@v1
        with:
          tool: 'customSmallerIsBetter'
          output-file-path: benchmark.json
          github-token: ${{ secrets.GITHUB_TOKEN }}
          comment-on-alert: true
          alert-threshold: '110%'  # Fail if 10% regression
```

### Custom CLI Flags

```bash
node-minify benchmark src/app.js --ci              # Machine-readable output
node-minify benchmark src/app.js --fail-on-regression 5  # Exit code 1 if >5% worse
node-minify benchmark src/app.js --github-comment  # Format for GH comment
```

### PR Comment Example

```markdown
## 📊 Benchmark Results

| Compressor | Size | vs main |
|------------|------|---------|
| terser | 11.8 kB | +2.1% ⚠️ |
| esbuild | 12.3 kB | -0.5% ✅ |
| swc | 12.1 kB | +0.2% |

<details>
<summary>Full results</summary>

... detailed table ...

</details>
```

**Effort:** ~1 day for workflow, ~2 days for custom action

---

## 6. Web Dashboard

**What:** Visual web interface to view and compare benchmark results over time with charts.

**Why useful:** Better visualization than terminal tables. Share results with team. Track trends over time.

### Option A: Static Dashboard

Generate a standalone HTML file with embedded results:

```bash
node-minify benchmark src/app.js --dashboard results.html
open results.html
```

Features:
- Single HTML file with embedded CSS/JS
- Bar charts for size comparison
- Line charts for historical trends (if history available)
- Sortable/filterable table
- No server required

### Option B: Live Dashboard

Start a local web server with real-time updates:

```bash
node-minify benchmark src/app.js --serve
# Opens http://localhost:3000
```

Features:
- WebSocket for live updates in watch mode
- Compare multiple benchmark runs
- Export as PNG/PDF

### Option C: Hosted Service

Push results to a hosted dashboard:

```bash
node-minify benchmark src/app.js --upload --project my-app
# Results at: https://benchmark.node-minify.dev/my-app
```

Features:
- Team access with sharing links
- Historical data storage
- Trend alerts via email/Slack

**Technology choices:**

- Static: Vanilla JS + Chart.js (no build step)
- Live: Express + WebSocket + React/Vue
- Hosted: Cloudflare Workers + D1 database

**Effort:** 
- Static dashboard: ~2-3 days
- Live dashboard: ~3-5 days
- Hosted service: ~1-2 weeks

---

## Priority Matrix

| Feature | Value | Effort | Priority |
|---------|-------|--------|----------|
| Historical Comparison | High | Medium | ⭐⭐⭐ |
| Memory Usage | Medium | Low | ⭐⭐⭐ |
| CI/CD Integration | High | Medium | ⭐⭐ |
| Parallel Benchmarking | Low | Low | ⭐⭐ |
| Watch Mode | Medium | Low | ⭐ |
| Web Dashboard | Medium | High | ⭐ |

## Recommended Implementation Order

1. **Memory Usage Tracking** - Quick win, useful data
2. **Historical Comparison** - High value for ongoing development
3. **CI/CD Integration** - Important for team workflows
4. **Parallel Benchmarking** - Simple addition
5. **Watch Mode** - Nice to have for active development
6. **Web Dashboard** - Only if there's strong demand

## Notes

- All features should be opt-in via CLI flags
- Maintain backward compatibility with existing API
- Each feature should have its own tests
- Update documentation for each new feature
