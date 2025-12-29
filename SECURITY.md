# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 10.x    | :white_check_mark: |
| 9.x     | :white_check_mark: |
| < 9.0   | :x:                |

## Reporting a Vulnerability

We take the security of node-minify seriously. If you believe you have found a security vulnerability, please report it to us through responsible disclosure.

### How to Report

Do **not** open a public GitHub issue for security vulnerabilities. Instead, please email: **rodolphe@2clics.net**

### What to Include

When reporting a vulnerability, please include:
- A clear description of the issue
- Steps to reproduce the issue
- Any relevant code samples or payloads
- Your assessment of the impact

### Response Timeline

- We will acknowledge receipt of your report within **72 hours**
- You can expect an initial assessment within **7 days**
- We will provide updates on the status of your report at least every **7 days**
- Once the vulnerability is confirmed, we will release a security patch as quickly as possible

### Scope

This policy applies to the node-minify monorepo and its packages:
- @node-minify/core
- All compressor packages (@node-minify/*)
- The CLI tool

Note: This does not include vulnerabilities in third-party compressors (esbuild, terser, lightningcss, etc.) - those should be reported to their respective maintainers.

### Recognition

We appreciate responsible disclosure and will credit researchers in any security advisory, unless they prefer to remain anonymous.
