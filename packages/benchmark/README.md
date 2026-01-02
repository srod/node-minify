<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/benchmark"><img src="https://img.shields.io/npm/v/@node-minify/benchmark.svg" alt="npm version"></a>
  <a href="https://npmjs.org/package/@node-minify/benchmark"><img src="https://img.shields.io/npm/dm/@node-minify/benchmark.svg" alt="npm downloads"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg" alt="code coverage"></a>
</p>

# benchmark

`benchmark` is a tool for [`node-minify`](https://github.com/srod/node-minify) to compare compressor performance.

It allows you to benchmark different compressors and compare their compression ratio, speed, and output size.

## Installation

```bash
npm install @node-minify/benchmark
```

## Usage

### Programmatic API

```js
import { benchmark } from '@node-minify/benchmark';

const results = await benchmark({
  input: 'src/app.js',
  compressors: ['terser', 'esbuild', 'swc'],
  iterations: 3,
  includeGzip: true
});

console.log(results.summary.recommended); // Best balance of speed and compression
```

### CLI

```bash
# Basic usage
node-minify benchmark src/app.js

# Compare specific compressors
node-minify benchmark src/app.js --compressors terser,esbuild,swc

# With options
node-minify benchmark src/app.js -c terser,esbuild -n 3 --gzip -t js

# Output as JSON
node-minify benchmark src/app.js -c terser,esbuild -f json

# Output as Markdown
node-minify benchmark src/app.js -c terser,esbuild -f markdown
```

## Options

| Option | CLI Flag | Description | Default |
|--------|----------|-------------|---------|
| `input` | `<input>` | File(s) to benchmark | Required |
| `compressors` | `-c, --compressors` | Comma-separated list of compressors | `terser,esbuild,swc` |
| `iterations` | `-n, --iterations` | Number of iterations | `1` |
| `format` | `-f, --format` | Output format: `console`, `json`, `markdown` | `console` |
| `output` | `-o, --output` | Output file path | stdout |
| `includeGzip` | `--gzip` | Include gzip size in results | `false` |
| `type` | `-t, --type` | File type: `js`, `css`, `html` | auto-detect |

## Output Formats

### Console (default)

```
🔍 Benchmarking: src/app.js (45.2 KB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compressor      Size      Reduction   Time      Status
──────────────────────────────────────────────────────
terser          11.8 KB   73.9%       234ms     OK
esbuild         12.3 KB   72.8%       45ms      OK
swc             12.1 KB   73.2%       67ms      OK

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 Best compression: terser
⚡ Fastest: esbuild
💡 Recommended: esbuild
```

### JSON

```json
{
  "timestamp": "2026-01-02T10:30:00Z",
  "files": [{
    "file": "src/app.js",
    "originalSizeBytes": 46284,
    "results": [
      { "compressor": "terser", "sizeBytes": 12083, "reductionPercent": 73.9, "timeMs": 234 },
      { "compressor": "esbuild", "sizeBytes": 12595, "reductionPercent": 72.8, "timeMs": 45 }
    ]
  }],
  "summary": {
    "bestCompression": "terser",
    "bestPerformance": "esbuild",
    "recommended": "esbuild"
  }
}
```

### Markdown

```markdown
# Benchmark Results

**File:** src/app.js (45.2 KB)
**Date:** 2026-01-02T10:30:00Z

| Compressor | Size | Reduction | Time |
|------------|------|-----------|------|
| terser     | 11.8 KB | 73.9% | 234ms |
| esbuild    | 12.3 KB | 72.8% | 45ms |
```

## Documentation

Visit https://node-minify.2clics.net/benchmark for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
