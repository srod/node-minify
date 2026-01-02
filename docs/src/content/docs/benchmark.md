---
title: "Benchmark"
description: "Compare compressor performance with node-minify"
---

The benchmark feature allows you to compare the performance of different compressors. It measures compression ratio, speed, and output size to help you choose the best compressor for your needs.

## Installation

```bash
npm install @node-minify/benchmark
```

Or use it via the CLI (included with `@node-minify/cli`):

```bash
npm install -g @node-minify/cli
```

## CLI Usage

### Basic Usage

```bash
node-minify benchmark src/app.js
```

### Compare Specific Compressors

```bash
node-minify benchmark src/app.js --compressors terser,esbuild,swc
```

### With Options

```bash
# Run 3 iterations for more accurate timing
node-minify benchmark src/app.js -c terser,esbuild -n 3

# Include gzip size in results
node-minify benchmark src/app.js -c terser,esbuild --gzip

# Specify file type (required for esbuild, lightningcss)
node-minify benchmark src/app.js -c terser,esbuild -t js
```

### Output Formats

```bash
# Console output (default) - colored table
node-minify benchmark src/app.js -f console

# JSON output - machine readable
node-minify benchmark src/app.js -f json

# Markdown output - for documentation
node-minify benchmark src/app.js -f markdown
```

### Save to File

```bash
node-minify benchmark src/app.js -f json -o results.json
node-minify benchmark src/app.js -f markdown -o BENCHMARK.md
```

## Programmatic API

### Basic Usage

```js
import { benchmark } from '@node-minify/benchmark';

const results = await benchmark({
  input: 'src/app.js',
  compressors: ['terser', 'esbuild', 'swc']
});

console.log(results.summary.recommended);
```

### With Options

```js
import { benchmark, getReporter } from '@node-minify/benchmark';

const results = await benchmark({
  input: 'src/**/*.js',
  compressors: ['terser', 'esbuild', 'swc', 'uglify-js'],
  iterations: 3,        // Run each compressor 3 times
  warmup: 1,            // Warmup run before timing
  includeGzip: true,    // Include gzip size
  type: 'js'            // File type
});

// Use a reporter to format output
const consoleOutput = getReporter('console')(results);
console.log(consoleOutput);

// Or access results directly
for (const file of results.files) {
  console.log(`File: ${file.file} (${file.originalSize})`);
  for (const result of file.results) {
    if (result.success) {
      console.log(`  ${result.compressor}: ${result.size} (${result.reductionPercent}%)`);
    }
  }
}
```

## Options Reference

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `input` | `string \| string[]` | File(s) or glob pattern to benchmark | Required |
| `compressors` | `string[]` | List of compressor names | `['terser', 'esbuild', 'swc']` |
| `iterations` | `number` | Number of iterations per compressor | `1` |
| `warmup` | `number` | Warmup runs before timing | `1` if iterations > 1 |
| `includeGzip` | `boolean` | Include gzip size in results | `false` |
| `includeBrotli` | `boolean` | Include brotli size in results | `false` |
| `format` | `string` | Output format: `console`, `json`, `markdown` | `console` |
| `output` | `string` | Output file path | stdout |
| `type` | `string` | File type: `js`, `css`, `html` | auto-detect |

## Result Structure

```typescript
interface BenchmarkResult {
  timestamp: string;
  options: BenchmarkOptions;
  files: FileResult[];
  summary: {
    bestCompression: string;  // Smallest output
    bestPerformance: string;  // Fastest
    recommended: string;      // Best balance
  };
}

interface FileResult {
  file: string;
  originalSizeBytes: number;
  originalSize: string;
  results: CompressorMetrics[];
}

interface CompressorMetrics {
  compressor: string;
  sizeBytes: number;
  size: string;
  timeMs: number;
  reductionPercent: number;
  gzipSize?: string;
  success: boolean;
  error?: string;
}
```

## Example Output

### Console Format

```
🔍 Benchmarking: src/app.js (45.2 KB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compressor      Size      Reduction   Time      Status
──────────────────────────────────────────────────────
esbuild         12.3 KB   72.8%       45ms      OK
terser          11.8 KB   73.9%       234ms     OK
swc             12.1 KB   73.2%       67ms      OK
uglify-js       11.9 KB   73.7%       456ms     OK

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 Best compression: terser
⚡ Fastest: esbuild
💡 Recommended: esbuild
```

### JSON Format

```json
{
  "timestamp": "2026-01-02T10:30:00Z",
  "options": {
    "input": "src/app.js",
    "compressors": ["terser", "esbuild"]
  },
  "files": [{
    "file": "src/app.js",
    "originalSizeBytes": 46284,
    "originalSize": "45.2 KB",
    "results": [
      {
        "compressor": "terser",
        "sizeBytes": 12083,
        "size": "11.8 KB",
        "timeMs": 234,
        "reductionPercent": 73.9,
        "success": true
      },
      {
        "compressor": "esbuild",
        "sizeBytes": 12595,
        "size": "12.3 KB",
        "timeMs": 45,
        "reductionPercent": 72.8,
        "success": true
      }
    ]
  }],
  "summary": {
    "bestCompression": "terser",
    "bestPerformance": "esbuild",
    "recommended": "esbuild"
  }
}
```

### Markdown Format

```markdown
# Benchmark Results

**File:** src/app.js (45.2 KB)
**Date:** 2026-01-02T10:30:00Z

| Compressor | Size | Reduction | Time |
|------------|------|-----------|------|
| terser     | 11.8 KB | 73.9% | 234ms |
| esbuild    | 12.3 KB | 72.8% | 45ms |

## Summary

- 🏆 **Best compression:** terser
- ⚡ **Fastest:** esbuild
- 💡 **Recommended:** esbuild
```

## Supported Compressors

### JavaScript
- `terser` - Recommended, modern and well-maintained
- `esbuild` - Extremely fast, also handles CSS
- `swc` - Rust-based, very fast
- `oxc` - Rust-based, cutting-edge
- `uglify-js` - Classic, battle-tested
- `google-closure-compiler` - Advanced optimizations

### CSS
- `lightningcss` - Rust-based, fastest
- `esbuild` - Also handles JS
- `clean-css` - Feature-rich
- `cssnano` - PostCSS-based
- `csso` - Structural optimizations

## Tips

1. **Use multiple iterations** for more accurate timing results
2. **Warmup runs** help avoid JIT compilation overhead
3. **Include gzip size** for realistic production comparisons
4. **Specify file type** when using compressors like esbuild that require it
