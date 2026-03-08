---
"@node-minify/action": minor
"@node-minify/utils": minor
---

feat: add zero-config auto mode for GitHub Action with smart file discovery

Adds `auto: true` mode that automatically discovers and minifies files without explicit input/output configuration. Includes smart file type detection, default glob patterns for common source directories, and comprehensive ignore patterns. Also adds ignore patterns support to the wildcards utility function.
